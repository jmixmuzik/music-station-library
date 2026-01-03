
## 부록 A: 개발 환경 설정

### A.1 로컬 개발 환경 (Windows/Mac/Linux)

**필요한 도구:**
- Python 3.9+
- Node.js (간단한 HTTP 서버용, 선택사항)
- Docker Desktop (Phase 2+)
- VSCode 또는 원하는 에디터

**초기 설정:**
```bash
# 프로젝트 클론
git clone <repository-url>
cd music-library

# Python 가상환경 생성
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Python 패키지 설치
cd backend
pip install -r requirements.txt

# 프론트엔드 로컬 서버 실행 (Phase 1)
cd ../frontend
python -m http.server 8080
```

### A.2 Synology NAS 설정

**SSH 접속 활성화:**
1. DSM > 제어판 > 터미널 및 SNMP
2. SSH 서비스 활성화

**Docker 설치:**
1. 패키지 센터에서 Docker 설치
2. Container Manager 실행

**프로젝트 배포:**
```bash
# SSH로 NAS 접속
ssh admin@<NAS-IP>

# 프로젝트 디렉토리 생성
mkdir -p /volume1/docker/music-library
cd /volume1/docker/music-library

# 프로젝트 파일 업로드 (FileStation 또는 git clone)

# Docker Compose 실행
sudo docker-compose up -d

# 로그 확인
sudo docker-compose logs -f
```

---

## 부록 B: 트러블슈팅

### B.1 일반적인 문제

**문제: Fragment가 로드되지 않음**
- 원인: CORS 정책 또는 경로 문제
