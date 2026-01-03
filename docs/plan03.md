
## 9. 테스트 전략

### 9.1 Phase 1 (프론트엔드)
- [ ] Mock 데이터로 모든 UI 작동 확인
- [ ] 필터링 로직 정확성 검증
- [ ] 오디오 재생 안정성 테스트
- [ ] 다양한 브라우저 호환성 (Chrome, Firefox, Safari)

### 9.2 Phase 2 (백엔드 통합)
- [ ] 각 API 엔드포인트 정상 작동 확인
- [ ] 프론트-백엔드 통신 검증
- [ ] 에러 케이스 처리 확인
- [ ] 성능 테스트 (100곡 로딩 시간)

### 9.3 Phase 3 (데이터베이스)
- [ ] CRUD 작업 정상 동작
- [ ] JSON 백업/복원 무결성 검증
- [ ] 동시 접속 테스트
- [ ] 데이터 무결성 검증

---

## 10. 배포 및 실행

### 10.1 로컬 개발 환경

**프론트엔드 (Phase 1):**
```bash
# 간단한 HTTP 서버로 실행
cd frontend
python -m http.server 8080
# 또는
npx serve .
```

**전체 스택 (Phase 2+):**
```bash
# Docker Compose로 실행
docker-compose up --build
```

### 10.2 Synology NAS 배포

```bash
# NAS에 SSH 접속 후
cd /volume1/docker/music-library
git clone <repository-url> .
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

### 10.3 접속 URL
- 프론트엔드: `http://<NAS-IP>:3000`
- 백엔드 API: `http://<NAS-IP>:5000`
- 헬스체크: `http://<NAS-IP>:5000/health`

---

## 11. 체크리스트

### Phase 1 완료 조건
- [ ] Fragment HTML 시스템 작동
- [ ] 모든 UI 컴포넌트 렌더링
- [ ] Mock 데이터 기반 필터링 작동
- [ ] 오디오 플레이어 완전 작동
- [ ] CSS 스타일링 완료
- [ ] 브라우저 콘솔 에러 없음

### Phase 2 완료 조건
- [ ] Flask 서버 정상 실행
- [ ] 모든 API 엔드포인트 응답
- [ ] CORS 설정 완료
- [ ] 프론트엔드에서 API 호출 성공
- [ ] 음악 파일 스트리밍 작동
- [ ] Docker Compose로 전체 스택 실행

### Phase 3 완료 조건
- [ ] SQLite DB 정상 생성
- [ ] CRUD 작업 모두 작동
- [ ] JSON 백업 기능 작동
- [ ] JSON 복원 기능 작동
- [ ] 데이터 영속성 확인

---

## 12. 주의사항 및 제약사항

### 12.1 반드시 지켜야 할 것
- ✅ 프론트엔드에서 프레임워크/라이브러리 사용 금지
- ✅ Jinja2 템플릿 사용 금지
- ✅ API 엔드포인트는 필수적인 것만 구현
- ✅ Phase별 순서 준수 (프론트 → 백엔드 → DB)

### 12.2 현재 고려하지 않는 것
- ❌ 사용자 인증/권한
- ❌ 외부 접속 보안 (HTTPS)
- ❌ 파일 업로드 UI
- ❌ 반응형 모바일 디자인
- ❌ 플레이리스트 기능
- ❌ 자동 메타데이터 추출

### 12.3 확장 가능성을 위한 고려
- 함수/모듈은 독립적으로 작성
- 하드코딩 대신 설정 파일 활용
- API 버전 관리 구조 (현재는 미사용)
- 주석으로 확장 포인트 명시

---

## 13. 참고 자료

### 13.1 기술 문서
- Flask 공식 문서: https://flask.palletsprojects.com/
- SQLite 문서: https://www.sqlite.org/docs.html
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

### 13.2 예제 코드 스니펫
개발 중 필요한 코드 예제는 별도 문서로 제공 가능

---

## 14. 다음 단계

1. **AI 개발자에게 전달할 내용:**
   - 이 기획서 전체
   - Mock 데이터 샘플 (별도 제공)
   - 디자인 참고 이미지 (있다면)

2. **개발 시작:**
   - Phase 1부터 순차적으로 진행
   - 각 Phase 완료 후 검토 및 피드백

3. **커뮤니케이션:**
   - 구현 중 불명확한 부분 질문
   - 기술적 제약으로 불가능한 부분 보고
   - 대안 제시 및 협의

---
