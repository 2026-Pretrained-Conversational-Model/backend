# Node WS Backend Baseline

최소 Node.js 백엔드

## 프론트 호환 기준
- WebSocket URL: `ws://localhost:8080/ws/chat`
- 파일 업로드 URL: `http://localhost:8080/api/upload`
- 프론트가 보내는 payload 타입 지원:
  - `message`
  - `message_with_file`
- 서버 응답 형식:
  - `{ "type": "text", "content": "..." }`
  - `{ "type": "error", "content": "..." }`

## 실행 방법
```bash
npm install                          
node src/server.js
```

## 테스트 흐름
### 첫번째 방법 (추천 ㄴㄴ )
1. 서버 실행
2. 프론트 `index.html` / `api.js`를 같은 폴더에 두고 열기
3. 텍스트 메시지 전송
4. PDF 또는 이미지 업로드 후 메시지 전송

### 두번째 방법 

```
npm install                          
node src/server.js
```
- 프론트는 따로 실행 (localhost:3000 으로 실행해주세요)
- python -m http.server 3000 ; 실행 명령어 


## 폴더 구조
```text
node-ws-backend/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   └── env.js
│   ├── controllers/
│   │   ├── health.controller.js
│   │   └── upload.controller.js
│   ├── middlewares/
│   │   ├── error.middleware.js
│   │   └── upload.middleware.js
│   ├── repositories/
│   │   └── session.store.js
│   ├── routes/
│   │   ├── health.routes.js
│   │   └── upload.routes.js
│   ├── services/
│   │   ├── chat.service.js
│   │   ├── file.service.js
│   │   └── session.service.js
│   ├── utils/
│   │   └── logger.js
│   └── websocket/
│       ├── ws.events.js
│       ├── ws.handler.js
│       └── ws.server.js
├── uploads/
├── .env.example
├── package.json
└── README.md
```

## 파일별 역할
- `src/server.js`: HTTP 서버와 WebSocket 서버를 함께 실행하는 진입점
- `src/app.js`: Express 앱 설정, CORS, JSON 파싱, 라우트 연결
- `src/config/env.js`: 환경변수 로딩 및 기본값 관리
- `src/routes/health.routes.js`: 헬스체크 라우트
- `src/routes/upload.routes.js`: 파일 업로드 라우트
- `src/controllers/health.controller.js`: 헬스체크 응답 처리
- `src/controllers/upload.controller.js`: 업로드 요청 처리
- `src/middlewares/upload.middleware.js`: multer 기반 업로드 처리
- `src/middlewares/error.middleware.js`: 공통 에러 처리
- `src/repositories/session.store.js`: 세션 데이터를 메모리에 저장하는 Map 저장소
- `src/services/session.service.js`: 세션 생성/조회/히스토리 추가
- `src/services/file.service.js`: 업로드 파일 메타데이터 정리
- `src/services/chat.service.js`: 메시지 payload를 해석하고 임시 응답 생성
- `src/websocket/ws.server.js`: `/ws/chat` 경로로 WebSocket 업그레이드 처리
- `src/websocket/ws.handler.js`: 메시지 수신/응답/에러 처리
- `src/websocket/ws.events.js`: 지원하는 WS 이벤트 상수 정의
- `src/utils/logger.js`: 간단한 콘솔 로깅 유틸

## 현재 상태
이 버전은 Python / SageMaker 연결 전의 baseline입니다.
- 텍스트 채팅 echo + mock 응답
- 파일 업로드 저장
- 세션별 히스토리 저장

나중에 확장할 부분
- `chat.service.js`에서 Python API 호출
- 파일 업로드 후 PDF 파싱 파이프라인 연결
- 세션 저장소를 Redis/DB로 교체
