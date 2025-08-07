/**
 * I18nManager - Internationalization system
 * Handles language switching, translation loading, and content updates
 * Integrates with StateManager and EventBus for reactive updates
 */
class I18nManager {
  constructor() {
    this.stateManager = window.stateManager;
    this.eventBus = window.eventBus;
    this.translations = {};
    this.isLoading = false;
    
    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.setupStateSubscriptions();
    
    // Load initial translations
    const currentLang = this.stateManager.getState('language');
    await this.loadTranslations(currentLang);
    this.updateMenuLanguageButtons();
  }

  setupEventListeners() {
    // Handle language button clicks
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('menu-lang-btn')) {
        const newLang = e.target.dataset.lang;
        if (newLang !== this.getCurrentLanguage()) {
          this.switchLanguage(newLang);
        }
      }
    });

    // Listen for language change events
    this.eventBus.on('i18n:switchLanguage', (lang) => this.switchLanguage(lang));
    this.eventBus.on('i18n:reload', () => this.reloadTranslations());
  }

  setupStateSubscriptions() {
    // Subscribe to language state changes
    this.stateManager.subscribe('language', async (newLang, oldLang) => {
      if (newLang !== oldLang) {
        await this.loadTranslations(newLang);
        this.renderPage();
        this.updateMenuLanguageButtons();
        this.eventBus.emit('i18n:languageChanged', { newLang, oldLang });
      }
    });
  }

  /**
   * Get current language
   * @returns {string} Current language code
   */
  getCurrentLanguage() {
    return this.stateManager.getState('language');
  }

  /**
   * Switch to new language
   * @param {string} newLang - Language code to switch to
   */
  async switchLanguage(newLang) {
    if (newLang === this.getCurrentLanguage() || this.isLoading) return;
    
    this.eventBus.emit('i18n:switchingLanguage', { newLang });
    this.stateManager.setState('language', newLang);
  }

  /**
   * Load translations for specified language
   * @param {string} lang - Language code
   */
  async loadTranslations(lang = 'en') {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.eventBus.emit('i18n:loadingStart', { lang });
    
    try {
      const response = await fetch(`./locales/${lang}.json`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      this.translations = await response.json();
      this.stateManager.setState('translations', this.translations);
      
      this.eventBus.emit('i18n:loadingSuccess', { lang, translations: this.translations });
      
    } catch (error) {
      console.error('Failed to load translations:', error);
      
      // Fallback to English if not already trying English
      if (lang !== 'en') {
        console.warn(`Falling back to English translations`);
        await this.loadTranslations('en');
        this.stateManager.setState('language', 'en');
      } else {
        // Use minimal fallback translations
        this.translations = this.getFallbackTranslations();
        this.stateManager.setState('translations', this.translations);
      }
      
      this.eventBus.emit('i18n:loadingError', { lang, error });
    } finally {
      this.isLoading = false;
      this.eventBus.emit('i18n:loadingEnd', { lang });
    }
  }

  /**
   * Get fallback translations when loading fails
   * @returns {Object} Fallback translation data
   */
  getFallbackTranslations() {
    return {
      meta: {
        title: "Wooyong Lee - Portfolio",
        description: "Full Stack Developer Portfolio",
        keywords: "developer, portfolio, javascript, react, node.js",
        favicon: "./favicon.png"
      },
      hero: {
        greeting: "Hi, I'm",
        name: "Wooyong Lee",
        subtitle: "Full Stack Developer",
        ctaText: "View My Work",
        ctaLink: "#projects"
      },
      about: {
        title: "About Me",
        description: "I'm a passionate developer creating digital solutions.",
        details: ["Building modern web applications with cutting-edge technologies."]
      },
      projects: {
        title: "Projects",
        items: []
      },
      skills: {
        title: "Skills",
        categories: []
      },
      blog: {
        title: "Blog",
        posts: []
      },
      footer: {
        copyright: "© 2024",
        author: "Wooyong Lee",
        authorLink: "#"
      },
      ui: {
        github: "GitHub",
        readMore: "Read More"
      },
      social: {
        github: "#",
        linkedin: "#"
      }
    };
  }

  /**
   * Reload current translations
   */
  async reloadTranslations() {
    const currentLang = this.getCurrentLanguage();
    await this.loadTranslations(currentLang);
    this.renderPage();
  }

  /**
   * Update active language buttons in menu
   */
  updateMenuLanguageButtons() {
    const menuLangButtons = document.querySelectorAll('.menu-lang-btn');
    const currentLang = this.getCurrentLanguage();
    
    menuLangButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.lang === currentLang) {
        btn.classList.add('active');
      }
    });
  }

  /**
   * Render all page content with current translations
   */
  renderPage() {
    if (!this.translations || Object.keys(this.translations).length === 0) {
      console.warn('No translations available for rendering');
      return;
    }

    this.updateMeta();
    this.updateHero();
    this.updateAbout();
    this.updateProjects();
    this.updateSkills();
    this.updateBlog();
    this.updateFooter();
    
    this.eventBus.emit('i18n:pageRendered', { translations: this.translations });
  }

  /**
   * Update meta tags and title
   */
  updateMeta() {
    const { meta } = this.translations;
    if (!meta) return;
    
    document.title = meta.title;
    this.updateMetaTag('description', meta.description);
    this.updateMetaTag('keywords', meta.keywords);
    
    // Update favicon if specified
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon && meta.favicon) {
      favicon.href = meta.favicon;
    }
  }

  /**
   * Update or create meta tag
   * @param {string} name - Meta tag name
   * @param {string} content - Meta tag content
   */
  updateMetaTag(name, content) {
    let tag = document.querySelector(`meta[name="${name}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.name = name;
      document.head.appendChild(tag);
    }
    tag.content = content;
  }

  /**
   * Update hero section
   */
  updateHero() {
    const { hero } = this.translations;
    if (!hero) return;
    
    const subtitle = document.querySelector('.hero h2');
    if (subtitle) subtitle.textContent = hero.subtitle;
    
    const cta = document.querySelector('.hero .cta');
    if (cta) {
      cta.textContent = hero.ctaText;
      cta.href = hero.ctaLink;
    }
  }

  /**
   * Update about section
   */
  updateAbout() {
    const { about, personal } = this.translations;
    if (!about) return;
    
    const title = document.querySelector('#about .section-title');
    if (title) title.textContent = about.title;
    
    if (personal) {
      const profileImg = document.querySelector('.profile-image');
      if (profileImg) {
        profileImg.src = personal.profileImage;
        profileImg.alt = personal.name;
      }
    }
    
    const aboutText = document.querySelector('.about-text');
    if (aboutText && about.description) {
      const detailsHtml = about.details ? 
        about.details.map(detail => `<p>${detail}</p>`).join('') : '';
      
      aboutText.innerHTML = `
        <p>${about.description}</p>
        ${detailsHtml}
      `;
    }
  }

  /**
   * Update projects section
   */
  updateProjects() {
    const { projects, ui } = this.translations;
    if (!projects) return;
    
    const title = document.querySelector('#projects .section-title');
    if (title) title.textContent = projects.title;
    
    const projectGrid = document.querySelector('.project-grid');
    if (projectGrid && projects.items && projects.items.length > 0) {
      projectGrid.innerHTML = projects.items.map((project, index) => `
        <div class="project-card" data-aos="zoom-in" ${index > 0 ? `data-aos-delay="${index * 200}"` : ''}>
          <div class="project-wrapper">
            <div class="project-image">
              <img src="${project.image}" alt="${project.title}" />
            </div>
            <div class="project-content">
              <h3>${project.title}</h3>
              <p>${project.description}</p>
              <a href="${project.link}" class="project-link">${ui?.github || 'GitHub'}</a>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  /**
   * Update skills section
   */
  updateSkills() {
    const { skills } = this.translations;
    if (!skills) return;
    
    const title = document.querySelector('#skills .section-title');
    if (title) title.textContent = skills.title;
    
    const skillsGrid = document.querySelector('.skills-grid');
    if (skillsGrid && skills.categories && skills.categories.length > 0) {
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

  /**
   * Update blog section
   */
  updateBlog() {
    const { blog, ui } = this.translations;
    if (!blog) return;
    
    const title = document.querySelector('#blog .section-title');
    if (title) title.textContent = blog.title;
    
    const blogGrid = document.querySelector('.blog-grid');
    if (blogGrid && blog.posts && blog.posts.length > 0) {
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
              <a href="${post.link}" class="blog-link">${ui?.readMore || 'Read More'}</a>
            </div>
          </div>
        </article>
      `).join('');
    }
  }

  /**
   * Update footer section
   */
  updateFooter() {
    const { footer, social } = this.translations;
    if (!footer) return;
    
    // Update social links
    if (social) {
      const githubLink = document.querySelector('a[aria-label="github"]');
      if (githubLink) githubLink.href = social.github;
      
      const linkedinLink = document.querySelector('a[aria-label="linkedin"]');
      if (linkedinLink) linkedinLink.href = social.linkedin;
    }
    
    // Update footer text
    const footerText = document.querySelector('.footer__text');
    if (footerText) {
      footerText.innerHTML = `${footer.copyright} <a href="${footer.authorLink}" target="_blank" rel="noopener noreferrer">${footer.author}</a>`;
    }
  }

  /**
   * Get current translations
   * @returns {Object} Current translation data
   */
  getTranslations() {
    return this.translations;
  }

  /**
   * Get translation for specific key with dot notation support
   * @param {string} key - Translation key (e.g., 'hero.greeting')
   * @param {*} fallback - Fallback value if key not found
   * @returns {*} Translation value or fallback
   */
  t(key, fallback = key) {
    const keys = key.split('.');
    let value = this.translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback;
      }
    }
    
    return value;
  }

  /**
   * Check if translations are loaded
   * @returns {boolean} True if translations are available
   */
  isReady() {
    return this.translations && Object.keys(this.translations).length > 0;
  }

  /**
   * Cleanup event listeners
   */
  destroy() {
    this.isLoading = false;
    this.translations = {};
  }
}

// Export for use in main app
window.I18nManager = I18nManager;