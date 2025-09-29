# Design Rules & Guidelines

This document contains all the design rules, guidelines, and standards for this React application.

## Typography

### Font Family
- **Primary Font**: Figtree
- **Fallback Stack**: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif
- **Weight Range**: 300-900 (Light to Black) including italic variants

### Font Sizing Rules
- **Use REM units**: Convert all pixel values to relative rem values
- **Conversion Formula**: `rem value = pixel value ÷ 16px`
- **Examples**:
  - 32px → 2rem
  - 36px → 2.25rem
  - 28px → 1.75rem

## Color System

### Content Colors
- **Primary**: `#222222` (`--content-primary`) - Main text, headings, primary content
- **Secondary**: `#6a6a6a` (`--content-secondary`) - Secondary text, captions, descriptions  
- **Disabled**: `#b0b0b0` (`--content-disabled`) - Disabled states, placeholder text
- **Inverted**: `#dddddd` (`--content-inverted`) - Text on dark backgrounds

### Surface Colors
- **Primary**: `#ffffff` (`--surface-primary`) - Main backgrounds, cards, modals
- **Secondary**: `#f7f7f7` (`--surface-secondary`) - Alternative backgrounds, sections
- **Inverted**: `#222222` (`--surface-inverted`) - Dark backgrounds, buttons

### Brand Colors
- **Primary**: `#2655A3` (`--brand-primary`) - Primary brand color

## Implementation Standards

### CSS Variables
All colors should be defined as CSS custom properties in `:root` and referenced using `var()` function:

```css
:root {
  --content-primary: #222222;
  --content-secondary: #6a6a6a;
  --content-disabled: #b0b0b0;
  --surface-primary: #ffffff;
  --surface-secondary: #f7f7f7;
  --brand-primary: #2655A3;
}
```

### Usage Examples
```css
/* CSS */
.element {
  color: var(--content-primary);
  background-color: var(--surface-primary);
  font-size: 2rem; /* Always use rem for sizing */
}

/* React inline styles */
style={{
  color: 'var(--content-primary)',
  backgroundColor: 'var(--surface-primary)',
  fontSize: '2rem'
}}
```

## Component Guidelines

### Typography Hierarchy
- **Main Title**: 2rem font-size, 2.25rem line-height (32px/36px equivalent) - consistent across all devices
- **Main Title Color**: Use content-primary color (`var(--content-primary)`)

### Layout Rules
- **Empty Screen Title**: Position at top of screen with 2rem margin from top (32px equivalent)
- **Empty Screen Content**: Maximum width of 37.5rem (600px equivalent)

### Audio Components
- Audio files should be stored in `src/assets/audio/` directory
- Support for MP3, WAV, OGG, M4A, AAC formats
- Use Figtree font family in all audio component styles

### Button Components

#### Play Button
- **Background**: Use surface-inverted color (`var(--surface-inverted)`)
- **Icon Color**: Use content-inverted color (`var(--content-inverted)`)
- **States**: Play (triangle icon) and Pause (two bars icon)
- **Shape**: Circular button
- **Sizing**: Use rem values (convert px to rem: px ÷ 16)
- **Hover Effect**: Scale(1.05) with shadow
- **Disabled State**: Use content-disabled color with reduced opacity

---

*Last updated: [Auto-generated timestamp will be added when rules are updated]*
