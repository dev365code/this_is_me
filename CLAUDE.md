# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a vanilla JavaScript portfolio website with no build tools or frameworks. It uses a manager-based architecture for organizing code and features multilingual support (Korean/English), dark/light themes, typing animations, and real-time blog integration.

## Development Commands

Since this is a static website with no build process, use any static file server:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# PHP  
php -S localhost:8000
```

Access at `http://localhost:8000`

## Architecture Overview

### Manager-Based System
The codebase uses a centralized manager pattern with strict initialization order and event-driven communication:

**Core Systems** (loaded via HTML script tags first):
- `scripts/core/EventBus.js` - Global pub/sub event system for decoupled communication
- `scripts/core/StateManager.js` - Global state management with localStorage persistence
- `scripts/app.js` - Main application controller managing all managers

**Manager Classes** (initialized by App.js in sequence):
1. **Core Managers** (Phase 1 - synchronous, required):
   - `I18nManager.js` - Internationalization and dynamic content rendering
   - `ThemeManager.js` - Dark/light theme switching with CSS variables  
   - `NavManager.js` - Navigation menu controls and scroll spy
   
2. **Enhanced Managers** (Phase 2 - asynchronous, optional):
   - `TypingManager.js` - Hero section typing animation with language awareness
   - `BlogManager.js` - RSS blog post loading with multiple proxy fallbacks

### Script Loading Order (Critical)
The HTML loads scripts in this exact order:
1. External libraries (AOS, Bootstrap)
2. Core systems (EventBus, StateManager)
3. All managers
4. Main App.js (which orchestrates everything)

### Content Management Architecture
- **Translation Files**: `languages/ko.json` and `languages/en.json` contain all content with nested object structure
- **Dynamic Rendering**: I18nManager renders content using `innerHTML` to support HTML markup in translations
- **Data Attributes**: HTML elements use `data-translate="key.path"` attributes for automatic localization
- **Real-time Updates**: Language changes trigger DOM re-rendering without page reload

### CSS Architecture
- `styles/theme.css` - CSS custom properties for theming, theme toggle logic
- `styles/components.css` - Component styles with theme-aware hover animations
- `styles/animations.css` - Keyframe animations and transitions
- `styles/responsive.css` - Mobile-first responsive design (320px to 2560px+)
- Section-specific styles: `blog.css`, `projects.css`, etc.

## Key Implementation Details

### Manager Initialization Sequence
App.js follows a strict two-phase initialization pattern:

**Phase 1 - Core Managers** (blocking):
- Initialize I18n, Theme, Nav managers synchronously
- Wait for each manager with 100ms delays
- Failure in any core manager throws error and stops initialization

**Phase 2 - Enhanced Managers** (non-blocking):
- Initialize Typing and Blog managers asynchronously
- Failures are logged but don't stop the application
- Typing animation starts 1.5 seconds after core managers are ready

### Event-Driven Communication
All inter-manager communication uses EventBus with these key events:
- `i18n:languageChanged` - Triggers re-rendering and typing animation updates
- `theme:changed` - Updates CSS variables and component states
- `typing:completed` - Enables scroll spy and navigation features
- `nav:stateChanged` - Manages menu open/close state
- `app:ready` - Signals full application initialization

### Internationalization System
The I18n system supports complex nested content structures:

**Key Features**:
- Dot notation key lookup (`hero.line1`, `about.details.0`)
- Fallback translation system when JSON files fail to load
- Multiple path resolution for different hosting environments
- Real-time DOM updates using `innerHTML` for HTML content support
- Language button state synchronization

**Critical Implementation**:
- Uses `innerHTML` (not `textContent`) to support HTML tags like `<strong>`, `<br>`
- Maintains parallel structure between language files
- Caches translations in StateManager for performance

### CSS Animation System
**Button Animations**:
- Use `::before` pseudo-elements for left-to-right fill effects
- Require `!important` declarations to override global transitions
- Theme-aware with CSS custom properties for colors
- GPU-accelerated with `transform` and `will-change`

**Typing Animation**:
- Language-aware text rendering with proper character timing
- Integrates with I18n system for content updates
- Uses RequestAnimationFrame for smooth performance

### Blog Integration Architecture
BlogManager implements a robust proxy fallback system:
- **Primary**: `allorigins.win` API
- **Fallbacks**: `cors-anywhere.herokuapp.com`, `api.codetabs.com`
- **Caching**: 2-minute localStorage cache to prevent API rate limits
- **Error Handling**: Graceful degradation to static fallback content
- **Async Loading**: Runs parallel to typing animation to avoid blocking

## Important Notes

### State Management
- All persistent state (theme, language, blog cache) goes through StateManager
- StateManager automatically handles localStorage serialization
- Never manipulate localStorage directly - use StateManager API

### Error Handling Strategy
- App.js provides global error boundaries with user-friendly messages
- Managers emit errors through EventBus rather than throwing
- Core manager failures are fatal, enhanced manager failures are logged
- Unhandled promise rejections and global errors are captured

### Performance Considerations
- All assets are local (no CDN dependencies except for fallback blog loading)
- CSS animations use hardware acceleration where possible
- Manager initialization is staggered to prevent main thread blocking
- Lazy loading for non-critical features (blog posts load in background)

### CSS Specificity Requirements
Button hover animations need high specificity due to global CSS transitions. The typing animation CSS can interfere with button states, so button styles use `!important` declarations strategically.

### Language File Structure
When modifying translations:
- Maintain identical nested key structure between `ko.json` and `en.json`
- Test both languages after changes
- Use HTML markup in translation values where needed (I18nManager renders with `innerHTML`)
- Keep fallback translations in I18nManager.js updated for offline scenarios

### Typing Animation System
The TypingManager implements sophisticated responsive typing animations:

**Architecture**:
- **Responsive Layout**: Desktop shows single line, mobile splits into two lines
- **Language Integration**: Automatically updates content when language changes
- **Theme Awareness**: Text colors adapt to current theme (tiffany mint for names, theme colors for other text)
- **Character Timing**: Natural typing rhythm with proper delays between characters
- **Cursor Animation**: Animated cursor with color transitions and smooth movement

**Critical Dependencies**:
- Must initialize AFTER I18nManager for proper language support
- Requires theme variables from ThemeManager for color consistency
- Uses RequestAnimationFrame for smooth 60fps animations

### CSS Variable System
All theming uses CSS custom properties defined in `styles/theme.css`:
- Theme switching is instantaneous via CSS variable updates
- Components reference theme variables for consistent styling
- Dark/light mode transitions are handled automatically
- Button animations inherit theme colors dynamically

### Mobile Responsiveness Architecture
- **Breakpoints**: Mobile-first design with key breakpoints at 768px, 1024px, 1440px
- **Navigation**: Mobile menu with overlay and body scroll prevention
- **Typing Animation**: Responsive text flow (single line → two lines on mobile)
- **Touch Interactions**: Optimized for mobile gestures and touch targets