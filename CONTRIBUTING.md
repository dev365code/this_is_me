# Contributing to Developer Portfolio Template

First off, thank you for considering contributing to this project! 🎉

## 🤝 How to Contribute

### Reporting Bugs 🐛
1. Check if the issue already exists in [Issues](https://github.com/your-username/developer-portfolio/issues)
2. If not, create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser and device information

### Suggesting Features 💡
1. Check existing [Issues](https://github.com/your-username/developer-portfolio/issues) and [Pull Requests](https://github.com/your-username/developer-portfolio/pulls)
2. Open an issue with:
   - Feature description
   - Use case and benefits
   - Possible implementation approach

### Code Contributions 🚀

#### Setting Up Development Environment
```bash
# Fork and clone the repository
git clone https://github.com/your-username/developer-portfolio.git
cd developer-portfolio

# Create a new branch
git checkout -b feature/your-feature-name

# Start development server
python -m http.server 8000
# or
npx serve .
```

#### Pull Request Process
1. **Fork** the repository
2. **Create** a feature branch from `main`
3. **Make** your changes following our guidelines
4. **Test** your changes thoroughly
5. **Commit** with descriptive messages
6. **Push** to your fork
7. **Create** a Pull Request

#### Code Style Guidelines

**CSS:**
- Use CSS variables for theming
- Follow BEM naming convention when applicable
- Mobile-first responsive design
- Comment complex styles

**JavaScript:**
- Use ES6+ features
- Follow functional programming principles
- Add JSDoc comments for functions
- Use meaningful variable names
- Handle errors gracefully

**HTML:**
- Use semantic HTML5 elements
- Include appropriate ARIA labels
- Ensure keyboard navigation support

#### Commit Message Format
```
type(scope): brief description

Longer description if needed

- Bullet points for changes
- Reference issues with #123
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(i18n): add Japanese language support

fix(nav): resolve mobile menu not closing issue

docs(readme): update installation instructions
```

### Translation Contributions 🌍

#### Adding New Languages
1. Create `locales/{lang-code}.json` (e.g., `locales/ja.json`)
2. Copy structure from `locales/en.json`
3. Translate all text content
4. Update language selector in `assets/js/i18n.js`
5. Test language switching functionality

#### Improving Existing Translations
1. Edit the appropriate file in `locales/`
2. Ensure consistency in terminology
3. Test the changes in browser

### Design Contributions 🎨

#### Theme Improvements
- Maintain accessibility standards (WCAG 2.1 AA)
- Test in both light and dark modes
- Ensure mobile responsiveness
- Keep performance in mind

#### New Components
- Follow existing design patterns
- Include hover and focus states
- Add appropriate animations
- Document any new CSS variables

## 📋 Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or improvement
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `question` - Further information requested
- `translation` - Translation related

## ✅ Testing

Before submitting a PR, please test:

### Manual Testing
- [ ] All features work in latest Chrome, Firefox, Safari
- [ ] Mobile responsiveness (320px to 1920px+)
- [ ] Dark/light theme switching
- [ ] Language switching
- [ ] Keyboard navigation
- [ ] All animations are smooth

### Accessibility Testing
- [ ] Screen reader compatibility
- [ ] Keyboard navigation
- [ ] Color contrast ratios
- [ ] Focus indicators

## 📞 Getting Help

- 💬 Join our [Discussions](https://github.com/your-username/developer-portfolio/discussions)
- 📧 Email: your.email@example.com
- 🐛 Report bugs in [Issues](https://github.com/your-username/developer-portfolio/issues)

## 📜 Code of Conduct

This project follows a Code of Conduct to ensure a welcoming environment for all contributors:

### Our Standards
- **Be Respectful**: Treat everyone with respect and kindness
- **Be Inclusive**: Welcome diverse perspectives and experiences  
- **Be Collaborative**: Help others and accept help gracefully
- **Be Patient**: Everyone has different skill levels and learning speeds

### Enforcement
Unacceptable behavior will not be tolerated. Report issues to the maintainers.

## 🏆 Recognition

Contributors will be:
- Listed in the README contributors section
- Mentioned in release notes for significant contributions
- Given collaborator access for ongoing contributions

## 📈 Development Priorities

Current focus areas:
1. **Performance optimization**
2. **Accessibility improvements** 
3. **Additional language support**
4. **New portfolio sections**
5. **Advanced customization options**

Thank you for contributing! 🙏