## 15. 상세 구현 가이드

### 15.1 Fragment HTML 로더 상세 구현

**fragment-loader.js 완전한 예시:**
```javascript
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
```

**app.js에서 사용 예시:**
```javascript
// 앱 초기화
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Fragment 로드
    await fragmentLoader.loadMultiple([
      { elementId: 'header', fragmentPath: '/fragments/header.html' },
      { elementId: 'sidebar', fragmentPath: '/fragments/sidebar.html' },
      { elementId: 'footer', fragmentPath: '/fragments/footer.html' }
    ]);
    
    // Fragment 로드 완료 후 이벤트 리스너 등록
    initializeEventListeners();
    
    // Mock 데이터 로드
    await loadMockData();
    
    // 초기 렌더링
    renderTracks();
    
  } catch (error) {
    console.error('App initialization failed:', error);
  }
});
```

### 15.2 API 레이어 상세 구현

**api.js - Phase 1 (Mock) 버전:**
```javascript
// API 클래스
class MusicLibraryAPI {
  constructor() {
    this.baseUrl = '/data';  // Mock 데이터 경로
    this.tracks = [];
    this.tags = {};
  }

  // Mock 데이터 로드
  async initialize() {
    try {
      const response = await fetch(`${this.baseUrl}/mock-tracks.json`);
      const data = await response.json();
      this.tracks = data.tracks;
      this.tags = data.tags;
      return true;
    } catch (error) {
      console.error('Failed to load mock data:', error);
      return false;
    }
  }

  // 트랙 목록 조회 (필터링 포함)
  async getTracks(filters = {}) {
    let result = [...this.tracks];

    // 장르 필터
    if (filters.genre && filters.genre.length > 0) {
      result = result.filter(track =>
        track.genre.some(g => filters.genre.includes(g))
      );
    }

    // 무드 필터
    if (filters.mood && filters.mood.length > 0) {
      result = result.filter(track =>
        track.mood.some(m => filters.mood.includes(m))
      );
    }

    // BPM 필터
    if (filters.bpmMin !== undefined) {
      result = result.filter(track => track.bpm >= filters.bpmMin);
    }
    if (filters.bpmMax !== undefined) {
      result = result.filter(track => track.bpm <= filters.bpmMax);
    }

    // 키 필터
    if (filters.key) {
      result = result.filter(track => track.key === filters.key);
    }

    // 텍스트 검색
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(track =>
        track.title.toLowerCase().includes(searchLower) ||
        track.artist.toLowerCase().includes(searchLower)
      );
    }

    return {
      tracks: result,
      total: this.tracks.length,
      filtered: result.length
    };
  }

  // 특정 트랙 조회
  async getTrack(id) {
    return this.tracks.find(track => track.id === id);
  }

  // 태그 목록 조회
  async getTags() {
    return this.tags;
  }

  // 스트리밍 URL 생성
  getStreamUrl(id) {
    const track = this.tracks.find(t => t.id === id);
    return track ? track.filePath : null;
  }
}

// 전역 인스턴스
const api = new MusicLibraryAPI();
```

**api.js - Phase 2 (Real API) 버전으로 전환:**
```javascript
class MusicLibraryAPI {
  constructor() {
    this.baseUrl = 'http://localhost:5000/api';  // 실제 API URL로 변경
  }

  async getTracks(filters = {}) {
    // 쿼리 파라미터 생성
    const params = new URLSearchParams();
    if (filters.genre) params.append('genre', filters.genre.join(','));
    if (filters.mood) params.append('mood', filters.mood.join(','));
    if (filters.bpmMin) params.append('bpm_min', filters.bpmMin);
    if (filters.bpmMax) params.append('bpm_max', filters.bpmMax);
    if (filters.key) params.append('key', filters.key);
    if (filters.search) params.append('search', filters.search);

    const response = await fetch(`${this.baseUrl}/tracks?${params}`);
    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    return data.data;
  }

  async getTrack(id) {
    const response = await fetch(`${this.baseUrl}/tracks/${id}`);
    if (!response.ok) throw new Error('Track not found');
    const data = await response.json();
    return data.data;
  }

  getStreamUrl(id) {
    return `${this.baseUrl}/stream/${id}`;
  }
}
```

### 15.3 필터링 시스템 상세 구현

**filter.js:**
```javascript
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
```

### 15.4 오디오 플레이어 상세 구현

**player.js:**
```javascript
class AudioPlayer {
  constructor() {
    this.audio = new Audio();
    this.currentTrack = null;
    this.isPlaying = false;
    
    // 이벤트 리스너 등록
    this.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
    this.audio.addEventListener('ended', () => this.onEnded());
    this.audio.addEventListener('loadedmetadata', () => this.onLoaded());
  }

  // 트랙 로드
  async loadTrack(track) {
    try {
      this.currentTrack = track;
      this.audio.src = api.getStreamUrl(track.id);
      this.updatePlayerUI();
      return true;
    } catch (error) {
      console.error('Failed to load track:', error);
      return false;
    }
  }

  // 재생
  async play() {
    try {
      await this.audio.play();
      this.isPlaying = true;
      this.updatePlayButton();
    } catch (error) {
      console.error('Playback failed:', error);
    }
  }

  // 일시정지
  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.updatePlayButton();
  }

  // 재생/일시정지 토글
  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  // Seek
  seek(time) {
    this.audio.currentTime = time;
  }

  // 볼륨 설정 (0-1)
  setVolume(volume) {
    this.audio.volume = Math.max(0, Math.min(1, volume));
  }

  // 시간 업데이트 이벤트
  onTimeUpdate() {
    if (!this.currentTrack) return;

    const currentTime = this.audio.currentTime;
    const duration = this.audio.duration;
    const progress = (currentTime / duration) * 100;

    // UI 업데이트
    this.updateProgressBar(progress);
    this.updateTimeDisplay(currentTime, duration);
  }

  // 재생 종료 이벤트
  onEnded() {
    this.isPlaying = false;
    this.updatePlayButton();
  }

  // 로드 완료 이벤트
  onLoaded() {
    const duration = this.audio.duration;
    this.updateTimeDisplay(0, duration);
  }

  // UI 업데이트 함수들
  updatePlayerUI() {
    if (!this.currentTrack) return;

    document.getElementById('player-title').textContent = this.currentTrack.title;
    document.getElementById('player-artist').textContent = this.currentTrack.artist;
  }

  updatePlayButton() {
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
      playBtn.textContent = this.isPlaying ? '⏸' : '▶';
    }
  }

  updateProgressBar(progress) {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
  }

  updateTimeDisplay(current, duration) {
    const currentEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration-time');
    
    if (currentEl) currentEl.textContent = this.formatTime(current);
    if (durationEl) durationEl.textContent = this.formatTime(duration);
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

// 전역 인스턴스
const player = new AudioPlayer();
```

### 15.5 UI 렌더링 상세 구현

**ui.js:**
```javascript
class UIManager {
  constructor() {
    this.trackGridElement = document.getElementById('track-grid');
  }

  // 트랙 목록 렌더링
  renderTracks(tracks) {
    if (!this.trackGridElement) return;

    // 결과 없음 처리
    if (tracks.length === 0) {
      this.trackGridElement.innerHTML = `
        <div class="no-results">
          <p>검색 결과가 없습니다.</p>
        </div>
      `;
      return;
    }

    // 트랙 카드 생성
    const cardsHTML = tracks.map(track => this.createTrackCard(track)).join('');
    this.trackGridElement.innerHTML = cardsHTML;

    // 이벤트 리스너 등록
    this.attachTrackCardListeners();
  }

  // 트랙 카드 HTML 생성
  createTrackCard(track) {
    return `
      <div class="track-card" data-track-id="${track.id}">
        <div class="track-card__header">
          <h3 class="track-card__title">${this.escapeHtml(track.title)}</h3>
          <p class="track-card__artist">${this.escapeHtml(track.artist)}</p>
        </div>
        
        <div class="track-card__info">
          <span class="track-card__bpm">${track.bpm} BPM</span>
          <span class="track-card__key">${track.key}</span>
          <span class="track-card__duration">${this.formatDuration(track.duration)}</span>
        </div>
        
        <div class="track-card__tags">
          ${track.genre.map(g => `<span class="tag tag--genre">${g}</span>`).join('')}
          ${track.mood.map(m => `<span class="tag tag--mood">${m}</span>`).join('')}
        </div>
        
        <button class="track-card__play-btn" data-track-id="${track.id}">
          ▶ Play
        </button>
      </div>
    `;
  }

  // 카드 이벤트 리스너
  attachTrackCardListeners() {
    document.querySelectorAll('.track-card__play-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const trackId = e.target.dataset.trackId;
        const track = await api.getTrack(trackId);
        if (track) {
          await player.loadTrack(track);
          await player.play();
        }
      });
    });
  }

  // 로딩 상태 표시
  showLoading() {
    if (!this.trackGridElement) return;
    this.trackGridElement.innerHTML = `
      <div class="loading">
        <div class="loading__spinner"></div>
        <p>로딩 중...</p>
      </div>
    `;
  }

  // 에러 메시지 표시
  showError(message) {
    if (!this.trackGridElement) return;
    this.trackGridElement.innerHTML = `
      <div class="error">
        <p>${this.escapeHtml(message)}</p>
      </div>
    `;
  }

  // 필터 결과 카운트 업데이트
  updateFilterCount(total, filtered) {
    const countElement = document.getElementById('filter-count');
    if (countElement) {
      countElement.textContent = `${filtered} / ${total} tracks`;
    }
  }

  // 유틸리티: HTML 이스케이프
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 유틸리티: 시간 포맷
  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

// 전역 인스턴스
const uiManager = new UIManager();
```

### 15.6 메인 앱 로직

**app.js 완전한 버전:**
```javascript
// 앱 상태
const appState = {
  isInitialized: false,
  tracks: [],
  filteredTracks: []
};

// 앱 초기화
async function initializeApp() {
  try {
    // Fragment 로드
    await fragmentLoader.loadMultiple([
      { elementId: 'header', fragmentPath: '/fragments/header.html' },
      { elementId: 'sidebar', fragmentPath: '/fragments/sidebar.html' },
      { elementId: 'footer', fragmentPath: '/fragments/footer.html' }
    ]);

    // API 초기화 (Mock 데이터 로드)
    const success = await api.initialize();
    if (!success) {
      throw new Error('Failed to initialize API');
    }

    // 초기 데이터 로드
    await loadTracks();

    // 이벤트 리스너 등록
    initializeEventListeners();

    // 태그 목록 렌더링
    await renderTagFilters();

    appState.isInitialized = true;
    console.log('App initialized successfully');

  } catch (error) {
    console.error('App initialization failed:', error);
    uiManager.showError('앱을 초기화하는데 실패했습니다.');
  }
}

// 트랙 로드
async function loadTracks(filters = {}) {
  try {
    uiManager.showLoading();
    
    const result = await api.getTracks(filters);
    appState.tracks = result.tracks;
    appState.filteredTracks = result.tracks;

    uiManager.renderTracks(result.tracks);
    uiManager.updateFilterCount(result.total, result.filtered);

  } catch (error) {
    console.error('Failed to load tracks:', error);
    uiManager.showError('트랙을 불러오는데 실패했습니다.');
  }
}

// 태그 필터 렌더링
async function renderTagFilters() {
  const tags = await api.getTags();

  // 장르 체크박스
  const genreContainer = document.getElementById('genre-filters');
  if (genreContainer) {
    genreContainer.innerHTML = tags.genres.map(genre => `
      <label class="filter-checkbox">
        <input type="checkbox" class="genre-checkbox" value="${genre}">
        <span>${genre}</span>
      </label>
    `).join('');
  }

  // 무드 체크박스
  const moodContainer = document.getElementById('mood-filters');
  if (moodContainer) {
    moodContainer.innerHTML = tags.moods.map(mood => `
      <label class="filter-checkbox">
        <input type="checkbox" class="mood-checkbox" value="${mood}">
        <span>${mood}</span>
      </label>
    `).join('');
  }

  // 키 드롭다운
  const keySelect = document.getElementById('key-select');
  if (keySelect) {
    keySelect.innerHTML = '<option value="">All Keys</option>' +
      tags.keys.map(key => `<option value="${key}">${key}</option>`).join('');
  }
}

// 이벤트 리스너 초기화
function initializeEventListeners() {
  // 필터 변경 감지
  filterManager.onChange(async (filters) => {
    await loadTracks(filters);
  });

  // 장르 필터
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('genre-checkbox')) {
      filterManager.updateFilter('genre', e.target.value);
    }
  });

  // 무드 필터
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('mood-checkbox')) {
      filterManager.updateFilter('mood', e.target.value);
    }
  });

  // BPM 필터
  const bpmMinInput = document.getElementById('bpm-min');
  const bpmMaxInput = document.getElementById('bpm-max');
  if (bpmMinInput) {
    bpmMinInput.addEventListener('input', debounce((e) => {
      filterManager.updateFilter('bpmMin', e.target.value);
    }, 500));
  }
  if (bpmMaxInput) {
    bpmMaxInput.addEventListener('input', debounce((e) => {
      filterManager.updateFilter('bpmMax', e.target.value);
    }, 500));
  }

  // 키 필터
  const keySelect = document.getElementById('key-select');
  if (keySelect) {
    keySelect.addEventListener('change', (e) => {
      filterManager.updateFilter('key', e.target.value);
    });
  }

  // 검색
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      filterManager.updateFilter('search', e.target.value);
    }, 300));
  }

  // 필터 초기화
  const resetBtn = document.getElementById('reset-filters-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      filterManager.reset();
    });
  }

  // 플레이어 컨트롤
  const playBtn = document.getElementById('play-btn');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      player.togglePlay();
    });
  }

  // 프로그레스 바 클릭 (seek)
  const progressContainer = document.getElementById('progress-container');
  if (progressContainer) {
    progressContainer.addEventListener('click', (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const time = percent * player.audio.duration;
      player.seek(time);
    });
  }

  // 볼륨 컨트롤
  const volumeSlider = document.getElementById('volume-slider');
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      player.setVolume(e.target.value / 100);
    });
  }
}

// Debounce 유틸리티
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// DOMContentLoaded 이벤트
document.addEventListener('DOMContentLoaded', initializeApp);
```

---
