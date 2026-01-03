// API 클래스
class MusicLibraryAPI {
  constructor() {
    this.baseUrl = 'data';  // Mock 데이터 경로
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

