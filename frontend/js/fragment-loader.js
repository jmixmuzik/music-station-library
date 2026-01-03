// Fragment 로더 클래스
class FragmentLoader {
  constructor() {
    this.cache = new Map();
  }

  // Fragment HTML 로드
  async load(elementId, fragmentPath, useCache = true) {
    try {
      let html;
      
      // 캐시 확인
      if (useCache && this.cache.has(fragmentPath)) {
        html = this.cache.get(fragmentPath);
      } else {
        const response = await fetch(fragmentPath);
        if (!response.ok) {
          throw new Error(`Failed to load fragment: ${fragmentPath}`);
        }
        html = await response.text();
        this.cache.set(fragmentPath, html);
      }
      
      // DOM에 삽입
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element not found: ${elementId}`);
      }
      element.innerHTML = html;
      
      // 삽입 후 이벤트 발생
      element.dispatchEvent(new CustomEvent('fragmentLoaded', {
        detail: { fragmentPath }
      }));
      
      return true;
    } catch (error) {
      console.error('Fragment load error:', error);
      return false;
    }
  }

  // 여러 Fragment 동시 로드
  async loadMultiple(fragments) {
    const promises = fragments.map(({ elementId, fragmentPath, useCache }) =>
      this.load(elementId, fragmentPath, useCache)
    );
    return Promise.all(promises);
  }

  // 캐시 초기화
  clearCache() {
    this.cache.clear();
  }
}

// 전역 인스턴스 생성
const fragmentLoader = new FragmentLoader();

