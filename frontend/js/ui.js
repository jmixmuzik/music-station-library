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
          <p class="track-card__artist">${this.escapeHtml(track.artist || 'Unknown Artist')}</p>
        </div>
        
        <div class="track-card__info">
          <span class="track-card__bpm">${track.bpm || 'N/A'} BPM</span>
          <span class="track-card__key">${track.key || 'N/A'}</span>
          <span class="track-card__duration">${this.formatDuration(track.duration || 0)}</span>
        </div>
        
        <div class="track-card__tags">
          ${(track.genre || []).map(g => `<span class="tag tag--genre">${this.escapeHtml(g)}</span>`).join('')}
          ${(track.mood || []).map(m => `<span class="tag tag--mood">${this.escapeHtml(m)}</span>`).join('')}
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
        e.stopPropagation();
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
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 유틸리티: 시간 포맷
  formatDuration(seconds) {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

// 전역 인스턴스
const uiManager = new UIManager();

