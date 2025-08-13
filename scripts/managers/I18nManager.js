/**
 * I18nManager - 국제화(다국어) 시스템 관리자
 * 
 * 주요 기능:
 * - 언어 전환 및 번역 파일 동적 로딩 (en.json, ko.json)
 * - DOM 콘텐츠 실시간 업데이트 (메타, 히어로, 어바웃, 프로젝트, 스킬, 블로그, 푸터)
 * - 언어 버튼 상태 관리 및 localStorage 지속성
 * - StateManager, EventBus와 연동하여 반응형 업데이트
 * - 폴백 번역 시스템으로 오류 상황 대응
 * 
 * 지원 언어: 영어(en), 한국어(ko)
 * 번역 파일 위치: ./languages/{언어코드}.json
 */
class I18nManager {
  constructor() {
    // 외부 의존성
    this.stateManager = window.stateManager;  // 전역 상태 관리자
    this.eventBus = window.eventBus;          // 이벤트 버스
    
    // 내부 상태
    this.translations = {};                   // 현재 로드된 번역 데이터
    this.isLoading = false;                  // 번역 로딩 상태 플래그
    
    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.setupStateSubscriptions();
    
    // Load initial translations
    const currentLang = this.stateManager.getState('language');
    await this.loadTranslations(currentLang);
    this.updateMenuLanguageButtons();
    this.renderPage(); // 초기 번역으로 페이지 렌더링
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
      // Try multiple possible paths for GitHub Pages compatibility
      const possiblePaths = [
        `./languages/${lang}.json`,
        `languages/${lang}.json`,
        `/languages/${lang}.json`
      ];
      
      let response;
      let lastError;
      
      for (const path of possiblePaths) {
        try {
          response = await fetch(path);
          if (response.ok) {
            break;
          }
          lastError = new Error(`HTTP ${response.status} for ${path}`);
        } catch (error) {
          lastError = error;
          continue;
        }
      }
      
      if (!response || !response.ok) {
        throw lastError || new Error(`Failed to load translations for ${lang}`);
      }
      
      const data = await response.json();
      
      // Validate that we got valid translation data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid translation data format');
      }
      
      this.translations = data;
      this.stateManager.setState('translations', this.translations);
      
      console.log(`Successfully loaded ${lang} translations`);
      this.eventBus.emit('i18n:loadingSuccess', { lang, translations: this.translations });
      
    } catch (error) {
      console.error(`Failed to load ${lang} translations:`, error);
      
      // Use fallback translations appropriate for the requested language
      console.warn(`Using fallback translations for ${lang}`);
      this.translations = this.getFallbackTranslations();
      this.stateManager.setState('translations', this.translations);
      
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
    const currentLang = this.getCurrentLanguage();
    
    if (currentLang === 'ko') {
      return {
        meta: {
          title: "이우용 - 포트폴리오",
          description: "백엔드 개발자 포트폴리오",
          keywords: "백엔드 개발자, Java, Spring, 포트폴리오",
          favicon: "./favicon.png"
        },
        hero: {
          line1: "안녕하세요,",
          line2: "이우용 입니다.",
          name: "이우용",
          subtitle: "백엔드 개발자",
          ctaText: "프로젝트 보기",
          ctaLink: "#projects"
        },
        about: {
          title: "소개",
          description: "깔끔하고 확장 가능한 시스템 구축에 열정을 가지고 있습니다.",
          details: ["현대적인 기술로 의미 있는 솔루션을 만들어갑니다."]
        },
        projects: {
          title: "프로젝트",
          items: []
        },
        skills: {
          title: "기술 스택",
          categories: []
        },
        blog: {
          title: "블로그",
          posts: []
        },
        footer: {
          copyright: "© 2025",
          author: "이우용",
          authorLink: "#"
        },
        ui: {
          github: "GitHub",
          readMore: "자세히 보기"
        },
        social: {
          github: "#",
          linkedin: "#"
        }
      };
    }
    
    // English fallback
    return {
      meta: {
        title: "Wooyong Lee - Portfolio",
        description: "Backend Developer Portfolio",
        keywords: "backend developer, Java, Spring, portfolio",
        favicon: "./favicon.png"
      },
      hero: {
        line1: "Hi, I'm",
        line2: "Wooyong Lee",
        name: "Wooyong Lee",
        subtitle: "Backend Developer",
        ctaText: "View My Work",
        ctaLink: "#projects"
      },
      about: {
        title: "About Me",
        description: "I'm passionate about building clean and scalable systems.",
        details: ["Creating meaningful solutions with modern technologies."]
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
        copyright: "© 2025",
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
    this.updateNavigation(); // 네비게이션 업데이트 추가
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
   * Update navigation menu text
   */
  updateNavigation() {
    const { navigation } = this.translations;
    if (!navigation) return;
    
    // Update all elements with data-translate attributes
    const translatableElements = document.querySelectorAll('[data-translate]');
    translatableElements.forEach(element => {
      const translateKey = element.getAttribute('data-translate');
      const translation = this.t(translateKey);
      if (translation && translation !== translateKey) {
        element.textContent = translation;
      }
    });
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