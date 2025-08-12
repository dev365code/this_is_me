/**
 * BlogManager - 티스토리 블로그 RSS 자동 연동 관리자
 * 
 * 주요 기능:
 * - 티스토리 RSS 피드 자동 가져오기
 * - RSS XML을 JSON 형태로 파싱
 * - CORS 문제 해결을 위한 프록시 사용
 * - 블로그 섹션 동적 업데이트
 * - 캐시 시스템으로 성능 최적화
 */
class BlogManager {
  constructor() {
    // 외부 의존성
    this.stateManager = window.stateManager;
    this.eventBus = window.eventBus;
    this.i18nManager = window.i18nManager;
    
    // 설정
    this.tistoryRssUrl = 'https://arex.tistory.com/rss';
    this.proxyUrl = 'https://api.allorigins.win/get';
    this.maxPosts = 6; // 최대 표시할 포스트 수
    this.cacheKey = 'tistory-blog-cache';
    this.cacheExpiry = 30 * 60 * 1000; // 30분 캐시
    
    // 내부 상태
    this.blogPosts = [];
    this.isLoading = false;
    this.lastFetch = null;
    
    this.init();
  }

  async init() {
    console.log('🔥 BlogManager 초기화 시작');
    this.setupEventListeners();
    
    // 초기 블로그 포스트 로드
    await this.loadBlogPosts();
    console.log('✅ BlogManager 초기화 완료');
  }

  setupEventListeners() {
    // 언어 변경 시 블로그 섹션 업데이트
    this.eventBus.on('i18n:languageChanged', () => {
      this.updateBlogSection();
    });

    // 수동 새로고침 이벤트
    this.eventBus.on('blog:refresh', () => {
      this.refreshBlogPosts();
    });
  }

  /**
   * 티스토리 RSS 피드에서 블로그 포스트 로드
   */
  async loadBlogPosts() {
    if (this.isLoading) return;
    
    // 캐시 확인
    const cachedData = this.getCachedData();
    if (cachedData) {
      this.blogPosts = cachedData;
      this.updateBlogSection();
      return;
    }
    
    this.isLoading = true;
    this.eventBus.emit('blog:loadingStart');
    
    try {
      // AllOrigins 프록시 사용 (CORS 문제 해결)
      const fullUrl = `${this.proxyUrl}?url=${encodeURIComponent(this.tistoryRssUrl)}`;
      console.log('🌐 티스토리 RSS 피드 로딩 중...', fullUrl);
      
      const response = await fetch(fullUrl);
      console.log('📡 RSS 프록시 응답:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.contents) {
        throw new Error('RSS content not found in proxy response');
      }
      
      // XML 파싱
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
      
      // RSS 데이터를 포트폴리오 형식으로 변환
      this.blogPosts = this.parseRssXml(xmlDoc);
      
      // 캐시에 저장
      this.setCachedData(this.blogPosts);
      
      // 블로그 섹션 업데이트
      this.updateBlogSection();
      
      this.lastFetch = Date.now();
      console.log(`✅ 티스토리에서 ${this.blogPosts.length}개의 포스트를 성공적으로 로드했습니다.`);
      
      this.eventBus.emit('blog:loadingSuccess', { posts: this.blogPosts });
      
    } catch (error) {
      console.error('❌ 티스토리 RSS 로드 실패:', error);
      
      // 폴백: 정적 데이터 사용
      this.loadFallbackPosts();
      
      this.eventBus.emit('blog:loadingError', { error });
    } finally {
      this.isLoading = false;
      this.eventBus.emit('blog:loadingEnd');
    }
  }

  /**
   * RSS XML을 파싱하여 포트폴리오 형식으로 변환
   * @param {Document} xmlDoc - 파싱된 XML Document
   * @returns {Array} 파싱된 블로그 포스트 배열
   */
  parseRssXml(xmlDoc) {
    const items = xmlDoc.querySelectorAll('item');
    const posts = [];
    
    for (let i = 0; i < Math.min(items.length, this.maxPosts); i++) {
      const item = items[i];
      
      const title = item.querySelector('title')?.textContent || '제목 없음';
      const link = item.querySelector('link')?.textContent || '#';
      const description = item.querySelector('description')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || '';
      const categories = Array.from(item.querySelectorAll('category')).map(cat => cat.textContent);
      
      // HTML 태그 제거 및 설명 정리
      const cleanDescription = this.cleanHtmlAndTruncate(description, 150);
      
      // 날짜 포맷 변경
      const formattedDate = this.formatDate(pubDate);
      
      // 카테고리에서 태그 추출
      const tags = this.extractTags(categories);
      
      posts.push({
        title: title,
        description: cleanDescription,
        date: formattedDate,
        link: link,
        tags: tags,
        source: 'tistory'
      });
    }
    
    return posts;
  }

  /**
   * RSS 데이터를 포트폴리오 형식으로 파싱 (레거시 - RSS2JSON용)
   * @param {Object} rssData - RSS2JSON에서 받은 데이터
   * @returns {Array} 파싱된 블로그 포스트 배열
   */
  parseRssData(rssData) {
    if (!rssData.items || !Array.isArray(rssData.items)) {
      return [];
    }
    
    return rssData.items.map(item => {
      // HTML 태그 제거 및 설명 정리
      const description = this.cleanHtmlAndTruncate(item.description || item.content || '', 150);
      
      // 날짜 포맷 변경 (2024-12-15T... -> 2024.12.15)
      const date = this.formatDate(item.pubDate);
      
      // 카테고리에서 태그 추출 (없으면 기본 태그 사용)
      const tags = this.extractTags(item.categories || []);
      
      return {
        title: item.title || '제목 없음',
        description: description,
        date: date,
        link: item.link || item.guid || '#',
        tags: tags,
        source: 'tistory' // 출처 표시
      };
    });
  }

  /**
   * HTML 태그 제거 및 텍스트 길이 제한
   * @param {string} html - HTML 문자열
   * @param {number} maxLength - 최대 길이
   * @returns {string} 정리된 텍스트
   */
  cleanHtmlAndTruncate(html, maxLength = 150) {
    // HTML 태그 제거
    const text = html.replace(/<[^>]*>/g, '').trim();
    
    // 길이 제한 및 말줄임표 추가
    if (text.length <= maxLength) {
      return text;
    }
    
    return text.substring(0, maxLength).trim() + '...';
  }

  /**
   * 날짜 형식 변환
   * @param {string} dateString - RSS 날짜 문자열
   * @returns {string} 포맷된 날짜 (YYYY.MM.DD)
   */
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    } catch (error) {
      return '날짜 미상';
    }
  }

  /**
   * 카테고리에서 태그 추출
   * @param {Array} categories - RSS 카테고리 배열
   * @returns {Array} 태그 배열
   */
  extractTags(categories) {
    if (!Array.isArray(categories) || categories.length === 0) {
      return ['Blog']; // 기본 태그
    }
    
    // 카테고리를 태그로 변환 (최대 3개)
    return categories.slice(0, 3).map(category => 
      typeof category === 'string' ? category : category.name || 'Blog'
    );
  }

  /**
   * 캐시된 데이터 가져오기
   * @returns {Array|null} 캐시된 포스트 배열 또는 null
   */
  getCachedData() {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      
      // 캐시 만료 확인
      if (Date.now() - timestamp > this.cacheExpiry) {
        localStorage.removeItem(this.cacheKey);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('캐시 데이터 로드 실패:', error);
      localStorage.removeItem(this.cacheKey);
      return null;
    }
  }

  /**
   * 데이터를 캐시에 저장
   * @param {Array} posts - 저장할 포스트 배열
   */
  setCachedData(posts) {
    try {
      const cacheData = {
        data: posts,
        timestamp: Date.now()
      };
      localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('캐시 데이터 저장 실패:', error);
    }
  }

  /**
   * 폴백 포스트 로드 (RSS 실패 시)
   */
  loadFallbackPosts() {
    const currentLang = this.stateManager.getState('language');
    const translations = this.stateManager.getState('translations');
    
    if (translations && translations.blog && translations.blog.posts) {
      this.blogPosts = translations.blog.posts;
      console.log('폴백: 정적 블로그 포스트 사용');
    } else {
      // 최소한의 폴백 데이터
      this.blogPosts = [{
        title: currentLang === 'ko' ? '블로그 포스트 로딩 중...' : 'Loading blog posts...',
        description: currentLang === 'ko' ? '티스토리 블로그에서 최신 포스트를 가져오는 중입니다.' : 'Fetching latest posts from Tistory blog.',
        date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
        link: this.tistoryRssUrl.replace('/rss', ''),
        tags: ['Blog']
      }];
    }
    
    this.updateBlogSection();
  }

  /**
   * 블로그 섹션 업데이트
   */
  updateBlogSection() {
    const currentLang = this.stateManager.getState('language');
    const blogGrid = document.querySelector('.blog-grid');
    
    if (!blogGrid || this.blogPosts.length === 0) {
      return;
    }
    
    // 블로그 타이틀 업데이트
    const blogTitle = document.querySelector('#blog .section-title');
    if (blogTitle) {
      blogTitle.textContent = currentLang === 'ko' ? '블로그 포스트' : 'Blog Posts';
    }
    
    // UI 텍스트
    const readMoreText = currentLang === 'ko' ? '자세히 보기' : 'Read More';
    
    // 블로그 포스트 HTML 생성
    blogGrid.innerHTML = this.blogPosts.map((post, index) => `
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
            <a href="${post.link}" class="blog-link" target="_blank" rel="noopener noreferrer">${readMoreText}</a>
          </div>
        </div>
      </article>
    `).join('');
    
    console.log('블로그 섹션 업데이트 완료');
    this.eventBus.emit('blog:sectionUpdated', { posts: this.blogPosts });
  }

  /**
   * 수동으로 블로그 포스트 새로고침
   */
  async refreshBlogPosts() {
    // 캐시 제거
    localStorage.removeItem(this.cacheKey);
    
    // 새로 로드
    await this.loadBlogPosts();
  }

  /**
   * 현재 블로그 포스트 가져오기
   * @returns {Array} 현재 블로그 포스트 배열
   */
  getBlogPosts() {
    return this.blogPosts;
  }

  /**
   * 로딩 상태 확인
   * @returns {boolean} 로딩 중인지 여부
   */
  isLoadingPosts() {
    return this.isLoading;
  }

  /**
   * 매니저 정리
   */
  destroy() {
    this.isLoading = false;
    this.blogPosts = [];
  }
}

// Export for use in main app
window.BlogManager = BlogManager;