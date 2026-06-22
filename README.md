# Deal Flow

시간 한정 특가 딜을 모아 보여주는 Next.js 쇼핑 플랫폼입니다.

## 기술 스택

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI:** shadcn/ui
- **Data Fetching:** SWR (클라이언트), fetch + ISR (서버)

## 시작하기

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

---

## 라우트 구조

```
/               홈 (임시 플레이스홀더)
/best           베스트 딜 목록
/today          오늘의 딜 (탭 + 페이지네이션)
/deals/[id]     상품 상세
```

---

## 페이지별 상세

### `/best` — 베스트 딜

**렌더링:** Server Component (async)

- `DealCardGrid`를 `Suspense`로 감싸 로딩 중엔 `DealCardGridSkeleton` 표시
- `/api/deals` 전체 목록을 4열 그리드로 렌더링
- Next.js `fetch` 캐싱 적용

---

### `/today` — 오늘의 딜

**렌더링:** Server Component (async), `revalidate = 30`

| 기능 | 설명 |
|---|---|
| 탭 | `오늘 오픈` / `오늘 마감` (쿼리 파라미터 `tab=open\|closing`) |
| 페이지네이션 | `page` 쿼리 파라미터, 이전/다음 + 페이지 번호 버튼 |
| 데이터 페칭 | `/api/deals?tab=&page=` 호출, 30초마다 ISR 재검증 |

```
/today?tab=open&page=1
/today?tab=closing&page=1
```

---

### `/deals/[id]` — 상품 상세

**렌더링:** Client Component + SWR

- SWR로 `/api/deals/:id` 클라이언트 사이드 페칭
- `DealImages` (썸네일 + 이미지 갤러리) + `DealInfos` (상세 정보) 레이아웃

---

## API

### `GET /api/deals`

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `tab` | `"open" \| "closing"` | 없으면 전체 목록 반환 (best 페이지용) |
| `page` | `number` | 페이지 번호 (기본값 1) |

**응답 (tab 있을 때):**
```json
{ "items": [...], "total": 12, "page": 1, "totalPages": 1 }
```

**응답 (tab 없을 때):**
```json
[...] // Deal[] 배열 전체
```

현재 목 데이터 12개 사용 (카테고리: 패션, 가전, 뷰티, 생활, 식품).

---

## 컴포넌트 구성

### Feature (`components/features/deal/`)

| 컴포넌트 | 설명 |
|---|---|
| `DealCard` | 딜 카드 1개. 썸네일, 가격, 할인율, 타이머, 별점 표시 |
| `DealCardGrid` | `DealCard` 4열 그리드 |
| `DealCardGridSkeleton` | Suspense fallback |
| `DealTimer` | 카드 썸네일 우하단 남은 시간 + 할인율 배지 |

### Layout (`components/layout/`)

| 컴포넌트 | 설명 |
|---|---|
| `Header` | 상단 네비게이션 바 |
| `Category` / `CategoryTabs` | 카테고리 탭 UI |
| `Container` | 최대 너비 + 좌우 패딩 래퍼 |
| `PageTitle` | 페이지 제목 + 설명 텍스트 |

---

## Deal 타입

```ts
type Deal = {
  id: number;
  thumbnail: string;
  title: string;
  category: string;
  brand: string;
  originalPrice: number;
  salePrice: number;
  discountRate: number;
  openTime: string;   // ISO 8601
  endTime: string;    // ISO 8601
  badge: "BEST" | "HOT" | "NEW" | null;
  rating: number;
  reviewCount: number;
  freeShipping: boolean;
};
```
