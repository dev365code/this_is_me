# 🌟 Developer Portfolio Template

A modern, responsive portfolio website template for developers. Built with vanilla JavaScript, CSS, and HTML - no frameworks required!

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://your-demo-url.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge)](CONTRIBUTING.md)

## ✨ Features

### 🎨 **Modern Design**
- Clean, professional glassmorphism design
- Smooth animations and transitions
- Typography optimized for readability

### 🌓 **Dark/Light Mode**
- Toggle between dark and light themes
- Automatic theme persistence in localStorage
- Smooth theme transitions

### 🌍 **Multi-language Support** 
- Korean (한국어) and English support
- Easy language switching
- Perfect for international job applications

### 📱 **Fully Responsive**
- Mobile-first design approach
- Optimized for all screen sizes (320px to 2560px+)
- Touch-friendly interface on mobile devices

### 🚀 **Performance Optimized**
- No external dependencies except for icons
- Local font files and assets
- Optimized images and CSS

### ♿ **Accessibility Features**
- ARIA labels and semantic HTML
- Keyboard navigation support
- High contrast mode support
- Reduced motion preferences

### 🔧 **Easy Customization**
- Simple JSON configuration files
- Modular CSS architecture
- Well-documented code structure

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/developer-portfolio.git
cd developer-portfolio
```

### 2. Customize Your Content
Edit the language files in the `locales/` directory:

- `locales/ko.json` - Korean content
- `locales/en.json` - English content

### 3. Add Your Images
Replace images in the `assets/images/` directory:
- `tigerchopchop.jpg` - Your profile photo

### 4. Serve the Files
You can use any static file server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

### 5. Open in Browser
Navigate to `http://localhost:8000`

## 📁 Project Structure

```
developer-portfolio/
├── assets/
│   ├── css/
│   │   ├── theme.css          # Theme variables and toggle
│   │   ├── index.css          # Main styles
│   │   ├── animations.css     # Animation styles
│   │   ├── components.css     # Component styles
│   │   ├── projects.css       # Project section styles
│   │   ├── blog.css          # Blog section styles
│   │   └── responsive.css     # Responsive design
│   ├── js/
│   │   ├── Index.js          # Main functionality
│   │   └── i18n.js           # Internationalization
│   ├── images/
│   │   └── tigerchopchop.jpg # Profile image
│   ├── fonts/                # Local font files
│   └── vendor/               # Third-party assets
├── locales/
│   ├── ko.json               # Korean translations
│   └── en.json               # English translations
├── index.html                # Main HTML file
└── README.md                 # This file
```

## 🎨 Customization Guide

### Changing Colors
Edit the CSS variables in `assets/css/theme.css`:

```css
:root {
    --accent-color: #81D8D0;  /* Your brand color */
    --bg-color: #121212;      /* Background color */
    --text-color: #ffffff;    /* Text color */
}
```

### Adding New Sections
1. Add HTML structure to `index.html`
2. Add styles to appropriate CSS file
3. Update both `ko.json` and `en.json` with content
4. Update the i18n system in `assets/js/i18n.js`

### Modifying Content
All content is stored in JSON files in the `locales/` directory. Simply edit these files to update your portfolio content.

#### Example: Adding a New Project
Edit `locales/en.json` and `locales/ko.json`:

```json
{
  \"projects\": {
    \"items\": [
      {
        \"title\": \"Your New Project\",
        \"description\": \"Project description\",
        \"image\": \"assets/images/project-image.jpg\",
        \"link\": \"https://github.com/username/project\",
        \"tags\": [\"JavaScript\", \"React\"]
      }
    ]
  }
}
```

## 🌐 Multi-language Setup

### Adding a New Language
1. Create a new JSON file in `locales/` (e.g., `locales/ja.json` for Japanese)
2. Copy the structure from `locales/en.json` and translate the content
3. Update the language toggle in `assets/js/i18n.js`:

```javascript
// Add your language button
langToggle.innerHTML = `
  <button class=\"lang-btn\" data-lang=\"ko\">한국어</button>
  <button class=\"lang-btn\" data-lang=\"en\">English</button>
  <button class=\"lang-btn\" data-lang=\"ja\">日本語</button>
`;
```

### Content Structure
Each language file contains these sections:
- `personal` - Personal information
- `hero` - Main header content  
- `about` - About section content
- `skills` - Skills and technologies
- `projects` - Project portfolio items
- `blog` - Blog posts and articles
- `social` - Social media links
- `footer` - Footer information
- `meta` - SEO metadata
- `ui` - User interface text

## 🚀 Deployment

### GitHub Pages
1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Select source branch (usually `main`)
4. Your site will be available at `https://username.github.io/repository-name`

### Netlify
1. Connect your GitHub repository to Netlify
2. Build settings: Leave empty (static site)
3. Deploy directory: Root (`/`)

### Vercel
1. Import your GitHub repository
2. Framework preset: Other
3. Build command: Leave empty
4. Output directory: `./`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Font Awesome](https://fontawesome.com/) for icons
- [Google Fonts](https://fonts.google.com/) for typography
- [AOS](https://michalsnik.github.io/aos/) for scroll animations
- [Bootstrap](https://getbootstrap.com/) for utility classes

## 💬 Support

If you have any questions or need help customizing your portfolio:

- 📧 Email: your.email@example.com  
- 💬 Open an [Issue](https://github.com/your-username/developer-portfolio/issues)
- 🌟 Star this repository if it helped you!

---

**Made with ❤️ for the developer community**

> 💡 **Tip**: Don't forget to star ⭐ this repository if you found it helpful!