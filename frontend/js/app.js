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
      { elementId: 'header', fragmentPath: 'fragments/header.html' },
      { elementId: 'sidebar', fragmentPath: 'fragments/sidebar.html' },
      { elementId: 'footer', fragmentPath: 'fragments/footer.html' }
    ]);

    // 플레이어 바 HTML 추가
    initializePlayerBar();

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

// 플레이어 바 초기화
function initializePlayerBar() {
  const playerBar = document.getElementById('player-bar');
  if (playerBar) {
    playerBar.innerHTML = `
      <div class="player-bar__info">
        <div id="player-title" class="player-bar__title">No track selected</div>
        <div id="player-artist" class="player-bar__artist">-</div>
      </div>
      <div class="player-bar__controls">
        <button id="play-btn" class="player-bar__play-btn">▶</button>
        <div class="player-bar__progress">
          <div id="progress-container" class="player-bar__progress-bar">
            <div id="progress-fill" class="player-bar__progress-fill"></div>
          </div>
          <div class="player-bar__time">
            <span id="current-time">0:00</span> / <span id="duration-time">0:00</span>
          </div>
        </div>
        <div class="player-bar__volume">
          <span>🔊</span>
          <input type="range" id="volume-slider" class="player-bar__volume-slider" min="0" max="100" value="100">
        </div>
      </div>
    `;
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

  // 플레이어 컨트롤 (동적으로 생성되므로 이벤트 위임 사용)
  document.addEventListener('click', (e) => {
    if (e.target.id === 'play-btn' || e.target.closest('#play-btn')) {
      player.togglePlay();
    }
  });

  // 프로그레스 바 클릭 (seek) - 동적 생성되므로 이벤트 위임 사용
  document.addEventListener('click', (e) => {
    const progressContainer = e.target.closest('#progress-container');
    if (progressContainer) {
      const rect = progressContainer.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const time = percent * player.audio.duration;
      if (!isNaN(time)) {
        player.seek(time);
      }
    }
  });

  // 볼륨 컨트롤 - 동적 생성되므로 이벤트 위임 사용
  document.addEventListener('input', (e) => {
    if (e.target.id === 'volume-slider') {
      player.setVolume(e.target.value / 100);
    }
  });
}

// DOMContentLoaded 이벤트
document.addEventListener('DOMContentLoaded', initializeApp);

