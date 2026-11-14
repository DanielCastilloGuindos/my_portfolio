// apps/portfolio/src/lib/video-scrubber.ts
// Multi-buffer video controller for timeline experiences.
// Pre-binds all video elements to prevent network stalls and .src swapping during scroll.

import gsap from 'gsap';

export interface VideoScrubberOptions {
  lerpFactor?: number;
  crossfadeDuration?: number;
}

export class VideoScrubController {
  private videos: HTMLVideoElement[] = [];
  private activeIndex: number = -1;
  private targetTimes: number[] = [];
  private smoothedTimes: number[] = [];
  private readonly lerpFactor: number;
  private readonly crossfadeDuration: number;
  private tickerFn: (() => void) | null = null;

  constructor(options?: VideoScrubberOptions) {
    this.lerpFactor = options?.lerpFactor ?? 0.16;
    this.crossfadeDuration = options?.crossfadeDuration ?? 0.65;
    this.initTicker();
  }

  /**
   * Binds preloaded video elements and primes their decoders with the first frame
   */
  public bindVideos(elements: (HTMLVideoElement | null)[]): void {
    this.videos = elements.filter((v): v is HTMLVideoElement => v !== null);
    this.targetTimes = new Array(this.videos.length).fill(0);
    this.smoothedTimes = new Array(this.videos.length).fill(0);

    this.videos.forEach((video) => {
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.pause();

      const primeVideo = () => {
        if (!isNaN(video.duration) && video.duration > 0 && video.currentTime === 0) {
          try {
            video.currentTime = 0.05;
          } catch {}
        }
      };

      if (video.readyState >= 1) {
        primeVideo();
      } else {
        video.addEventListener('loadedmetadata', primeVideo, { once: true });
      }

      try {
        video.load();
      } catch {}
    });
  }

  /**
   * Crossfades to active video by index.
   * In desktop scroll mode, videos remain paused and scrub via ticker.
   * In mobile mode ({ play: true }), the active video plays natively.
   */
  public switchIndex(index: number, options?: { play?: boolean }): void {
    if (index < 0 || index >= this.videos.length) return;
    if (this.activeIndex === index) {
      if (options?.play && this.videos[index] && this.videos[index].paused) {
        this.videos[index].play().catch(() => {});
      }
      return;
    }

    this.activeIndex = index;

    this.videos.forEach((video, i) => {
      if (i === index) {
        if (options?.play) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
        gsap.to(video, {
          autoAlpha: 0.45,
          duration: this.crossfadeDuration,
          ease: 'power2.inOut',
          overwrite: 'auto',
        });
      } else {
        video.pause();
        gsap.to(video, {
          autoAlpha: 0,
          duration: this.crossfadeDuration,
          ease: 'power2.inOut',
          overwrite: 'auto',
        });
      }
    });
  }

  /**
   * Updates target time for active video according to milestone scroll progress
   */
  public setProgress(index: number, progress: number): void {
    if (index < 0 || index >= this.videos.length) return;
    const video = this.videos[index];
    if (!video || isNaN(video.duration) || video.duration <= 0) return;

    this.targetTimes[index] = Math.max(0, Math.min(video.duration, progress * video.duration));
  }

  public playActive(): void {
    if (this.activeIndex >= 0 && this.videos[this.activeIndex]) {
      this.videos[this.activeIndex].play().catch(() => {});
    }
  }

  public pauseAll(): void {
    this.videos.forEach((v) => v.pause());
  }

  public getActiveIndex(): number {
    return this.activeIndex;
  }

  /**
   * Numeric proxy lerp loop running in gsap.ticker.
   * Only scrubs currentTime when video is paused (desktop scrub mode).
   */
  private initTicker(): void {
    this.tickerFn = () => {
      if (this.activeIndex < 0 || !this.videos[this.activeIndex]) return;

      const i = this.activeIndex;
      const video = this.videos[i];
      if (!video || isNaN(video.duration) || video.duration <= 0) return;

      // When video is playing natively, let browser clock handle frames
      if (!video.paused) return;

      const target = this.targetTimes[i] ?? 0;
      let smoothed = this.smoothedTimes[i] ?? 0;
      smoothed += (target - smoothed) * this.lerpFactor;
      this.smoothedTimes[i] = smoothed;

      const delta = Math.abs(video.currentTime - smoothed);
      if (delta > 0.02 && !video.seeking && video.readyState >= 2) {
        video.currentTime = smoothed;
      }
    };

    gsap.ticker.add(this.tickerFn);
  }

  /**
   * Teardown and detach from GSAP ticker
   */
  public destroy(): void {
    if (this.tickerFn) {
      gsap.ticker.remove(this.tickerFn);
      this.tickerFn = null;
    }
    this.videos.forEach((v) => {
      v.pause();
    });
    this.videos = [];
    this.activeIndex = -1;
  }
}
