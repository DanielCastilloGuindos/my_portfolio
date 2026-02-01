# Immersive Portfolio - Dark Storm

A high-performance, immersive portfolio website featuring Z-axis scroll navigation, built with Astro, Vue 3, GSAP, and SCSS.

## 🎨 Features

- **Z-Axis Navigation**: Unique tunnel-style scrolling through depth instead of traditional vertical scrolling
- **Dark Storm Aesthetic**: Deep navy-blacks with vibrant neon accents (blue, cyan, green)
- **Digital Rain Effect**: Canvas-based matrix rain background
- **GSAP Animations**: Smooth 60fps animations with ScrollTrigger
- **Glassmorphism**: Modern blur effects and depth
- **Responsive Design**: Mobile-friendly with touch support
- **No Backend Required**: Contact form redirects to WhatsApp

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dev server will start at `http://localhost:4321`

## 📁 Project Structure

```
Portfolio/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── DigitalRain.vue    # Canvas matrix rain effect
│   │   ├── Hero.vue           # Hero section with staggered text
│   │   ├── Projects.vue       # 3D project carousel
│   │   ├── Timeline.vue       # Animated SVG timeline
│   │   └── Contact.vue        # Flying assembly form
│   ├── layouts/
│   │   └── Layout.astro       # Main layout with Z-axis navigation
│   ├── pages/
│   │   └── index.astro        # Main page
│   ├── styles/
│   │   ├── variables.scss     # Design tokens & Dark Storm palette
│   │   └── global.scss        # Global styles & utilities
│   └── data.json              # Content data source
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## 🎯 Customization Guide

### 1. Update Content

Edit `src/data.json` to customize:
- Hero text and CTAs
- Project portfolio items
- Timeline milestones
- Contact information and WhatsApp number

```json
{
  "hero": {
    "name": "YOUR NAME",
    "title": "YOUR TITLE"
  },
  "contact": {
    "whatsapp": {
      "number": "1234567890"  // ← Update this
    }
  }
}
```

### 2. Adjust Colors

Modify `src/styles/variables.scss`:

```scss
// Change primary accent color
$accent-blue: #2563eb;  // ← Your color here

// Or create new accent
$accent-purple: #8b5cf6;
```

### 3. Control Z-Axis Speed

In `src/layouts/Layout.astro`, locate the navigation function:

```javascript
// Line ~60
const tl = gsap.timeline({
  onComplete: () => {
    currentIndex = targetIndex;
    isAnimating = false;
  }
});

// Adjust duration for speed
tl.to(currentSection, {
  scale: 1.2,
  opacity: 0,
  duration: 1.2,  // ← Decrease for faster (e.g., 0.8)
  ease: 'power2.inOut'  // ← Change easing for different feel
});
```

**Speed Presets:**
- **Fast**: `duration: 0.8`, `ease: 'power3.out'`
- **Default**: `duration: 1.2`, `ease: 'power2.inOut'`
- **Slow**: `duration: 1.8`, `ease: 'power1.inOut'`
- **Bouncy**: `duration: 1.0`, `ease: 'back.inOut(1.2)'`

### 4. Add/Remove Sections

1. Create new Vue component in `src/components/`
2. Import in `src/pages/index.astro`
3. Add to sections container with `data-section` attribute:

```astro
<div class="sections-container">
  <Hero client:load />
  <YourNewSection client:load />  <!-- Add here -->
  <Projects client:load />
  <!-- ... -->
</div>
```

### 5. Customize Animations

Each component has GSAP animations in its `onMounted` hook. Example from `Hero.vue`:

```javascript
const tl = gsap.timeline({ delay: 0.3 });

tl.from('.hero__badge', {
  opacity: 0,
  y: -20,
  duration: 0.6,  // ← Adjust timing
  ease: 'power2.out'  // ← Change easing
})
```

## 🎨 Design Tokens

### Color Palette

| Variable | Color | Usage |
|----------|-------|-------|
| `$bg-primary` | `#0a0e1a` | Main background |
| `$accent-blue` | `#2563eb` | Primary CTAs |
| `$accent-cyan` | `#06b6d4` | Badges, accents |
| `$accent-green` | `#10b981` | Contact section |
| `$text-primary` | `#f8fafc` | Main text |
| `$text-secondary` | `#94a3b8` | Secondary text |

### Spacing Scale

```scss
$spacing-xs: 0.5rem;   // 8px
$spacing-sm: 1rem;     // 16px
$spacing-md: 1.5rem;   // 24px
$spacing-lg: 2rem;     // 32px
$spacing-xl: 3rem;     // 48px
$spacing-2xl: 4rem;    // 64px
$spacing-3xl: 6rem;    // 96px
```

## 🔧 Advanced Configuration

### Disable Z-Axis Navigation

To use traditional scrolling, comment out the navigation script in `Layout.astro`:

```astro
<!-- <script>
  // Z-Axis navigation code...
</script> -->
```

And update `index.astro`:

```astro
<div class="sections-container" style="height: auto; overflow-y: auto;">
  <!-- sections will scroll normally -->
</div>
```

### Performance Optimization

1. **Reduce rain particles**: In `DigitalRain.vue`, adjust `fontSize`:
   ```javascript
   const fontSize = 20; // Larger = fewer particles
   ```

2. **Disable blur effects**: In `variables.scss`:
   ```scss
   $blur-md: 0px; // Disable blur
   ```

3. **Simplify animations**: Reduce `duration` and remove `stagger`:
   ```javascript
   gsap.from(elements, {
     duration: 0.3, // Faster
     stagger: 0     // No stagger
   });
   ```

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

**Note**: Backdrop blur may not work on older browsers. Fallback styles are included.

## 🐛 Troubleshooting

### Sections not transitioning

Check that all sections have the `data-section` attribute:
```vue
<section class="hero" data-section="hero">
```

### GSAP errors

Ensure ScrollTrigger is registered:
```javascript
import ScrollTrigger from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
```

### Styles not loading

Verify SCSS import in `astro.config.mjs`:
```javascript
scss: {
  additionalData: `@import "./src/styles/variables.scss";`
}
```

## 📄 License

MIT - Feel free to use this template for your own portfolio!

## 🙏 Credits

- Design inspired by modern creative portfolios
- Built with [Astro](https://astro.build)
- Animations by [GSAP](https://greensock.com/gsap/)
- Fonts from [Google Fonts](https://fonts.google.com)

---

**Need help?** Check the implementation plan in the brain folder for detailed technical documentation.
