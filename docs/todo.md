# 할 일

위에서부터 하나씩 처리하고, 끝난 항목은 지웁니다. 무엇을 왜 바꿨는지는 `improvement-notes.md`, `testing-notes.md`에 남깁니다.

## 1. 버그 정리
- [ ] 카테고리를 데이터에 코드값(`food`)으로 저장하고 화면 표시만 라벨로 (`getCategoryValue` → `getCategoryLabel`)

## 2. 홈 화면 (`/`) — bkit PDCA 첫 적용
- [ ] 임시 화면(`home page`, `Click me`)을 실제 홈으로: 오늘 오픈 / 마감 임박 / 베스트 섹션
- [ ] `/pdca plan` → do → `/jest-test` → analyze 순서로 진행해 보고, `testing-notes.md` 5번을 실제 흐름에 맞게 고치기

## 3. 상세 페이지 정리
- [ ] 서버 컴포넌트로 전환 + `loading.tsx`, `not-found.tsx`, `generateMetadata`
- [ ] 화살표 버튼 `aria-label`, `DealImages`에 `"use client"`
- [ ] 썸네일 클릭·화살표와 캐러셀 위치 동기화
- [ ] 목록 썸네일 흑백 필터·안 쓰는 덮개 요소 제거, 상품명과 안 맞는 사진 교체

## 4. 검색
- [ ] 헤더 검색창 동작 (`?q=`를 URL에 두고 서버에서 거르기)

## 5. 찜·장바구니
- [ ] 담기·수량·총액, 새로고침해도 유지 (클라이언트 상태)

## 6. E2E (Playwright)
- [ ] 카테고리 필터 흐름, 카드 → 상세, 없는 상품, 탭·페이지 이동

## 정할 것 (정책)
- [ ] `?page=abc`, page 0 이하: 1페이지로 맞출지 404로 보낼지
- [ ] 모르는 `?tab=` 값: `open`으로 맞출지 404로 보낼지

## 이후 큰 방향
- 딜 관리자 화면(그리드, 편집본·확정본 상태), MCP로 AI가 딜 조작, Supabase(의존성 주입 구조로)
