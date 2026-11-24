# 테스트 노트

Jest 단위 테스트를 도입하면서 무엇을 했고, 무엇을 찾았고, 왜 그렇게 했는지 기록합니다.
(2026-11-10 ~ 11-24)

## 한눈에 보기

| 항목 | 내용 |
|---|---|
| 도구 | Jest + React Testing Library + user-event + jest-dom (`next/jest`로 SWC 변환) |
| 테스트 수 | 14개 파일, 127개 (홈 PDCA까지) |
| 명령 | `pnpm test`, `pnpm test:watch`, `pnpm test:coverage` |
| 찾은 버그 | 7개, 모두 고침 (11-17에 3개는 아래 3번, 홈에서 4개는 `docs/03-analysis/home.jest.md`) |
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

## 5. PDCA 안에서 테스트하는 흐름 (홈에서 실제로 해 본 방식)

PDCA는 bkit 플러그인으로 진행하고, 테스트는 **do와 analyze 사이**에 넣는다. 홈(`/`)을 이 흐름으로 처음 끝까지 진행했다 (2026-11-18 ~ 11-23).

**bkit 기본 흐름과 다른 점 (직접 정한 규칙)**

bkit의 기본 PDCA는 `plan → design → do → analyze(설계 대비 구현 비교) → iterate → report`다. 여기에 테스트 단계와 몇 가지 규칙을 직접 끼워 넣었다. 규칙은 `.claude/CLAUDE.md`의 "작업 규칙"에 적어 두어, 어느 세션에서든 Claude가 같은 순서로 진행한다.

| 바꾼 것 | bkit 기본 | 이 프로젝트 | 이유 |
|---|---|---|---|
| do와 analyze 사이 | 바로 analyze | `/jest-test`를 먼저 돌리고 보고서(`<feature>.jest.md`)를 남김 | analyze는 "설계서대로 만들었나"만 본다. 설계서 자체가 놓친 경우(잘못된 시각 입력 등)는 테스트로만 잡힌다 |
| analyze로 넘어가는 조건 | do가 끝나면 | `it.failing`(찾은 버그)이 0개일 때만. 있으면 do로 돌아가 고치고 `/jest-test` 다시 | 버그가 남은 상태로 일치율을 재면 숫자가 의미 없다 |
| 테스트 보고서 내용 | 없음 | 결과 + 분석 과정(규칙을 고른 근거, 테스트 탓/구현 탓을 가른 근거, coverage) | 면접에서 "왜 이걸 테스트했나"를 직접 설명해야 한다 |
| 성능 측정 | analyze에 항상 포함할 수 있음 | **plan 4.3에서 선택했을 때만**. 선택하면 do 전에 바꾸기 전 값을 재고, analyze에서 같은 방법으로 다시 재서 `<feature>.perf.md`에 비교. 목표 미달이면 iterate | 바꾸기 전 값이 없으면 비교할 수 없고, 모든 기능에 재면 시간만 든다. 홈은 "임시 화면이라 바꾸기 전 값이 의미 없음"으로 선택 안 함 |
| do 단위 | 한 번에 | 설계서 11.3에서 module로 나누고 `--scope module-N`으로 세션마다 하나씩 | 아래 참고 |
| analyze 내용 | 정적 비교 중심 | 정적 비교 + 운영 빌드를 띄워 실제 화면 확인 | 설계서와 코드가 같아도 화면이 어긋날 수 있다 (홈에서 캐러셀 화살표가 사진 위에 겹친 것을 이렇게 찾음) |

홈에서 실제로 돈 순서:

```
plan → design(설계서 11.3에 module 나누기)
  → do --scope module-1 → /jest-test ─┬─ it.failing 있음 → 같은 module에서 고치고 /jest-test 다시
  → do --scope module-2 → /jest-test  │
  → ...                               └─ 없음 → 다음 module
  → 마지막 module: 목업 삭제 + tsc·lint·test·build
  → analyze (gap-detector 정적 비교 + 운영 빌드를 띄워 화면 확인) → 고칠 것 선택 → report
```

- **module마다 새 세션**: `/clear` 후 `/pdca do <feature> --scope module-N`. 설계서를 처음부터 다시 읽고 시작하므로 앞 세션의 기억에 기대지 않는다.
- **module이 끝날 때마다 `/jest-test`**: 처음 계획은 do 전체가 끝난 뒤 한 번이었지만, module마다 돌리니 버그를 그 module 안에서 바로 고칠 수 있었다. 보고서 `docs/03-analysis/<feature>.jest.md`에 module별 절로 쌓는다.
  - 결과뿐 아니라 **어떻게 분석했는지**도 적는다: 규칙을 뽑은 근거, 우선순위 판단, 실패가 테스트 탓인지 구현 탓인지 가린 근거, coverage에서 본 것, 계획서 성공 조건과의 비교.
- **버그가 나오면 do로 돌아간다**: `/jest-test`는 구현을 직접 고치지 않고 `it.failing`으로 기록한다. 고친 뒤 `it`으로 바꾸고 다시 돌린다. 홈에서는 4개가 나왔다 (NaN 마감 문구, `NaN:NaN`, 잘못된 오픈 시각 딜이 베스트에 남음, 카드의 할인율 0%).
- **애매한 동작은 `it.todo`로 미루지 않는다**: "데이터가 어디서 오든 화면 함수는 스스로 방어해야 한다"는 기준으로, 사용자가 겪을 문제가 분명하면 `it.failing`으로 잡는다.
- **analyze**: gap-detector의 설계 대비 구현 비교에 더해, `pnpm build && pnpm start`로 띄운 화면을 응답 코드·HTML 문구·브라우저(데스크톱·390px)로 확인한다. Playwright가 아직 없어서, 확인한 시각에 볼 수 없는 화면(밤에 확인하면 낮 화면)은 Jest 결과로 대신했다. E2E가 생기면 시각을 고정해서 확인한다.
- 진행 상태 폴더 `.bkit/`는 git에 올리지 않는다.

## 6. API 라우트 테스트는 어디까지 확인하나 (실제 DB와 배포)

**질문**
- API 라우트도 Jest로 테스트하는데, 목 데이터라면 무엇을 확인하는 걸까? 실제 DB까지 연결된 확인은 배포해야만 할 수 있나?

**지금 하는 것** (`app/api/deals/__tests__/route.test.ts`, 6개)
- 서버를 띄우지 않고 `route.ts`의 `GET` 함수를 직접 부른다. `new NextRequest("http://localhost/api/deals?category=food")`를 넘기고 돌아온 `Response`의 상태 코드와 JSON을 본다. 라우트는 서버에서 돌므로 `@jest-environment node`.
- 지금은 라우트가 메모리의 목 데이터(`lib/deals.ts`)를 바로 부르므로 mock할 것이 없다.

**라우트 테스트가 확인하는 것: "응답이 오는가"가 아니라 "이 요청이면 이 응답인가"**

라우트는 HTTP 요청과 데이터 함수 사이의 통역사다.

```
HTTP 요청 → ① 입력 읽기 → ② 검사·분기 → ③ 데이터 함수 호출 → ④ 결과를 HTTP 응답으로
           (쿼리, params,  (abc는 숫자    (어떤 함수를 어떤      (상태 코드, JSON 모양)
            body)          아님 → 404)    인자로 부르나)
```

| 지금 테스트 | 확인하는 역할 |
|---|---|
| `category=food`면 2개 | ① 쿼리를 읽어 ③ 함수에 제대로 넘겼나 |
| `tab`이 있으면 `{ page, items }` | ② 분기, ④ 응답 모양 |
| `abc` → 404 | ② 잘못된 입력을 막나 |
| 없는 id → 404, 있는 id → 200 | ④ 결과를 맞는 상태 코드로 바꾸나 |

**Supabase를 붙이면: DB를 가짜로 바꿔 실패 상황을 만든다**

```ts
jest.mock("@/lib/db"); // 진짜 DB 대신 가짜

it("category를 주면 그 값으로 DB를 조회한다", async () => {
  findDeals.mockResolvedValue([]);
  await GET(request("/api/deals?category=food"));
  expect(findDeals).toHaveBeenCalledWith({ category: "food" }); // ③ 인자
});

it("DB가 에러를 내면 500을 돌려준다", async () => {
  findDeals.mockRejectedValue(new Error("connection lost"));
  const res = await GET(request("/api/deals"));
  expect(res.status).toBe(500); // ④ 실패를 맞는 응답으로
});
```

- 진짜 DB로는 "연결이 끊긴 상황"을 마음대로 만들 수 없다. 가짜로 바꾸면 만들 수 있다. 라우트의 에러 처리는 가짜 DB로 테스트한다.
- 백엔드 컨트롤러 테스트에서 서비스·리포지토리를 mock하고 "이 요청이면 이 응답"을 보는 것과 같은 자리다.

**가짜 DB로 확인 못 하는 것 → 배포 전에 실제 DB로 확인한다**

가짜 DB로는 실제 쿼리가 맞는 데이터를 가져오는지(필터·정렬·조인), 테이블 권한(RLS) 때문에 막히는지, 환경변수·네트워크 설정이 맞는지를 알 수 없다. 하지만 **실제 DB가 필요하다는 것이 배포해야 한다는 뜻은 아니다.**

| 방법 | 어떻게 | 확인할 수 있는 것 |
|---|---|---|
| 로컬 Supabase | `supabase start`로 내 PC(Docker)에 진짜 Postgres·Supabase를 띄움 | 쿼리 결과, 정렬·필터, RLS 권한, 마이그레이션 |
| Vercel 미리보기 배포 | main이 아닌 브랜치를 푸시하면 별도 주소로 배포. 운영과 분리된 DB 연결 | 실제 서버 환경(Vercel 함수), 환경변수, 네트워크 연결 |
| CI 통합 테스트 | GitHub Actions에서 로컬 Supabase를 띄우고 테스트 | 위 로컬 확인을 푸시마다 자동으로 |

로컬 Supabase는 진짜 Postgres라 "쿼리가 틀렸다", "RLS에 막혔다"가 운영과 똑같이 재현된다.

**운영 배포 뒤에만 보이는 것**
- 운영 환경변수·키를 잘못 넣은 것 (미리보기는 맞는데 운영만 틀린 경우)
- 실제 데이터 양에서만 느려지는 쿼리, 실제 트래픽·동시 접속
- 운영 DB에만 있는 이상한 데이터

이런 것은 배포 직후 확인(홈 배포 때 `/`를 두 번 요청해 `x-vercel-cache: MISS`, 문구 확인)과 에러 로그 모니터링으로 본다.

**정리: 확인을 층으로 쌓는다**

```
Jest (가짜 DB)      → 라우트·함수 로직         배포 전, 몇 초
로컬 Supabase       → 실제 쿼리·권한           배포 전, 내 PC
미리보기 배포        → 실제 서버 환경·연결      배포 전, 별도 주소
운영 배포 + 확인     → 운영 설정·실제 데이터     배포 후
```

뒤로 갈수록 느리고 비싸다. 문제를 가능한 앞 단계에서 잡는 것이 목표다. Supabase 단계(`docs/todo.md` 2번)를 계획할 때 로컬 Supabase와 미리보기 배포를 어디까지 쓸지 정한다.

**참고**
- 홈 PDCA에서 API 테스트를 추가하지 않은 이유: 홈은 서버 컴포넌트라 API를 HTTP로 부르지 않고 `lib/home.ts`를 직접 부른다. 테스트 대상은 라우트가 아니라 `lib/` 함수였다.
- `route.ts`의 "tab 없으면 best 페이지용" 주석은 낡았다. `/best`는 이제 `getBestDeals`를 직접 부르고, 화면에서 실제로 쓰는 API는 상세의 `/api/deals/[id]`(SWR)뿐이다. 상세 정리(`docs/todo.md` 3번) 때 같이 정리한다.

## 면접에서 설명할 한 줄

"딜 커머스에서 가장 위험한 '오늘'이라는 시간 범위부터 테스트했고, 배포 서버와 같은 UTC로 고정해서 로컬에선 안 보이던 시간대 버그를 찾았습니다. 테스트 기준은 스킬로 만들어, 정답을 가린 상태에서도 같은 버그를 찾는지 검증했습니다."
