class FilterManager {
  constructor() {
    this.filters = {
      genre: [],
      mood: [],
      bpmMin: null,
      bpmMax: null,
      key: null,
      search: ''
    };
    this.callbacks = [];
  }

  // 필터 업데이트
  updateFilter(filterType, value) {
    switch (filterType) {
      case 'genre':
      case 'mood':
        // 체크박스 토글
        const index = this.filters[filterType].indexOf(value);
        if (index > -1) {
          this.filters[filterType].splice(index, 1);
        } else {
          this.filters[filterType].push(value);
        }
        break;
      
      case 'bpmMin':
      case 'bpmMax':
        this.filters[filterType] = value ? parseInt(value) : null;
        break;
      
      case 'key':
        this.filters[filterType] = value || null;
        break;
      
      case 'search':
        this.filters[filterType] = value;
        break;
    }

    this.notifyChange();
  }

  // 필터 초기화
  reset() {
    this.filters = {
      genre: [],
      mood: [],
      bpmMin: null,
      bpmMax: null,
      key: null,
      search: ''
    };
    this.notifyChange();
    this.updateUI();
  }

  // 현재 필터 값 반환
  getFilters() {
    return { ...this.filters };
  }

  // 변경 콜백 등록
  onChange(callback) {
    this.callbacks.push(callback);
  }

  // 변경 알림
  notifyChange() {
    this.callbacks.forEach(callback => callback(this.getFilters()));
  }

  // UI 업데이트 (체크박스, 입력 필드 등)
  updateUI() {
    // 장르 체크박스
    document.querySelectorAll('.genre-checkbox').forEach(checkbox => {
      checkbox.checked = this.filters.genre.includes(checkbox.value);
    });

    // 무드 체크박스
    document.querySelectorAll('.mood-checkbox').forEach(checkbox => {
      checkbox.checked = this.filters.mood.includes(checkbox.value);
    });

    // BPM 슬라이더
    const bpmMinInput = document.getElementById('bpm-min');
    const bpmMaxInput = document.getElementById('bpm-max');
    if (bpmMinInput) bpmMinInput.value = this.filters.bpmMin || '';
    if (bpmMaxInput) bpmMaxInput.value = this.filters.bpmMax || '';

    // 키 선택
    const keySelect = document.getElementById('key-select');
    if (keySelect) keySelect.value = this.filters.key || '';

    // 검색어
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = this.filters.search;
  }
}

// 전역 인스턴스
const filterManager = new FilterManager();

