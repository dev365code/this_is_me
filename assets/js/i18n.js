// Internationalization System
class I18nManager {
  constructor() {
    this.currentLang = this.getStoredLang() || 'ko';
    this.translations = {};
    this.configLoader = null;
    this.init();
  }
  
  async init() {
    await this.loadTranslations();
    this.renderLanguageToggle();
    this.setupEventListeners();
  }
  
  getStoredLang() {
    return localStorage.getItem('portfolio-lang');
  }
  
  setStoredLang(lang) {
    localStorage.setItem('portfolio-lang', lang);
  }
  
  async loadTranslations() {
    try {
      const response = await fetch(`./locales/${this.currentLang}.json`);
      this.translations = await response.json();
    } catch (error) {
      console.error('Failed to load translations:', error);
      // Fallback to Korean
      if (this.currentLang !== 'ko') {
        this.currentLang = 'ko';
        await this.loadTranslations();
      }
    }
  }
  
  renderLanguageToggle() {
    // Create language toggle button
    const langToggle = document.createElement('div');
    langToggle.className = 'lang-toggle';
    langToggle.innerHTML = `
      <button class="lang-btn ${this.currentLang === 'ko' ? 'active' : ''}" data-lang="ko">
        한국어
      </button>
      <button class="lang-btn ${this.currentLang === 'en' ? 'active' : ''}" data-lang="en">
        English
      </button>
    `;
    
    // Insert before theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.parentNode.insertBefore(langToggle, themeToggle);
    } else {
      document.body.appendChild(langToggle);
    }
  }
  
  setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('lang-btn')) {
        const newLang = e.target.dataset.lang;
        if (newLang !== this.currentLang) {
          this.switchLanguage(newLang);
        }
      }
    });
  }
  
  async switchLanguage(newLang) {
    this.currentLang = newLang;
    this.setStoredLang(newLang);
    
    await this.loadTranslations();
    this.updateActiveLangButton();
    this.renderPage();
    
    // Restart typing animation with new language
    if (window.startTypingAnimation) {
      setTimeout(() => {
        window.startTypingAnimation();
      }, 100);
    }
  }
  
  updateActiveLangButton() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.lang === this.currentLang) {
        btn.classList.add('active');
      }
    });
  }
  
  renderPage() {
    this.updateMeta();
    this.updateHero();
    this.updateAbout();
    this.updateProjects();
    this.updateSkills();
    this.updateBlog();
    this.updateFooter();
  }
  
  updateMeta() {
    const { meta } = this.translations;
    document.title = meta.title;
    
    // Update meta tags
    this.updateMetaTag('description', meta.description);
    this.updateMetaTag('keywords', meta.keywords);
    
    // Update favicon
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) favicon.href = meta.favicon;
  }
  
  updateMetaTag(name, content) {
    let tag = document.querySelector(`meta[name="${name}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.name = name;
      document.head.appendChild(tag);
    }
    tag.content = content;
  }
  
  updateHero() {
    const { hero } = this.translations;
    
    // Update subtitle
    const subtitle = document.querySelector('.hero h2');
    if (subtitle) subtitle.textContent = hero.subtitle;
    
    // Update CTA
    const cta = document.querySelector('.hero .cta');
    if (cta) {
      cta.textContent = hero.ctaText;
      cta.href = hero.ctaLink;
    }
  }
  
  updateAbout() {
    const { about, personal } = this.translations;
    
    // Update section title
    const title = document.querySelector('#about .section-title');
    if (title) title.textContent = about.title;
    
    // Update profile image
    const profileImg = document.querySelector('.profile-image');
    if (profileImg) {
      profileImg.src = personal.profileImage;
      profileImg.alt = personal.name;
    }
    
    // Update about text
    const aboutText = document.querySelector('.about-text');
    if (aboutText) {
      aboutText.innerHTML = `
        <p>${about.description}</p>
        ${about.details.map(detail => `<p>${detail}</p>`).join('')}
      `;
    }
  }
  
  updateProjects() {
    const { projects, ui } = this.translations;
    
    // Update section title
    const title = document.querySelector('#projects .section-title');
    if (title) title.textContent = projects.title;
    
    // Update project cards
    const projectGrid = document.querySelector('.project-grid');
    if (projectGrid && projects.items) {
      projectGrid.innerHTML = projects.items.map((project, index) => `
        <div class="project-card" data-aos="zoom-in" ${index > 0 ? `data-aos-delay="${index * 200}"` : ''}>
          <div class="project-wrapper">
            <div class="project-image">
              <img src="${project.image}" alt="${project.title}" />
            </div>
            <div class="project-content">
              <h3>${project.title}</h3>
              <p>${project.description}</p>
              <a href="${project.link}" class="project-link">${ui.github}</a>
            </div>
          </div>
        </div>
      `).join('');
    }
  }
  
  updateSkills() {
    const { skills } = this.translations;
    
    // Update section title
    const title = document.querySelector('#skills .section-title');
    if (title) title.textContent = skills.title;
    
    // Update skills grid
    const skillsGrid = document.querySelector('.skills-grid');
    if (skillsGrid && skills.categories) {
      skillsGrid.innerHTML = skills.categories.map(category => `
        <div class="skill-category">
          <h3>${category.name}</h3>
          <div class="skill-tags">
            ${category.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>
        </div>
      `).join('');
    }
  }
  
  updateBlog() {
    const { blog, ui } = this.translations;
    
    // Update section title
    const title = document.querySelector('#blog .section-title');
    if (title) title.textContent = blog.title;
    
    // Update blog cards
    const blogGrid = document.querySelector('.blog-grid');
    if (blogGrid && blog.posts) {
      blogGrid.innerHTML = blog.posts.map((post, index) => `
        <article class="blog-card" data-aos="zoom-in" ${index > 0 ? `data-aos-delay="${index * 200}"` : ''}>
          <div class="blog-wrapper">
            <div class="blog-header">
              <span class="blog-date">${post.date}</span>
              <div class="blog-tags">
                ${post.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
              </div>
            </div>
            <div class="blog-content">
              <h3>${post.title}</h3>
              <p>${post.description}</p>
              <a href="${post.link}" class="blog-link">${ui.readMore}</a>
            </div>
          </div>
        </article>
      `).join('');
    }
  }
  
  updateFooter() {
    const { footer, social } = this.translations;
    
    // Update social links
    const githubLink = document.querySelector('a[aria-label="github"]');
    if (githubLink) githubLink.href = social.github;
    
    const linkedinLink = document.querySelector('a[aria-label="linkedin"]');
    if (linkedinLink) linkedinLink.href = social.linkedin;
    
    // Update footer text
    const footerText = document.querySelector('.footer__text');
    if (footerText) {
      footerText.innerHTML = `${footer.copyright} <a href="${footer.authorLink}" target="_blank" rel="noopener noreferrer">${footer.author}</a>`;
    }
  }
  
  // Get current translations (for typing animation)
  getCurrentTranslations() {
    return this.translations;
  }
}

// Initialize I18n manager
document.addEventListener('DOMContentLoaded', () => {
  window.i18nManager = new I18nManager();
});