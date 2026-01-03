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
    if (isNaN(duration)) return;
    
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

    const titleEl = document.getElementById('player-title');
    const artistEl = document.getElementById('player-artist');
    
    if (titleEl) titleEl.textContent = this.currentTrack.title;
    if (artistEl) artistEl.textContent = this.currentTrack.artist || 'Unknown Artist';
  }

  updatePlayButton() {
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
      playBtn.textContent = this.isPlaying ? '⏸' : '▶';
    }
  }

  updateProgressBar(progress) {
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
      progressFill.style.width = `${progress}%`;
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

