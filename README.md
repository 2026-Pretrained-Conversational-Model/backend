# backend — Node.js WebSocket 게이트웨이

> **브라우저와 AI 오케스트레이터를 잇는 중계 계층.** 프론트엔드와는 WebSocket으로 실시간 채팅을, AI 오케스트레이터(FastAPI)와는 HTTP로 통신하며, 업로드된 PDF를 AI 서버로 전달합니다.

전체 프로젝트 개요는 대표 저장소 [docs](https://github.com/2026-Pretrained-Conversational-Model/docs)를 참고하세요.

```
[프론트엔드] ⇄ WebSocket ⇄ ★[Node.js 게이트웨이]★ ⇄ HTTP ⇄ [FastAPI 오케스트레이터(ai-engine)]
```

---

## 역할

| 책임 | 설명 |
| --- | --- |
| 프로토콜 번역 | 브라우저의 WebSocket ↔ 오케스트레이터의 HTTP |
| 파일 중계 | 업로드된 PDF를 `/upload`로 오케스트레이터에 전달 |
| 입출력 정규화 | 프론트가 기대하는 `{type, content}` JSON으로 응답 가공 |

## 프론트 호환 기준

- WebSocket URL: `ws://localhost:8080/ws/chat`
- 파일 업로드 URL: `http://localhost:8080/api/upload`
- 수신 payload 타입: `message`, `message_with_file`
- 송신 응답: `{ "type": "text", "content": "..." }` / `{ "type": "error", "content": "..." }`

---

## 요청 흐름

```
1) 텍스트만:
   브라우저 ─WS{type:message}→ 게이트웨이
       → requestChat(POST /chat) → 오케스트레이터
       → 답변을 {type:text}로 반환

2) 파일 포함:
   브라우저 ─POST /api/upload→ 게이트웨이 (디스크 저장 + fileId 발급)
   브라우저 ─WS{type:message_with_file, fileId}→ 게이트웨이
       → uploadFile(POST /upload, 파일 바이트) → 오케스트레이터 세션에 PDF 부착
       → requestChat(POST /chat, 텍스트만) → 답변 반환
```

> PDF는 경로가 아니라 **바이트를 multipart로 전송**합니다. 오케스트레이터가 별도 서버(RunPod 등)에 있어도 동작하도록 하기 위함입니다.

---

## 실행

```bash
npm install
cp .env.example .env       # AI_ORCHESTRATOR_URL 등 설정
npm run dev
```

환경 변수는 [.env.example](.env.example) 참고 (`PORT`, `AI_ORCHESTRATOR_URL`, `AI_TIMEOUT_MS`, `MAX_FILE_SIZE_MB` 등).

---

## 폴더 구조

```
src/
├── server.js                진입점 (HTTP + WebSocket 부착)
├── app.js                   Express 앱·CORS·REST 라우트
├── config/
│   ├── env.js               환경 변수 로딩
│   └── ai.client.js         오케스트레이터 HTTP 클라이언트(axios) — requestChat / uploadFile
├── controllers/             health / upload
├── middlewares/             error / upload(multer)
├── repositories/
│   ├── session.store.js     세션 데이터 Map 저장소
│   └── file-meta.store.js   업로드 파일 메타(fileId→경로) Map
├── routes/                  health / upload
├── services/
│   ├── chat.service.js      payload 해석 + 오케스트레이터 호출 + 응답 정규화
│   ├── session.service.js   세션 생성/조회/히스토리
│   └── file.service.js      업로드 파일 메타 구성
├── utils/logger.js
└── websocket/               ws.server / ws.handler / ws.events
```

`routes → controllers → services → repositories` 계층 분리로, 저장소 교체(예: Redis) 같은 변경의 영향 범위를 좁혔습니다.

---

## 현재 상태

- 오케스트레이터(ai-engine) 연동 **완료** — 텍스트 채팅과 PDF 업로드가 실제 AI 응답으로 이어집니다.
- 세션 저장소는 인메모리 `Map`(보조 히스토리). 답변에 쓰이는 실제 기억은 오케스트레이터가 소유합니다.

### 향후
- 세션 저장소를 Redis/DB로 교체 (다중 인스턴스 확장)
- 업로드 파일 정리(cleanup) 및 객체 스토리지(S3) 전환

---

## 담당 역할

- 게이트웨이 설계·오케스트레이터 통합: **김예슬 (팀장)**
- 구현: 팀 공동
