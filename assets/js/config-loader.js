// Config Loader - 설정 파일을 읽어서 동적으로 페이지 생성
class ConfigLoader {
  constructor() {
    this.config = null;
    this.init();
  }
  
  async init() {
    try {
      await this.loadConfig();
      this.renderPage();
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  }
  
  async loadConfig() {
    const response = await fetch('./config.json');
    this.config = await response.json();
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
    const { meta } = this.config;
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
    const { hero } = this.config;
    
    // Update typing animation text (will be handled by existing typing animation)
    const line1 = document.getElementById('line1');
    const line2 = document.getElementById('line2');
    if (line1) line1.setAttribute('data-text', hero.greeting + ' ');
    if (line2) line2.setAttribute('data-text', hero.name);
    
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
    const { about, personal } = this.config;
    
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
    const { projects } = this.config;
    
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
              <a href="${project.link}" class="project-link">GitHub</a>
            </div>
          </div>
        </div>
      `).join('');
    }
  }
  
  updateSkills() {
    const { skills } = this.config;
    
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
    const { blog } = this.config;
    
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
              <a href="${post.link}" class="blog-link">Read More</a>
            </div>
          </div>
        </article>
      `).join('');
    }
  }
  
  updateFooter() {
    const { footer, social } = this.config;
    
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
  
  // Utility method to update typing animation with config data
  updateTypingAnimation() {
    const { hero } = this.config;
    if (window.startTypingAnimation) {
      // Update the typing animation function to use config data
      const line1 = document.getElementById('line1');
      const line2 = document.getElementById('line2');
      
      // Store original typing function
      if (!window.originalStartTypingAnimation) {
        window.originalStartTypingAnimation = window.startTypingAnimation;
      }
      
      // Override with config-aware version
      window.startTypingAnimation = async function() {
        const line1 = document.getElementById('line1');
        const line2 = document.getElementById('line2');
        
        line1.textContent = '';
        line2.textContent = '';
        line1.style.width = '0';
        line2.style.width = '0';
        
        if (window.isMobile && window.isMobile()) {
          line2.style.display = 'block';
          
          line1.style.borderRight = '3px solid var(--typing-cursor-primary)';
          line1.classList.add('blink');
          await window.typeText(line1, hero.greeting, 120, false);
          await new Promise(resolve => setTimeout(resolve, 300));
          
          line1.style.borderRight = 'none';
          line1.classList.remove('blink');
          line2.style.borderRight = '3px solid var(--accent-color)';
          line2.classList.add('blink');
          await window.typeText(line2, hero.name, 120, true);
          
        } else {
          line2.style.display = 'none';
          line1.style.borderRight = '3px solid var(--typing-cursor-primary)';
          line1.classList.add('blink');
          
          await window.typeText(line1, hero.greeting + ' ', 100, false);
          line1.style.borderRightColor = 'var(--accent-color)';
          
          const currentText = line1.textContent;
          await window.typeTextContinue(line1, currentText, hero.name, 100, true);
        }
        
        setTimeout(() => {
          line1.classList.remove('blink');
          line2.classList.remove('blink');
          line1.style.borderRight = 'none';
          line2.style.borderRight = 'none';
        }, 2000);
      };
    }
  }
}

// Initialize config loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.configLoader = new ConfigLoader();
});