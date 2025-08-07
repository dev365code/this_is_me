# 🚀 Quick Setup Guide

## Step 1: Download or Clone
```bash
# Option 1: Clone with Git
git clone https://github.com/your-username/developer-portfolio.git
cd developer-portfolio

# Option 2: Download ZIP
# Download from GitHub → Extract → Navigate to folder
```

## Step 2: Customize Your Content

### 📝 Edit Personal Information
Edit `locales/en.json` and `locales/ko.json`:

```json
{
  \"personal\": {
    \"name\": \"Your Name\",
    \"title\": \"Your Job Title\",
    \"email\": \"your.email@example.com\",
    \"phone\": \"+1-234-567-8900\",
    \"location\": \"Your City, Country\"
  }
}
```

### 🖼️ Add Your Photos
Replace these files in `assets/images/`:
- `tigerchopchop.jpg` → Your profile photo (square, 400x400px recommended)

### 🔗 Update Links
```json
{
  \"social\": {
    \"github\": \"https://github.com/yourusername\",
    \"linkedin\": \"https://www.linkedin.com/in/yourusername/\",
    \"email\": \"your.email@example.com\"
  }
}
```

### 💼 Add Your Projects
```json
{
  \"projects\": {
    \"items\": [
      {
        \"title\": \"Your Project Name\",
        \"description\": \"Brief project description\",
        \"image\": \"assets/images/project-screenshot.jpg\",
        \"link\": \"https://github.com/yourusername/project\",
        \"tags\": [\"JavaScript\", \"React\", \"Node.js\"]
      }
    ]
  }
}
```

### 📚 Add Your Skills
```json
{
  \"skills\": {
    \"categories\": [
      {
        \"name\": \"Frontend\",
        \"skills\": [\"HTML\", \"CSS\", \"JavaScript\", \"React\"]
      },
      {
        \"name\": \"Backend\", 
        \"skills\": [\"Node.js\", \"Python\", \"SQL\"]
      }
    ]
  }
}
```

### 📖 Add Blog Posts (Optional)
```json
{
  \"blog\": {
    \"posts\": [
      {
        \"title\": \"Your Blog Post Title\",
        \"description\": \"Post description\",
        \"date\": \"2025.01.15\",
        \"link\": \"https://your-blog.com/post\",
        \"tags\": [\"JavaScript\", \"Tutorial\"]
      }
    ]
  }
}
```

## Step 3: Preview Your Site

### Option A: Python (Recommended)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

### Option B: Node.js
```bash
npx serve .
# or
npx http-server
```

### Option C: PHP
```bash
php -S localhost:8000
```

### Option D: VS Code Live Server
1. Install \"Live Server\" extension
2. Right-click `index.html` → \"Open with Live Server\"

## Step 4: Test Everything

### ✅ Checklist
- [ ] Profile photo displays correctly
- [ ] Personal information is accurate
- [ ] All social links work
- [ ] Projects show properly
- [ ] Skills are listed correctly
- [ ] Theme toggle works (dark/light)
- [ ] Language toggle works (한국어/English)
- [ ] Mobile responsive design
- [ ] All animations are smooth

## Step 5: Deploy

### GitHub Pages (Free)
1. Push to GitHub repository
2. Go to Settings → Pages
3. Select source: Deploy from branch → main
4. Your site: `https://username.github.io/repository-name`

### Netlify (Free)
1. Drag & drop your folder to [netlify.com/drop](https://app.netlify.com/drop)
2. Or connect GitHub repository for auto-deploy

### Vercel (Free)
1. Connect GitHub repository at [vercel.com](https://vercel.com)
2. Auto-deploy on every commit

## 🎨 Customization Tips

### Change Colors
Edit `assets/css/theme.css`:
```css
:root {
    --accent-color: #your-brand-color;
}
```

### Add New Section
1. Add HTML to `index.html`
2. Add styles to CSS files  
3. Update JSON files with content
4. Update `assets/js/i18n.js` if needed

## 🆘 Troubleshooting

**Images not loading?**
- Check file paths in JSON files
- Ensure images are in `assets/images/` folder

**Animations not working?**
- Check browser console for JavaScript errors
- Ensure all files are loaded properly

**Fonts look different?**
- Check if font files loaded correctly
- Clear browser cache

**Mobile layout broken?**
- Test on actual devices
- Use browser dev tools mobile view

## 💡 Pro Tips

1. **Optimize Images**: Use WebP format, compress to < 500KB
2. **SEO**: Update meta tags in JSON files
3. **Performance**: Check Lighthouse score
4. **Backup**: Keep original files before customizing

## 📞 Need Help?

- 📧 Email: your.email@example.com
- 💬 GitHub Issues: Create an issue for bugs
- 📖 Full Documentation: See README.md

---

**🌟 Don't forget to star the repository if it helped you!**