# 테스트 노트

Jest 단위 테스트를 도입하면서 무엇을 했고, 무엇을 찾았고, 왜 그렇게 했는지 기록합니다.
(2026-11-10 ~ 11-17)

## 한눈에 보기

| 항목 | 내용 |
|---|---|
| 도구 | Jest + React Testing Library + user-event + jest-dom (`next/jest`로 SWC 변환) |
| 테스트 수 | 8개 파일, 50개 |
| 명령 | `pnpm test`, `pnpm test:watch`, `pnpm test:coverage` |
| 찾은 버그 | 3개 (모두 고침) |
| 자동화 | 로컬 스킬 `/jest-test`로 "무엇을 테스트할지" 판단부터 실행까지 |

## 1. 테스트 환경 구성

**문제**
- 테스트가 하나도 없어서, 1순위 정리(데이터 통합, 카테고리 필터) 후 다른 곳이 깨졌는지 확인할 방법이 손으로 눌러 보는 것뿐이었다.

**해결**
- `jest.config.mjs`: `next/jest`로 Next.js와 같은 방식으로 TS/JSX를 변환하고, `@/` 별칭을 맞췄다.
- `jest.setup.ts`: jest-dom matcher(`toBeInTheDocument` 등)를 등록했다.
- `test-utils/factories.ts`: `makeDeal`, `makeDealDetail`로 기본값을 만들고 테스트마다 필요한 값만 덮어쓴다.
- 사용자 행동은 `fireEvent` 대신 `userEvent`를 쓴다. 실제 클릭처럼 포커스·hover·keydown이 순서대로 일어나기 때문이다.

**이렇게 한 이유**
- 역할을 나눠 이해했다: Jest = 실행·판정·mock, Testing Library = 렌더링·요소 찾기, user-event = 사용자 행동, jest-dom = 화면용 matcher.
- 랜덤 값(faker)은 쓰지 않는다. 실패했을 때 같은 값으로 다시 재현할 수 있어야 한다.

## 2. 무엇을 어떤 방식으로 테스트했나

| 대상 | 종류 | 방법 |
|---|---|---|
| `lib/deals.ts`, `lib/categories.ts` | 순수 로직 | 그대로 호출. 시간은 가짜 시간 |
| `app/api/deals/route.ts` | API Route | `@jest-environment node`, `NextRequest`로 직접 호출 |
| `DealDetail` | 클라이언트 컴포넌트 (SWR) | `global.fetch` mock, `SWRConfig`로 캐시 분리 |
| `DealInfos`, `DealCard` | 컴포넌트 | 사용자가 보는 글자·역할로 요소 찾기 |
| `DealTimer` | 클라이언트 컴포넌트 (타이머) | `jest.useFakeTimers()` + `setSystemTime()` |
| `CategoryTabs` | 클라이언트 컴포넌트 (라우터) | `next/navigation`을 `jest.mock` |
| `page.tsx` (async 서버 컴포넌트) | 테스트 안 함 | 아래 이유 참고 → Playwright E2E 예정 |

**async 서버 컴포넌트를 Jest로 테스트하지 않는 이유**
- Next 15부터 `params`, `searchParams`가 Promise라 `page.tsx`는 대부분 `async` 함수다.
- Testing Library의 `render`는 브라우저용 렌더러(`react-dom/client`)를 써서 async 컴포넌트를 그리지 못한다.
- 그래서 안의 로직은 `lib/` 함수로 빼서 Jest로, 페이지 흐름은 E2E로 확인한다.

## 3. 테스트로 찾은 버그

구현은 바로 고치지 않고 `it.failing`(실패해야 통과하는 테스트)으로 기록했다. 고친 뒤 `it`으로 바꿨다.

### 3-1. 자정이 지나도 어제 딜을 보여줌 (`lib/deals.ts`) — 고침
- **원인**: `const today = new Date()`가 파일 맨 위에 있어서, 모듈이 처음 불러와질 때 한 번만 계산된다. 서버가 자정을 넘겨 계속 떠 있으면 '오늘 오픈' 탭이 어제 날짜를 기준으로 거른다.
- **테스트 방법**: `setSystemTime()`만으로는 이미 계산된 값이 안 바뀐다. 시간을 고정 → `jest.resetModules()` → `import()`로 모듈을 새로 불러온 뒤, 날짜를 넘겨서 확인한다.

### 3-2. 서버가 UTC면 오픈 시각이 9시간 밀림 (`lib/deals.ts`) — 고침
- **원인**: `todayAt(9, 0)`이 서버의 현지 시간대로 시각을 만든다. Vercel은 UTC라 "09:00 오픈"이 한국 시간 18:00이 된다.
- **왜 처음엔 못 찾았나**: 개발 PC가 한국 시간이라 테스트가 항상 통과했다.
- **해결(테스트 쪽)**: `jest.config.mjs` 맨 위에서 `process.env.TZ = "UTC"`로 고정해 배포 서버와 같은 조건에서 돌린다. 테스트 파일 안에서 TZ를 바꾸면 효과가 없다.

**3-1, 3-2를 고친 방법**
- 목 데이터를 파일 맨 위 배열로 두지 않고, `buildDeals(now)`로 조회할 때마다 만든다. 오픈·마감 시각과 '오늘' 범위가 같은 `now`에서 나오므로 자정이 지나면 둘 다 새 날짜로 바뀐다.
- '오늘'은 한국 날짜 0시(`kstDayStart`)부터 24시간이다. 서버 현지 시간 대신 UTC에 9시간을 더해 한국 날짜를 구하므로 서버 시간대와 상관없다.
- 한국 새벽(UTC로는 전날)에도 한국 날짜로 거르는지 테스트를 하나 더 추가했다.

**이렇게 한 이유**
- 목 데이터는 "항상 오늘의 딜"을 흉내 내야 하므로 날짜가 고정되면 안 된다. 12개라 매번 만들어도 비용이 거의 없다.
- 시간대 라이브러리를 넣지 않았다. 한국은 서머타임이 없어 +9시간 고정으로 충분하다. Supabase로 바꾸면 '오늘' 범위 계산만 쿼리 조건으로 옮기면 된다.

### 3-3. 할인율 0이면 화면에 "0"이 찍힘 (`DealInfos.tsx`) — 고침
- **원인**: `{discountRate && <배지 />}`에서 `discountRate`가 0이면 React가 숫자 0을 그대로 그린다.
- **원인 더 자세히**: `A && B`는 A가 거짓 같은 값이면 false가 아니라 A 자체를 돌려준다. React는 `false`·`null`·`undefined`는 그리지 않지만 숫자는 0이라도 글자로 그린다.
- **해결**: `discountRate > 0 &&`로 바꿔 `&&` 앞을 boolean으로 만들었다.
- **Vue와 다른 점**: Vue의 `v-if`는 보여줄지만 정하는 문법이라 조건 값이 화면에 들어가지 않는다. React는 `&&` 연산의 결과값을 그대로 그리므로, 숫자를 조건으로 쓸 때는 비교식으로 바꾼다.

## 4. `/jest-test` 스킬

**문제**
- 테스트를 매번 같은 기준으로 쓰기 어렵다. 특히 "무엇을 먼저 테스트할지"를 정하는 게 가장 오래 걸렸다.

**해결**
- 로컬 스킬 `.claude/skills/jest-test/`를 만들었다.
  - `SKILL.md`: 분류(파일 종류별 환경) → 판단(우선순위, 규칙 목록을 먼저 보여주기) → 생성 → 실행·분석(테스트 쪽 실패인지 구현 버그인지 구분) → 보고
  - `patterns.md`: wshobson/agents의 "JavaScript Testing Patterns"(Vitest)를 참고해 Jest + Next.js용으로 다시 쓴 예시 모음
- 우선순위: 돈·시간 계산 → 여러 조건 로직 → 입력 검증 → 상태 로직 → 예전 버그가 났던 곳

**스킬 검증 (블라인드 테스트)**
- 버그 설명(CLAUDE.md, 개선 노트)과 기존 테스트 파일을 가린 뒤, **새 세션**에서 `/jest-test lib/deals.ts`를 실행했다.
- 결과: 규칙 목록 단계에서 자정 버그를 먼저 짚었고, 3-1과 3-2를 모두 `it.failing`으로 기록했다. 3-2는 기존 테스트에 없던 새 버그다.
- 두 테스트를 일부러 `it`으로 바꿔 돌려서 실제로 실패하는 것도 확인했다.
- 기존 테스트에만 있던 회귀 2개(목록·상세의 가격·마감 일치, 페이지끼리 겹침 없음)를 옮겨 합쳤다.
- 실행하면서 나온 피드백을 스킬에 반영했다: 모듈 로드 시점 값 테스트법, 시간대 고정, 정답이 정해지지 않은 입력은 사용자에게 묻기, coverage 범위 옵션.

**배운 점**
- 첫 시도는 서브에이전트로 했는데, 서브에이전트는 부모 세션이 시작할 때 읽은 CLAUDE.md를 그대로 받아서 정답을 알고 시작했다. 블라인드 평가는 파일을 가린 뒤 **새 세션**에서 해야 한다.

## 5. 앞으로의 진행 방식

PDCA는 bkit 플러그인으로 진행하고, 테스트는 **do와 analyze 사이**에 넣는다.

```
/pdca plan → /pdca design → /pdca do → /jest-test ─┬─ 버그 없음 → /pdca analyze → ...
                                  ↑                 │
                                  └── 버그 있음 ────┘  (do로 돌아가 수정)
```

- **do 중**: 코드를 짜면서 그 파일의 테스트를 수시로 돌린다.
- **do 끝**: 바꾼 파일에 `/jest-test`를 돌린다. 보고서는 `docs/03-analysis/<feature>.jest.md`에 남는다.
  - 결과(통과·실패, 찾은 버그)뿐 아니라 **어떻게 분석했는지**도 적는다: 규칙을 뽑은 근거, 우선순위 판단, 실패가 테스트 탓인지 구현 탓인지 가린 근거, coverage에서 본 것, 계획서 성공 조건과의 비교.
- **버그가 나오면 do로 돌아간다**: `/jest-test`는 구현을 직접 고치지 않고 `it.failing`으로 기록한다. 이 목록이 다시 do에서 할 일이 된다. 고친 뒤 `it.failing`을 `it`으로 바꾸고 `/jest-test`를 다시 돌린다. 버그가 없을 때 analyze로 넘어간다.
- **analyze**: bkit의 설계 대비 구현 비교와 Jest 보고서를 함께 보고 다음 단계(iterate/report)를 정한다.
- 진행 상태 폴더 `.bkit/`는 git에 올리지 않는다.

## 면접에서 설명할 한 줄

"딜 커머스에서 가장 위험한 '오늘'이라는 시간 범위부터 테스트했고, 배포 서버와 같은 UTC로 고정해서 로컬에선 안 보이던 시간대 버그를 찾았습니다. 테스트 기준은 스킬로 만들어, 정답을 가린 상태에서도 같은 버그를 찾는지 검증했습니다."
