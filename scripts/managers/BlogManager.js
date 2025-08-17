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
    // i18nManager는 나중에 참조 (초기화 순서 때문에)
    
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
    
    // I18nManager가 준비될 때까지 기다린 후 블로그 로드
    setTimeout(async () => {
      try {
        await this.loadBlogPosts();
        console.log('✅ BlogManager 초기화 완료');
      } catch (error) {
        console.error('❌ BlogManager 초기화 실패:', error);
      }
    }, 500); // I18nManager 초기화 완료 대기
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
    
    // 캐시 확인 - 캐시된 데이터가 있으면 먼저 표시
    const cachedData = this.getCachedData();
    if (cachedData) {
      this.blogPosts = cachedData;
      this.updateBlogSection();
      console.log('📋 캐시된 블로그 포스트 표시');
      
      // 캐시 시간을 5분에서 2분으로 단축하여 더 자주 업데이트
      if (this.isCacheRecent(2)) {
        console.log('⏰ 캐시가 2분 이내로 최신이므로 새로고침 스킵');
        return;
      }
    }
    
    this.isLoading = true;
    this.eventBus.emit('blog:loadingStart');
    
    // Add loading visual feedback
    const blogSection = document.querySelector('#blog');
    if (blogSection) {
      blogSection.classList.add('blog-section-loading');
    }
    
    try {
      // 여러 프록시 서비스 시도하여 안정성 향상
      const proxyUrls = [
        `${this.proxyUrl}?url=${encodeURIComponent(this.tistoryRssUrl)}`,
        `https://cors-anywhere.herokuapp.com/${this.tistoryRssUrl}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(this.tistoryRssUrl)}`
      ];
      
      let response, data, xmlDoc, newPosts;
      let lastError;
      
      // 프록시 서비스들을 순차적으로 시도
      for (let i = 0; i < proxyUrls.length; i++) {
        try {
          console.log(`🌐 프록시 ${i + 1} 시도: ${proxyUrls[i]}`);
          response = await fetch(proxyUrls[i], {
            method: 'GET',
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'User-Agent': 'Mozilla/5.0 (compatible; BlogFetcher/1.0)'
            }
          });
          
          console.log(`📡 프록시 ${i + 1} 응답:`, response.status, response.statusText);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          // 프록시 서비스에 따라 응답 형식이 다름
          if (i === 0) {
            // AllOrigins
            data = await response.json();
            if (!data.contents) {
              throw new Error('RSS content not found in AllOrigins response');
            }
            xmlDoc = new DOMParser().parseFromString(data.contents, 'text/xml');
          } else if (i === 1) {
            // CORS Anywhere
            const textData = await response.text();
            xmlDoc = new DOMParser().parseFromString(textData, 'text/xml');
          } else {
            // CodeTabs
            const textData = await response.text();
            xmlDoc = new DOMParser().parseFromString(textData, 'text/xml');
          }
          
          // XML 파싱 오류 확인
          if (xmlDoc.documentElement.nodeName === 'parsererror') {
            throw new Error('XML parsing failed');
          }
          
          // RSS 데이터를 포트폴리오 형식으로 변환
          newPosts = this.parseRssXml(xmlDoc);
          
          if (newPosts && newPosts.length > 0) {
            console.log(`✅ 프록시 ${i + 1}에서 성공적으로 ${newPosts.length}개 포스트 로드`);
            break; // 성공하면 다음 프록시 시도 안함
          } else {
            throw new Error('No posts found in RSS feed');
          }
          
        } catch (error) {
          console.warn(`❌ 프록시 ${i + 1} 실패:`, error.message);
          lastError = error;
          continue; // 다음 프록시 시도
        }
      }
      
      // 모든 프록시가 실패한 경우
      if (!newPosts || newPosts.length === 0) {
        throw lastError || new Error('All proxy services failed');
      }
      
      // 새 데이터가 기존 캐시와 다른 경우에만 업데이트
      if (!this.arePostsEqual(this.blogPosts, newPosts)) {
        this.blogPosts = newPosts;
        
        // 캐시에 저장
        this.setCachedData(this.blogPosts);
        
        // 블로그 섹션 업데이트
        this.updateBlogSection();
        console.log(`🔄 새로운 블로그 포스트로 업데이트: ${this.blogPosts.length}개`);
      } else {
        console.log('📋 블로그 포스트 변경 없음');
      }
      
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
      
      // Remove loading visual feedback
      const blogSection = document.querySelector('#blog');
      if (blogSection) {
        blogSection.classList.remove('blog-section-loading');
      }
      
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
   * 캐시가 최근 것인지 확인 (기본 5분, 매개변수로 조정 가능)
   * @param {number} minutes - 확인할 시간(분)
   * @returns {boolean} 캐시가 최근 것인지 여부
   */
  isCacheRecent(minutes = 5) {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) return false;
      
      const { timestamp } = JSON.parse(cached);
      const timeThreshold = minutes * 60 * 1000;
      
      return Date.now() - timestamp < timeThreshold;
    } catch (error) {
      return false;
    }
  }

  /**
   * 두 포스트 배열이 같은지 비교
   * @param {Array} posts1 - 첫 번째 포스트 배열
   * @param {Array} posts2 - 두 번째 포스트 배열
   * @returns {boolean} 같은지 여부
   */
  arePostsEqual(posts1, posts2) {
    if (!posts1 || !posts2) return false;
    if (posts1.length !== posts2.length) return false;
    
    // 제목과 날짜로 비교 (간단한 비교)
    for (let i = 0; i < posts1.length; i++) {
      if (posts1[i].title !== posts2[i].title || posts1[i].date !== posts2[i].date) {
        return false;
      }
    }
    
    return true;
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