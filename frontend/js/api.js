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

/* 
 * Phase 2 (Real API) 버전으로 전환하려면 위의 클래스를 아래 코드로 교체:
 * 
 * class MusicLibraryAPI {
 *   constructor() {
 *     this.baseUrl = 'http://localhost:5000/api';  // 실제 API URL로 변경
 *   }
 * 
 *   async getTracks(filters = {}) {
 *     // 쿼리 파라미터 생성
 *     const params = new URLSearchParams();
 *     if (filters.genre) params.append('genre', filters.genre.join(','));
 *     if (filters.mood) params.append('mood', filters.mood.join(','));
 *     if (filters.bpmMin) params.append('bpm_min', filters.bpmMin);
 *     if (filters.bpmMax) params.append('bpm_max', filters.bpmMax);
 *     if (filters.key) params.append('key', filters.key);
 *     if (filters.search) params.append('search', filters.search);
 * 
 *     const response = await fetch(`${this.baseUrl}/tracks?${params}`);
 *     if (!response.ok) throw new Error('API request failed');
 *     const data = await response.json();
 *     return data.data;
 *   }
 * 
 *   async getTrack(id) {
 *     const response = await fetch(`${this.baseUrl}/tracks/${id}`);
 *     if (!response.ok) throw new Error('Track not found');
 *     const data = await response.json();
 *     return data.data;
 *   }
 * 
 *   async getTags() {
 *     const response = await fetch(`${this.baseUrl}/tags`);
 *     if (!response.ok) throw new Error('Failed to load tags');
 *     const data = await response.json();
 *     return data.data;
 *   }
 * 
 *   getStreamUrl(id) {
 *     return `${this.baseUrl}/stream/${id}`;
 *   }
 * }
 */

