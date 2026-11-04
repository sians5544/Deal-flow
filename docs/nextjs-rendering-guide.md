# Next.js 렌더링 & 최적화 완전 가이드

> DealFlow 프로젝트 기반으로 설명한 Next.js App Router의 핵심 개념들

---

## 목차

1. [ISR (Incremental Static Regeneration)](#1-isr-incremental-static-regeneration)
2. [Server Component vs Client Component](#2-server-component-vs-client-component)
3. [Hydration 과정](#3-hydration-과정)
4. [Streaming과 Suspense](#4-streaming과-suspense)
5. [React Fiber의 우선순위 시스템](#5-react-fiber의-우선순위-시스템)
6. [DealFlow 프로젝트 전체 동작 흐름](#6-dealflow-프로젝트-전체-동작-흐름)

---

## 1. ISR (Incremental Static Regeneration)

### 개념

ISR은 **정적 페이지를 주기적으로 재생성**하는 Next.js의 렌더링 전략입니다.

```typescript
// app/best/page.tsx
export const revalidate = 10; // 10초마다 재검증

export default async function BestPage() {
  const deals = await fetchDeals();
  return <DealGrid deals={deals} />;
}
```

### 동작 방식 (Stale-While-Revalidate)

```
시간축:
0초   → 페이지 첫 생성 (데이터 A)

1초   → 리로드 → 캐시된 데이터 A 반환 ✅ (빠름!)
5초   → 리로드 → 캐시된 데이터 A 반환 ✅
9초   → 리로드 → 캐시된 데이터 A 반환 ✅

10초  → 리로드 → 캐시된 데이터 A 반환 (사용자는 바로 응답)
           + 백그라운드에서 재생성 시작 (데이터 B)

11초  → 리로드 → 여전히 데이터 A 반환 (재생성 중...)

12초  → 재생성 완료! (데이터 B로 교체)

13초  → 리로드 → 새로운 데이터 B 반환 ✅
```

### 캐시되는 것

- **HTML 파일**: `.next/server/app/best/index.html`
- **RSC Payload**: `.next/server/app/best/index.rsc`

### 개발 vs 프로덕션

| 명령어 | 환경 | ISR 동작 |
|--------|------|----------|
| `pnpm dev` | 개발 | ❌ 항상 최신 데이터 |
| `pnpm build && pnpm start` | 프로덕션 | ✅ 정상 동작 |

---

## 2. Server Component vs Client Component

### Server Component (기본값)

```typescript
// app/best/page.tsx
export default async function BestPage() {
  // 서버에서만 실행
  const deals = await fetchDeals();

  return (
    <div>
      <h1>베스트 딜</h1>
      {deals.map(deal => (
        <DealCard key={deal.id} deal={deal} />
      ))}
    </div>
  );
}
```

**특징:**
- ✅ 데이터 fetch 가능 (DB, API 직접 접근)
- ✅ 환경변수 안전하게 사용
- ✅ SEO 최적화
- ❌ `useState`, `useEffect` 사용 불가
- ❌ 브라우저 API 사용 불가

### Client Component

```typescript
// components/DealCard.tsx
'use client'; // ← 필수!

export function DealCard({ deal }: { deal: Deal }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(deal.endTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [deal.endTime]);

  return (
    <div>
      <span>{timeLeft}</span>
      <button onClick={() => addToCart(deal.id)}>
        장바구니 담기
      </button>
    </div>
  );
}
```

**특징:**
- ✅ `useState`, `useEffect` 사용 가능
- ✅ 브라우저 API 사용 (window, document)
- ✅ 이벤트 핸들러 (onClick, onChange)
- ❌ 서버에서 데이터 fetch 불가
- ❌ 번들 크기 증가

### 언제 Client Component를 사용하나?

1. **타이머/실시간 업데이트** (useState + useEffect)
2. **사용자 인터랙션** (클릭, 폼 입력)
3. **브라우저 API** (localStorage, geolocation)
4. **애니메이션** (Framer Motion 등)

---

## 3. Hydration 과정

### 개념

**Hydration**: 서버에서 생성된 HTML에 React 코드를 연결하는 과정

### 전체 흐름

```
1. 서버에서 HTML 생성
   ↓
2. 브라우저가 HTML 수신 → 즉시 화면 표시 (정적, 클릭 안 됨)
   ↓
3. JS 번들 다운로드 (0.3초)
   ↓
4. React Hydration 시작
   - RSC Payload 읽기
   - useState 초기화
   - useEffect 실행
   - 이벤트 리스너 연결
   ↓
5. Interactive! (클릭 가능, 타이머 작동)
```

### RSC Payload

```html
<!-- 서버에서 생성된 HTML -->
<div class="card">
  <h2>에어 조던 1</h2>
  <span class="timer"></span> <!-- 빈 값 -->
  <button>장바구니 담기</button> <!-- 클릭 안 됨 -->
</div>

<!-- RSC Payload (데이터 포함) -->
<script id="__NEXT_DATA__">
{
  "props": {
    "deal": {
      "id": 1,
      "title": "에어 조던 1",
      "endTime": "2024-12-31T23:59:59Z"
    }
  }
}
</script>
```

### Hydration 전후 비교

| 단계 | HTML 표시 | JS 동작 | 상태 |
|------|----------|---------|------|
| **HTML 도착** | ✅ 보임 | ❌ 안 됨 | 정적 |
| **JS 다운로드 중** | ✅ 보임 | ❌ 안 됨 | 정적 |
| **Hydration 완료** | ✅ 보임 | ✅ 동작 | Interactive |

### UX 문제 해결

**문제**: Hydration 전에 사용자가 클릭하면?

**해결책**:
1. **Skeleton UI** - 로딩 중임을 명확히 표시
2. **빠른 Hydration** - 번들 크기 최소화 (0.1-0.3초)
3. **Progressive Enhancement** - JS 없이도 기본 동작

```typescript
// ❌ 이렇게 하지 않음 (모든 컴포넌트에 추가)
const [isHydrated, setIsHydrated] = useState(false);
useEffect(() => setIsHydrated(true), []);

// ✅ 이렇게 함
// 1. Skeleton UI로 로딩 상태 표시
// 2. 빠른 Hydration (0.1-0.3초)
// 3. 사용자가 느끼지 못하게 최적화
```

---

## 4. Streaming과 Suspense

### 공식 용어

Next.js 공식 문서: **"Loading UI and Streaming"**

### 두 가지 방법

#### 1️⃣ `loading.tsx` - 라우트 레벨

```typescript
// app/best/loading.tsx
export default function Loading() {
  return <DealGridSkeleton />;
}

// app/best/page.tsx
export default async function BestPage() {
  const deals = await fetchDeals(); // 느려도 OK
  return <DealGrid deals={deals} />;
}
```

#### 2️⃣ `<Suspense>` - 컴포넌트 레벨

```typescript
import { Suspense } from 'react';

export default function BestPage() {
  return (
    <>
      <h1>베스트 딜</h1> {/* 즉시 표시 */}

      <Suspense fallback={<DealsSkeleton />}>
        <DealsList /> {/* 느리게 로드 */}
      </Suspense>

      <Suspense fallback={<ReviewsSkeleton />}>
        <ReviewsList /> {/* 별도로 로드 */}
      </Suspense>
    </>
  );
}
```

### Streaming 동작

```
서버:
  1. <h1> 렌더링 → Chunk 1 전송 (즉시)
  2. fetchDeals() 호출 → 대기 중...
  3. Placeholder 전송 → Chunk 2
  4. deals 도착 → <DealGrid> 렌더링 → Chunk 3 전송

브라우저:
  1. Chunk 1 도착 → <h1> 표시 ✅
  2. Chunk 2 도착 → Skeleton 표시 ⏳
  3. Chunk 3 도착 → DealGrid로 교체 ✅
  4. Hydration 시작 → Interactive!
```

---

## 5. React Fiber의 우선순위 시스템

### Lane 모델 (React 18+)

```typescript
// React 소스 코드 (ReactFiberLane.js)

export const SyncLane = 0b0000000000000000000000000000001;
// ↑ 최고 우선순위 (클릭, 키보드 입력)

export const InputContinuousLane = 0b0000000000000000000000000000100;
// ↑ 연속 입력 (마우스 이동, 스크롤)

export const DefaultLane = 0b0000000000000000000000000010000;
// ↑ 일반 업데이트

export const TransitionLane1 = 0b0000000000000000000000001000000;
// ↑ startTransition() 내부

export const IdleLane = 0b0100000000000000000000000000000;
// ↑ 백그라운드 작업
```

### 5가지 우선순위 레벨

| 레벨 | 이름 | 용도 | 예시 |
|------|------|------|------|
| **1️⃣ 최고** | `SyncLane` | 사용자 입력 | 클릭, 키보드 입력 |
| **2️⃣ 높음** | `InputContinuousLane` | 연속 입�� | 마우스 이동, 스크롤 |
| **3️⃣ 중간** | `DefaultLane` | 일반 업데이트 | fetch 완료, setState |
| **4️⃣ 낮음** | `TransitionLane` | 비긴급 전환 | `startTransition()` |
| **5️⃣ 최저** | `IdleLane` | 백그라운드 | 분석, 로깅 |

### DealFlow 적용 예시

```typescript
// SyncLane (최고 우선순위)
<button onClick={handleAddToCart}>
  장바구니 담기
</button>

// InputContinuousLane (높은 우선순위)
<input onChange={handleSearch} />

// DefaultLane (중간 우선순위)
setInterval(() => {
  setTimeLeft(newTime);
}, 1000);

// TransitionLane (낮은 우선순위)
startTransition(() => {
  setTab('fashion');
});
```

### 우선순위 충돌 시

```
타이머 업데이트 중 (DefaultLane)
    ↓
사용자가 버튼 클릭! (SyncLane)
    ↓
타이머 중단 → 클릭 이벤트 먼저 처리 ✅
    ↓
완료 후 타이머 재개
```

### 수동 우선순위 조정

```typescript
// 낮은 우선순위로 변경
import { startTransition } from 'react';

startTransition(() => {
  setTab(newTab); // TransitionLane으로 강등
});

// 값 지연
const deferredQuery = useDeferredValue(searchQuery);

// 로딩 상태 포함
const [isPending, startTransition] = useTransition();
```

---

## 6. DealFlow 프로젝트 전체 동작 흐름

### 현재 구조

```typescript
// app/best/page.tsx (Server Component)
export const revalidate = 10;

const BestDealsPage = async () => {
  const response = await GET();
  const deals: Deal[] = await response.json();

  return (
    <div>
      <h1>Best Deals</h1>
      {deals.map(deal => (
        <DealCard key={deal.id} deal={deal} />
      ))}
    </div>
  );
};

// components/DealCard.tsx (Client Component)
'use client';

export function DealCard({ deal }: { deal: Deal }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(deal.endTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [deal.endTime]);

  return (
    <div className="card">
      <img src={deal.thumbnail} />
      <h2>{deal.title}</h2>
      <span className="timer">{timeLeft}</span>
      <button onClick={() => addToCart(deal.id)}>
        장바구니 담기
      </button>
    </div>
  );
}
```

### Phase 1: 빌드 타임 (`pnpm build`)

```
1. Next.js가 app/best/page.tsx 실행
   ↓
2. GET() 호출 → Mock 데이터 12개 받음
   ↓
3. Server Component 렌더링
   - <h1>Best Deals</h1> 생성
   - deals.map() 실행 → 12개 DealCard
   ↓
4. Client Component는 Placeholder로 표시
   - <DealCard> → <!--$?--> (RSC Payload 마커)
   ↓
5. HTML 생성 + RSC Payload 포함
   ↓
6. .next/server/app/best.html 파일로 저장 (캐시!)
```

### Phase 2: 사용자 요청 (10초 이내)

```
1. 사용자가 /best 접속
   ↓
2. Next.js가 캐시된 HTML 파일 반환 (0.001초! 초고속)
   ↓
3. 브라우저가 HTML 파싱 시작
   - Header 렌더링 → 즉시 표시 ✅
   - <h1>Best Deals</h1> → 즉시 표시 ✅
   - DealCard HTML → 즉시 표시 ✅
     (하지만 타이머는 빈 값, 버튼 클릭 안 됨)
   ↓
4. JS 번들 다운로드 시작 (병렬)
   - framework.js
   - main.js
   - page.js (DealCard 코드 포함)
   ↓
5. JS 다운로드 완료 (0.3초)
   ↓
6. React Hydration 시작!
```

### Phase 3: React Fiber + Hydration

```
1. Fiber Tree 생성
   <BestDealsPage>
     ├─ <h1> (Server Component, 이미 렌더링됨)
     ├─ <DealCard deal={deals[0]}> (Client, Hydration 필요!)
     ├─ <DealCard deal={deals[1]}>
     └─ ... 12개

2. Fiber가 작업 우선순위 결정
   - Header: 높음 (이미 완료)
   - DealCard: 중간 (12개를 순차적으로)

3. Hydration 시작 (Fiber가 작은 단위로 분할)

   3-1. DealCard 1번 Hydration
        ✅ RSC Payload에서 deal 데이터 읽기
        ✅ useState(timeLeft) 초기화
        ✅ useEffect 실행 → 타이머 시작!
        ✅ onClick 핸들러 연결
        → 완료! (0.02초)

   3-2. DealCard 2번 Hydration
        (같은 과정 반복)

   3-3. ... 12번까지 (총 0.24초)

4. 모든 Hydration 완료!
   ✅ 타이머 실시간 업데이트 (01:23:45 → 01:23:44)
   ✅ 버튼 클릭 가능
   ✅ 완전히 Interactive!
```

### Phase 4: 런타임 (Hydration 완료 후)

```typescript
// 각 DealCard에서 타이머 동작 (DefaultLane)
setInterval(() => {
  const remaining = calculateTimeLeft(deal.endTime);
  setTimeLeft(remaining); // React가 리렌더링
}, 1000);

// 사용자 클릭 시 (SyncLane - 최고 우선순위)
<button onClick={handleAddToCart}>
  // 타이머 업데이트 중단 → 클릭 먼저 처리!
</button>
```

### 전체 타이밍

```
총 소요 시간: 약 0.54초

- HTML 반환: 0.001초
- HTML 파싱 + 화면 표시: 즉시
- JS 다운로드: 0.3초
- Hydration (12개 카드): 0.24초
- Interactive!

ISR: 10초마다 백그라운드 재생성
```

---

## 추가 참고 자료

### Next.js 공식 문서
- [Loading UI and Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)

### React 공식 문서
- [useTransition](https://react.dev/reference/react/useTransition)
- [Suspense](https://react.dev/reference/react/Suspense)

### React 소스 코드
- [ReactFiberLane.js](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberLane.js)

---

## 요약

### 핵심 개념 5가지

1. **ISR**: 정적 페이지를 주기적으로 재생성 (Stale-While-Revalidate)
2. **Server/Client Component**: 데이터 fetch vs 인터랙션
3. **Hydration**: 서버 HTML에 React 연결
4. **Streaming**: 점진적 렌더링 (loading.tsx, Suspense)
5. **React Fiber**: 우선순위 기반 렌더링 (Lane 모델)

### 실무 Best Practice

```typescript
✅ 서버에서 데이터 fetch (Server Component)
✅ 클라이언트에서 인터랙션 처리 (Client Component)
✅ Skeleton UI로 로딩 상태 표시
✅ 빠른 Hydration (번들 크기 최소화)
✅ Suspense로 점진적 렌더링
✅ startTransition으로 우선순위 조정
```

---

**작성일**: 2024-02-24
**프로젝트**: DealFlow
**Next.js 버전**: 16.1.6
**React 버전**: 19.2.3
