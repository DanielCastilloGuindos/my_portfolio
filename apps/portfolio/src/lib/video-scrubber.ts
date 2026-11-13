// apps/portfolio/src/lib/video-scrubber.ts
// Robust video scrubbing controller using numeric proxy lerp inside gsap.ticker.
// Avoids requestVideoFrameCallback stalls on paused video and ensures non-blocking seeking.

import gsap from 'gsap';

export interface VideoScrubberOptions {
  lerpFactor?: number;
  crossfadeDuration?: number;
}

export class VideoScrubController {
  private videoA: HTMLVideoElement | null = null;
  private videoB: HTMLVideoElement | null = null;
  private activeSlot: 'A' | 'B' = 'A';
  private activeUrl: string | null = null;

  private targetTime: number = 0;
  private smoothedTime: number = 0;
  private readonly lerpFactor: number;
  private readonly crossfadeDuration: number;
  private tickerFn: (() => void) | null = null;

  constructor(options?: VideoScrubberOptions) {
    this.lerpFactor = options?.lerpFactor ?? 0.14;
    this.crossfadeDuration = options?.crossfadeDuration ?? 0.65;
    this.initTicker();
  }

  /**
   * Binds the dual-buffer video elements
   */
  public bindVideos(a: HTMLVideoElement | null, b: HTMLVideoElement | null): void {
    this.videoA = a;
    this.videoB = b;
    if (this.videoA) {
      this.videoA.muted = true;
      this.videoA.playsInline = true;
      this.videoA.preload = 'auto';
    }
    if (this.videoB) {
      this.videoB.muted = true;
      this.videoB.playsInline = true;
      this.videoB.preload = 'auto';
    }
  }

  private getActiveVideo(): HTMLVideoElement | null {
    return this.activeSlot === 'A' ? this.videoA : this.videoB;
  }

  private getInactiveVideo(): HTMLVideoElement | null {
    return this.activeSlot === 'A' ? this.videoB : this.videoA;
  }

  /**
   * Smoothly crossfades between video buffers when changing active experience
   */
  public switchVideo(url?: string): void {
    if (!url) {
      if (this.videoA) gsap.to(this.videoA, { autoAlpha: 0, duration: this.crossfadeDuration, overwrite: 'auto' });
      if (this.videoB) gsap.to(this.videoB, { autoAlpha: 0, duration: this.crossfadeDuration, overwrite: 'auto' });
      this.activeUrl = null;
      return;
    }

    if (this.activeUrl === url) {
      return;
    }

    const incomingSlot = this.activeSlot === 'A' ? 'B' : 'A';
    const incomingVideo = incomingSlot === 'A' ? this.videoA : this.videoB;
    const outgoingVideo = this.activeSlot === 'A' ? this.videoA : this.videoB;

    if (!incomingVideo) return;

    this.activeUrl = url;
    this.activeSlot = incomingSlot;

    incomingVideo.src = url;
    incomingVideo.load();

    const onReady = () => {
      incomingVideo.removeEventListener('loadedmetadata', onReady);
      incomingVideo.pause();
      incomingVideo.currentTime = this.smoothedTime;

      // Crossfade using GPU-accelerated autoAlpha
      gsap.to(incomingVideo, {
        autoAlpha: 0.42,
        duration: this.crossfadeDuration,
        ease: 'power2.inOut',
        overwrite: 'auto',
      });

      if (outgoingVideo) {
        gsap.to(outgoingVideo, {
          autoAlpha: 0,
          duration: this.crossfadeDuration,
          ease: 'power2.inOut',
          overwrite: 'auto',
        });
      }
    };

    if (incomingVideo.readyState >= 1) {
      onReady();
    } else {
      incomingVideo.addEventListener('loadedmetadata', onReady, { once: true });
    }
  }

  /**
   * Updates target time according to scroll progress (0 to 1)
   */
  public setProgress(progress: number): void {
    const video = this.getActiveVideo();
    if (!video || isNaN(video.duration) || video.duration <= 0) return;
    this.targetTime = Math.max(0, Math.min(video.duration, progress * video.duration));
  }

  /**
   * Numeric proxy lerp loop running in gsap.ticker.
   * Only mutates currentTime when video is NOT seeking and readyState >= 2 (HAVE_CURRENT_DATA)
   */
  private initTicker(): void {
    this.tickerFn = () => {
      const video = this.getActiveVideo();
      if (!video || isNaN(video.duration) || video.duration <= 0) return;

      // Numeric lerp interpolation
      this.smoothedTime += (this.targetTime - this.smoothedTime) * this.lerpFactor;

      const delta = Math.abs(video.currentTime - this.smoothedTime);
      // Only seek if difference is noticeable (> 0.01s) and video pipeline is ready
      if (delta > 0.01 && !video.seeking && video.readyState >= 2) {
        video.currentTime = this.smoothedTime;
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
    if (this.videoA) {
      this.videoA.pause();
      this.videoA.src = '';
    }
    if (this.videoB) {
      this.videoB.pause();
      this.videoB.src = '';
    }
    this.videoA = null;
    this.videoB = null;
    this.activeUrl = null;
  }
}
