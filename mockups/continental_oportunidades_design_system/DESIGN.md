---
name: Continental Oportunidades Design System
colors:
  surface: '#faf8ff'
  surface-dim: '#dad9e0'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3fa'
  surface-container: '#eeedf4'
  surface-container-high: '#e8e7ee'
  surface-container-highest: '#e2e2e9'
  on-surface: '#1a1b20'
  on-surface-variant: '#434751'
  inverse-surface: '#2f3036'
  inverse-on-surface: '#f1f0f7'
  outline: '#747782'
  outline-variant: '#c3c6d3'
  surface-tint: '#365ca7'
  primary: '#002356'
  on-primary: '#ffffff'
  primary-container: '#003781'
  on-primary-container: '#80a4f4'
  inverse-primary: '#afc6ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#1f262b'
  on-tertiary: '#ffffff'
  tertiary-container: '#353b41'
  on-tertiary-container: '#9fa5ad'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#afc6ff'
  on-primary-fixed: '#001944'
  on-primary-fixed-variant: '#18448e'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#dde3eb'
  tertiary-fixed-dim: '#c1c7cf'
  on-tertiary-fixed: '#161c22'
  on-tertiary-fixed-variant: '#41474e'
  background: '#faf8ff'
  on-background: '#1a1b20'
  surface-variant: '#e2e2e9'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  sidebar-width: 260px
  header-height: 64px
  container-max: 1440px
---

## Brand & Style

This design system is built to reflect the prestige, stability, and forward-thinking nature of an academic institution. The brand personality is **Professional, Academic, and Trustworthy**, prioritizing clarity and information density without sacrificing visual comfort.

The design style follows a **Corporate Modern** approach. It utilizes a structured hierarchy, a restrained color palette, and high-quality typography to ensure that complex data—such as academic records, career opportunities, and analytics—remains accessible. The interface is characterized by clean surface transitions, precise alignment, and a focus on utility over decorative flourish. It aims to evoke a sense of organized progress and institutional reliability.

## Colors

The palette is anchored by a **Deep Institutional Blue**, serving as the primary driver for brand recognition, navigation, and primary actions. 

- **Primary:** Used for the sidebar, primary buttons, and active states. It conveys authority and confidence.
- **Secondary/Neutral:** A range of slate greys handles secondary text and UI borders, ensuring the interface feels balanced and grounded.
- **Surface:** The background utilizes a very soft neutral grey to reduce eye strain during long periods of use, distinguishing itself from pure white cards.
- **Accents:** Success (Green) and Error (Red) are used sparingly for status indicators, validation, and alerts, following standard accessibility conventions.

## Typography

The design system utilizes **Inter** for all typographic needs. Its high x-height and neutral character make it exceptionally legible for data-heavy applications and academic text.

- **Headlines:** Use a bold weight with slight negative letter-spacing for a modern, compact look in dashboards.
- **Body Text:** Standardized on 16px for primary reading, with a 14px variant for denser layouts like tables and sidebars.
- **Labels:** Small caps and increased letter-spacing are applied to metadata and table headers to differentiate them from interactive content.
- **Academic Context:** Hierarchy is strictly maintained to help users scan long forms or complex student records quickly.

## Layout & Spacing

The layout follows a **Fixed Grid** model within a flexible shell. The architecture consists of a persistent **sidebar** on the left for primary navigation and a **top header** for global actions, search, and user profile.

- **Grid:** A 12-column grid is used for the main content area. In dashboard views, cards may span 3, 4, 6, or 12 columns.
- **Margins & Gutters:** A consistent 24px (md) gutter is used between cards to provide breathing room.
- **Responsive Behavior:** 
    - **Desktop (>1024px):** Persistent sidebar, 24px margins.
    - **Tablet (768px - 1023px):** Sidebar collapses into an icon-only rail or a hamburger menu. Margins reduce to 16px.
    - **Mobile (<767px):** Single column layout. Header becomes the primary navigation anchor. Stack all cards vertically.

## Elevation & Depth

To maintain a clean and professional appearance, this design system uses **Tonal Layers** combined with **Ambient Shadows**.

- **Level 0 (Surface):** The background color (#F8FAFC). Elements placed here are completely flat.
- **Level 1 (Cards):** White background with a very subtle, diffused shadow (0px 2px 4px rgba(0,0,0,0.05)). This is used for the primary content blocks.
- **Level 2 (Overlays):** Used for dropdowns and tooltips. Shadows are slightly deeper (0px 4px 12px rgba(0,0,0,0.1)) to indicate temporary elevation over content.
- **Borders:** Low-contrast outlines (#E2E8F0) are used instead of shadows to separate segments within a card, such as table rows or form sections, keeping the UI crisp and professional.

## Shapes

The shape language is **Soft**, striking a balance between the rigidity of traditional academic software and the friendliness of modern SaaS.

- **Primary Elements:** Buttons, input fields, and cards use a 0.25rem (4px) corner radius.
- **Large Components:** Large sections or containers use the `rounded-lg` (0.5rem) setting to feel slightly more modern.
- **Interactive States:** Focus states are indicated by a sharp 2px primary-colored offset ring to ensure accessibility.

## Components

### Buttons & Inputs
- **Primary Button:** Solid institutional blue with white text.
- **Secondary Button:** Outlined with primary blue or neutral grey.
- **Input Fields:** Labeled on top. Use a 1px border (#E2E8F0) that thickens and changes color to primary blue on focus.

### Data Tables
- Designed for high density. Rows have a minimum height of 48px.
- Use zebra-striping or thin dividers.
- Headers are sticky and use the `label-md` typographic style.

### Steppers (Progress Indicators)
- Horizontal for short forms, vertical for long-term academic progress.
- Completed steps use the Success Green; active steps use the Primary Blue.

### Badges & Status Indicators
- **Pill-shaped** with light background tints.
- Example: "En curso" (Light Blue/Blue text), "Completado" (Light Green/Green text).

### Cards & Analytics
- Cards serve as the primary container for all content. 
- Analytics charts (Bar, Line) should use the primary blue and its tints, ensuring all data visualizations are legible against the white card surface.