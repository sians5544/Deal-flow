# home Jest 보고서 (module-1: 규칙 함수)

> **날짜**: 2026-11-23
> **대상**: `lib/home.ts`, `lib/dealTime.ts`, `lib/banners.ts`, `lib/utils.ts`(`chunk`), `lib/deals.ts`(`kstDayStart`, `getAllDeals(…, now)`, `getBestDeals`)
> **설계서**: [home.design.md 8.1~8.3, 8.5](../02-design/features/home.design.md)

## 다음 단계 판정

**`it.failing` 없음 → analyze 진행 가능.**

첫 실행에서 찾은 `it.failing` 3개는 do로 돌아가 고치고 `it`으로 바꿨다 (아래 "고친 버그").

## 고친 버그 (11-23)

| # | 파일 | 원인 | 고친 방법 |
|---|------|------|-----------|
| 1 | `lib/dealTime.ts` `formatEndLabel` | 날짜가 아닌 문자열이면 `new Date()`가 Invalid Date가 되고, 모든 비교가 false가 되어 마지막 분기로 빠진다 → `"NaN월 NaN일 NaN:NaN 마감"` | 처음에 Invalid Date를 확인해 `{ text: "마감 시간 미정", urgent: false }` |
| 2 | `lib/dealTime.ts` `formatKstTime` | 같은 이유로 `"NaN:NaN"` (곧 오픈 시각 표시에도 쓰임) | Invalid Date면 `"--:--"` |
| 3 | `lib/home.ts` `selectHomeSections` | `live`가 `endTime > now`만 본다. 오픈 시각만 잘못된 딜은 오늘 마감·곧 오픈에서는 빠지지만 베스트는 `live` 전체라 남는다 | `live`를 만들 때 오픈 시각이 올바른 딜만 남긴다 |

## 분류

| 파일 | 종류 | 환경 |
|------|------|------|
| 5개 모두 | 순수 로직 (`lib/`, JSX 없음) | 기본(jsdom), mock 없음. 시각은 `now` 인자, `TZ=UTC` 고정에 `+09:00` 명시 |

## 테스트한 규칙

**`lib/__tests__/dealTime.test.ts`**
- `formatEndLabel`: 59분 59초 남으면 '곧 마감 · HH:MM'이고 urgent다 / 정확히 60분 남으면 urgent가 아니다 / 남은 시간이 0이면 '마감'이다 / 마감이 지났으면 '마감'이다 / 같은 한국 날짜면 '오늘 HH:MM 마감'이다 / 다음 한국 날짜면 '내일 HH:MM 마감'이다 / 이틀 뒤면 'M월 D일 HH:MM 마감'이다 / UTC 날짜는 같아도 한국 날짜가 다음 날이면 '내일'이다 / UTC 날짜는 달라도 한국 날짜가 같으면 '오늘'이다 / ✅(고침) 시각 값이 잘못되면 '마감 시간 미정'을 돌려준다
- `formatKstTime`: 서버가 UTC여도 한국 시각 HH:MM을 돌려준다 / 한 자리 시·분은 앞에 0을 붙인다 / ✅(고침) 시각 값이 잘못되면 '--:--'를 돌려준다

**`lib/__tests__/home.test.ts`**
- 오늘 마감: 진행 중인 딜은 마감 빠른 순으로 들어간다 / 진행 중인 딜이 7개 이상이면 6개까지만 담는다 / 마감 시각이 같으면 id 순이다 / 오픈 시각과 같은 순간의 딜은 진행 중으로 분류된다
- 곧 오픈: 오픈 전(08:00)이면 오늘 마감이 비고, 곧 오픈은 오픈 시각 순이며, nextOpenAt은 첫 오픈 시각이다 / 오픈 시각이 같으면 id 순이다 / 내일(한국 날짜) 0시에 열리는 딜은 곧 오픈에 없다 / 오픈 예정 딜이 16개 이상이면 15개만 5개씩 담는다
- 베스트: 리뷰 수 많은 순이고, 같으면 id 순이다 / 아직 오픈 전인 딜도 베스트에 들어간다 / 끝나지 않은 딜이 12개면 5·5·2개짜리 3장이다 / 끝나지 않은 딜이 20개면 15개만 5개씩 3장이다
- 끝난 딜과 빈 결과: 마감 시각과 같은 순간의 딜은 어느 영역에도 없다 / 끝나지 않은 딜이 없으면 곧 오픈·베스트가 빈 배열이고 nextOpenAt은 null이다 / 마감 시각이 잘못된 딜은 어느 영역에도 없다 / ✅(고침) 오픈 시각이 잘못된 딜은 베스트에도 없다
- 배너: 노출 시작과 같은 순간이면 보이고, 끝과 같은 순간이면 안 보인다 / 노출 중인 배너가 6개 이상이면 order 순 5개만 담는다 / order가 같으면 id 순이다 / 노출 중인 배너가 없으면 banners가 빈 배열이다
- `getHomeSections`(실제 목 데이터): 한국 14:00이면 배너는 1·2·4번이다 / 한국 16:00이면 3번 배너도 보인다 / 한국 23:59:30이면 모든 딜이 끝나 오늘 마감·곧 오픈·베스트가 비어 있다 / 다음 날 00:30이면 어제 딜은 남지 않고, 곧 오픈은 모두 새 날짜의 딜이다

**`lib/__tests__/deals.test.ts` (추가분)**
- `kstDayStart`: UTC 15:30이면 한국 다음 날 0시를 돌려준다
- `getAllDeals`: now를 넘기면 그 한국 날짜의 딜을 돌려준다 / getBestDeals를 불러도 getAllDeals는 id 순서를 유지한다
- `getBestDeals`: 리뷰 수가 많은 순이고, 같으면 id 순이다 / 모든 딜이 끝난 시각(23:59:30)에도 끝난 딜을 포함해 12개를 돌려준다 / 카테고리를 넘기면 그 카테고리만 돌려준다

**`lib/__tests__/utils.test.ts`**, **`banners.test.ts`**
- `chunk`: 12개를 5개씩 나누면 5·5·2개다 / 빈 배열이면 빈 배열이다 / size가 0이거나 정수가 아니면 RangeError를 던진다
- `bannerHref`: 배너를 누르면 그 카테고리로 걸러진 /best 주소를 돌려준다

## 분석 과정

### 대상이 하는 일
- `selectHomeSections`: 딜·배너 목록과 지금 시각을 받아, 끝난 것을 빼고 영역마다 정렬·자르기·5개씩 묶기를 한다.
- `formatEndLabel`: 마감 시각과 지금 시각으로 "오늘/내일/곧 마감/마감" 문구를 만든다.

### 네 가지 질문
| 질문 | 본 것 |
|------|-------|
| 보통 경우 | 14:00에 진행 중 딜 정렬, 08:00에 곧 오픈, 같은 날 마감 문구 |
| 비어 있거나 끝 | 경계 시각 4종(마감=now, 오픈=now, 배너 시작=now, 배너 끝=now), 60분 정확히, 개수 상한(6·15·5), 빈 배열, 23:59:30 |
| 이상한 입력 | 날짜가 아닌 시각 문자열 → **버그 3개**, `chunk` size 0·소수 |
| 전에 버그가 났던 곳 | 11-17 자정·시간대 버그: UTC/KST 날짜가 다른 시각 2가지, 다음 날 00:30에 어제 딜이 남지 않는지 |

### 우선순위 (skill 2단계)
- 1번(시간 계산): `formatEndLabel`, `formatKstTime`, `kstDayStart`, 영역의 시각 경계
- 2번(여러 조건): `selectHomeSections`의 필터·정렬·개수, `getBestDeals`
- 그 밖: `chunk`, `bannerHref`는 짧게

### 잘못된 시각 입력을 `it.failing`으로 본 근거
처음에는 "목 데이터는 `toISOString()`으로 만들어서 잘못된 값이 없다"며 `it.todo`로 미루려 했다. 사용자가 "데이터가 어디서 오든 화면 함수는 스스로 방어해야 하고, 관리자 단계까지 미루는 건 프론트엔드 테스트답지 않다"고 판단해 `it.failing`으로 정했다. 근거: 화면에 `NaN월 NaN일`이 그대로 보이는 건 사용자가 겪을 문제가 분명하고, 데이터는 곧 Supabase·관리자 입력으로 바뀐다.
같은 질문을 `selectHomeSections`에도 던져 3번 버그를 찾았다 (마감 시각이 잘못된 경우는 이미 안전해서 `it`으로 고정).

### 실패를 가른 근거
- 처음 실행에서 테스트 쪽 실패는 없었다.
- `it.failing` 3개는 잠깐 `it`으로 바꿔 돌려 실제 값을 확인했다: `"NaN:NaN"`, NaN이 들어간 문구, 베스트에 남은 딜 객체. 셋 다 위 원인과 같아서 구현 쪽 버그로 판단하고 되돌렸다.

### coverage (`lib/home.ts`, `lib/dealTime.ts`)
- 첫 측정에서 `home.ts:33`(곧 오픈의 오픈 시각 동점 → id 순) 분기가 빠져 있었다. 정렬 규칙이라 우선순위 2번 → "오픈 시각이 같으면 id 순이다"를 추가했다.
- 결과: `home.ts` 분기 100%, `dealTime.ts` 문장·분기 100%.
- 남긴 것: `banners.ts:70` `getBanners`의 기본 인자, `deals.ts:25` `todayAt`의 기본 인자(기존 코드). 동작 규칙이 아니라 추가하지 않았다.

## 일부러 테스트하지 않은 것
- 배너 목 데이터의 문구·이미지 주소 (전시용 데이터, 이미지는 module-2에서 교체)
- `HOME_LIMITS` 숫자 자체 (개수 테스트가 대신 확인)
- 화면(module-2·3): `DealCard`, `PagedCarousel`, `useAutoplay`는 그 module이 끝난 뒤 `/jest-test`
- E2E로 넘길 것: 홈 `page.tsx`(async가 아니어도 조립만 하므로), 실제 배너 넘김·스와이프

## 실행 결과
- 1차: 새 테스트 47개 (`it.failing` 3개 포함), 전체 100개 통과 (12 suites)
- 2차 (버그 수정 후): `it.failing` 0개, 전체 100개 통과. `home.ts` 분기 100%, `dealTime.ts` 100% 유지
- `pnpm exec tsc --noEmit` 통과, `pnpm lint` 경고 0

## 계획서와 비교

| 성공 조건 | 상태 |
|-----------|------|
| SUCCESS "각 영역이 규칙대로(끝난 딜 제외, 정렬, 개수, 중복 없음)" | ✅ 규칙 함수 수준에서 확인 (잘못된 시각 입력 포함) |
| FR-01 배너 노출 기간·순서·5장 | ✅ |
| FR-03 곧 오픈 15개·5개씩·오늘만 | ✅ |
| FR-04 베스트 15개·5개씩·리뷰 순 | ✅ |
| FR-05 끝난 딜은 어디에도 없음 | ✅ |
| FR-06 마감 문구 규칙 | ✅ 규칙 (잘못된 입력 포함). `DealCard` 적용은 module-2 |
| FR-08 `nextOpenAt` | ✅ 값만. 안내 문구는 module-3 |
| FR-10 `/best` 리뷰 순 | ✅ `getBestDeals`. 화면 확인은 analyze |
| 4.2 섹션 선택 함수 분기 coverage 100% | ✅ `home.ts` 분기 100% |
| 4.1 `it.failing`이 남지 않음 | ✅ 3개 고친 뒤 0개 |
| FR-02 캐러셀, FR-07 전체보기, FR-09 사진, FR-11 자동 넘김 | 아직 (module-2·3) |

## 면접에서 설명할 한 줄
돈·시간 판단이 걸린 규칙을 화면에서 떼어 `now`만 바꿔 경계 시각과 자정·시간대를 검증했고, "이상한 입력" 질문을 끝까지 밀어붙여 목 데이터에서는 안 보이던 NaN 표시와 베스트 누수를 미리 찾았다.

---

# module-2: 카드 (`DealCard`)

> **날짜**: 2026-11-23
> **대상**: `components/features/deal/components/DealCard.tsx`
> **설계서**: [home.design.md 5.4, 8.4 7~9](../02-design/features/home.design.md)

## 다음 단계 판정 (module-2)

**`it.failing` 없음 → analyze 진행 가능.**

첫 실행에서 찾은 `it.failing` 1개는 do로 돌아가 고치고 `it`으로 바꿨다.

| 파일 | 원인 | 고친 방법 |
|------|------|-----------|
| `DealCard.tsx` 할인율 표시 | 조건 없이 `{deal.discountRate}%`를 그려, 할인율 0이면 빨간 "0%"가 나온다. 상세 화면 `DealInfos.tsx:72`는 11-17에 `discountRate > 0 &&`로 이미 고쳤다 | `hasDiscount = discountRate > 0`일 때만 할인율과 원래 가격 취소선을 그린다. 취소선 줄은 `min-h-5` 빈 칸으로 남겨 카드 높이를 맞춘다 |

## 분류

| 파일 | 종류 | 환경 |
|------|------|------|
| `DealCard.tsx` | 동기 서버 컴포넌트 (지시어 없음, async 아님, 훅 없음) | jsdom + Testing Library. 그려진 결과만 확인, mock 없음. 시각은 `now` prop에 `+09:00`으로 |

## 테스트한 규칙 (`__tests__/DealCard.test.tsx`)
- 기존: 누르면 해당 상품 상세로 이동하는 링크다 / 가격을 천 단위 쉼표와 함께 보여준다 / 카테고리는 코드가 아니라 화면 이름으로 보여준다 / 무료배송이 아니면 '배송비 포함'을 보여준다
- 마감 문구: 마감 30분 전이면 '곧 마감 · HH:MM'을 보여준다 / 마감 5시간 전이면 '오늘 HH:MM 마감'을 보여주고 카운트다운은 없다 / 마감이 지났으면 '마감'을 보여준다 / 마감 시각이 잘못된 값이면 '마감 시간 미정'을 보여준다
- 할인율: ✅(고침) 할인율이 0이면 '0%'를 보여주지 않는다 / 할인율이 0이면 원래 가격 취소선 없이 판매가만 한 번 보여준다

## 분석 과정

### 대상이 하는 일
딜 하나와 지금 시각을 받아, 상세로 가는 카드에 가격과 마감 문구를 보여준다.

### 네 가지 질문
- **보통 경우**: 마감 5시간 전 → `오늘 20:00 마감`, 카운트다운 형식(`HH:MM:SS`) 글자 없음.
- **비어 있거나 끝**: 마감 30분 전(곧 마감), 마감 1초 지남(`마감`).
- **이상한 입력**: 마감 시각 `"abc"` → `마감 시간 미정` (module-1에서 고친 `formatEndLabel` 방어가 카드까지 이어지는지). 할인율 0 → 버그.
- **전에 버그가 났던 곳**: 할인율 0 (11-17 `DealInfos`), 잘못된 시각 (11-23 module-1).

### 우선순위 (skill 2단계)
1번(시간 표시)과 5번(한 번 버그가 났던 곳). 문구 규칙 자체(60분 경계, 오늘/내일, 시간대)는 `dealTime.test.ts`가 이미 확인하므로, 카드에서는 "`now`를 받아 그 결과를 그린다"는 연결만 대표 경우로 확인했다. 같은 경계를 카드에서 다시 테스트하지 않는다.

### 할인율 0을 `it.failing`으로 본 근거
같은 앱의 상세 화면이 기대 동작을 정해 두었다 (`discountRate > 0`일 때만 표시). 할인 없는 상품에 "0%"가 빨갛게 나오는 것은 사용자에게 분명히 이상하다.

### 실패를 가른 근거
`it.failing`을 잠깐 `it`으로 바꿔 돌리면 `found <span class="… text-red-600 …">0%</span>`로 실패한다. 선택자나 환경 문제가 아니라 구현이 0%를 그리기 때문이다. 바로 되돌렸다.

### coverage (`DealCard.tsx`)
구문·분기·함수·줄 모두 100%. urgent 분기(빨강/회색)는 문구 테스트 두 개가 양쪽을 지난다.

## 일부러 테스트하지 않은 것 (module-2)
- "곧 마감"이 빨간 굵은 글씨인지: 클래스로만 확인되는 스타일. urgent 판정은 `formatEndLabel` 테스트가 확인한다.
- 사진 흑백 필터·덮개 제거, 사진 교체: 스타일·데이터. 화면 확인 대상.
- `/today`, `/best`가 `now`를 넘기는지: async 서버 컴포넌트라 Jest로 그리지 않는다. 빠뜨리면 `tsc`가 잡는다 (`now`가 필수 prop). 화면 흐름은 E2E(`docs/todo.md` 6번).

## 실행 결과 (module-2)
- 첫 실행: 9개 중 8 통과 + `it.failing` 1개(기대대로 실패)
- 고친 뒤 `pnpm test -- DealCard.test`: 10 통과, `it.failing` 없음
- 전체 `pnpm test`: 106 통과
- `pnpm exec tsc --noEmit`, `pnpm lint`: 통과

## 계획서와 비교 (module-2)
- 테스트로 확인됨: FR-06 마감 표시를 `DealCard`까지 통일 (곧 마감 / 오늘 / 마감 / 미정)
- 테스트로 확인 안 됨: FR-09 사진 교체·흑백 제거 (스타일·데이터라 화면으로 확인)

## 면접에서 설명할 한 줄 (module-2)
문구 규칙은 이미 순수 함수에서 경계까지 검사했으니, 카드에서는 "받은 시각으로 그 규칙을 그린다"는 연결과 전에 버그가 났던 입력(잘못된 시각, 할인율 0)만 골라 중복 없이 확인했다.

---

# module-3: 홈 화면 (`PagedCarousel`, `useAutoplay`)

> **날짜**: 2026-11-23
> **대상**: `components/features/home/components/useAutoplay.ts`, `components/features/home/components/PagedCarousel.tsx`
> **설계서**: [home.design.md 5.3, 8.4 1~6-1](../02-design/features/home.design.md)
> **함께 한 일 (module-4)**: `app/home-mockup/` 삭제 후 `tsc --noEmit`, `lint`, `test`, `build` 모두 통과 (`/`는 `ƒ` 요청마다 렌더링)

## 다음 단계 판정 (module-3)

**`it.failing` 없음 → analyze 진행 가능.**

## 분류

| 파일 | 종류 | 환경 |
|------|------|------|
| `useAutoplay.ts` | 커스텀 훅 (클라이언트 파일 `PagedCarousel`만 import) | jsdom, `renderHook` + `jest.useFakeTimers()` |
| `PagedCarousel.tsx` | `"use client"` 컴포넌트 | jsdom + Testing Library + userEvent(`advanceTimers`). `embla-carousel-react`는 가짜 api로 교체, `matchMedia`는 `test-utils/browserMocks.ts` |

`useAutoplay.ts`에는 `"use client"`가 없지만 훅을 쓴다. 지금은 클라이언트 파일에서만 import해서 문제가 없다. 서버 컴포넌트가 직접 import하면 깨지지만, 훅은 서버 컴포넌트에서 부를 수 없으므로 실제로 일어날 일은 아니다.

## 테스트한 규칙

**`__tests__/useAutoplay.test.ts`**
- 켜져 있으면 intervalMs마다 onTick을 부른다 / 꺼져 있으면 시간이 지나도 onTick을 부르지 않는다 / 켜졌다가 꺼지면 더 이상 onTick을 부르지 않는다 / resetKey가 바뀌면 처음부터 다시 센다 / onTick이 바뀌어도 타이머를 다시 만들지 않고 마지막 onTick을 부른다 / 언마운트되면 더 이상 onTick을 부르지 않는다

**`__tests__/PagedCarousel.test.tsx`**
- 장 표시와 화살표: 장이 1개면 화살표·장 표시·일시정지 버튼 없이 내용만 그린다 / 자동 넘김이 없으면 일시정지 버튼 없이 '1 / 3'을 보여주고 5초가 지나도 넘기지 않는다 / padIndex면 장 표시를 '01 / 05'처럼 두 자리로 보여준다 / 영역 이름은 label이고 화살표 이름은 '이전·다음 {itemName}'이다 / 다음 화살표를 누르면 캐러셀을 다음 장으로 넘긴다 / 캐러셀이 다른 장을 고르면 장 표시가 그 장으로 바뀐다
- 자동 넘김: autoplay면 5초마다 다음 장으로 넘긴다 / 손으로 넘겨 장이 바뀌면 타이머가 처음부터 다시 센다 / 일시정지를 누르면 버튼 이름이 '자동 넘김 시작'으로 바뀌고 더 넘기지 않는다 / 동작 줄이기가 켜져 있으면 처음부터 '자동 넘김 시작'이고 넘기지 않는다 / 동작 줄이기가 켜져 있어도 사용자가 시작을 누르면 넘긴다 / 마우스가 올라가 있으면 넘기지 않고, 떠나면 다시 넘긴다 / 키보드 포커스가 안에 있으면 안에서 옮겨 다녀도 넘기지 않고, 밖으로 나가면 다시 넘긴다 / 재생 중에는 장 표시를 읽지 않고(aria-live=off), 멈추면 읽는다(polite)

## 분석 과정 (module-3)

### 대상이 하는 일
- `useAutoplay`: 켜져 있는 동안 정해진 간격마다 콜백을 부르고, `resetKey`가 바뀌면 처음부터 다시 센다.
- `PagedCarousel`: 서버에서 그린 장들을 받아 넘기고, 장 번호를 보여주고, 배너일 때만 자동 넘김을 하되 사용자가 읽는 중이면 멈춘다.

### 네 가지 질문
| 질문 | 본 것 |
|------|-------|
| 보통 경우 | 5초마다 넘김, 화살표 누름, select 이벤트로 장 표시 갱신 |
| 비어 있거나 끝 | 장 1개(장치 없음), 4999ms/5000ms 경계, 자동 넘김 없는 캐러셀 |
| 이상한 입력·상황 | 렌더마다 바뀌는 onTick(타이머 재생성 여부), 언마운트 뒤 타이머, 동작 줄이기와 사용자 선택이 부딪칠 때, 캐러셀 안에서 포커스가 옮겨 갈 때(`relatedTarget`) |
| 전에 버그가 났던 곳 | 직접 해당 없음. 시간 관련이라 `DealTimer`처럼 가짜 시간만 쓰고 실제 시간에 기대지 않게 함 (plan 위험 표) |

### 우선순위 (skill 2단계)
- 1번(시간): `useAutoplay`의 간격·재시작. `PagedCarousel`의 "언제 넘기는가"
- 2번(여러 조건): `playing = autoplay && !paused && !hovering && !focusWithin && count > 1`. 조건마다 하나씩 끄는 테스트를 둠
- 4번(상태): `userPaused ?? reducedMotion` (사용자 선택이 설정보다 우선)

### embla를 가짜로 바꾼 이유
jsdom은 레이아웃이 없어 embla가 실제로 넘어가지 않는다. 넘김 자체는 라이브러리의 일이라 테스트 대상이 아니다. 가짜 api(`scrollNext` mock, `select` 이벤트를 직접 발생)로 바꾸면 우리 코드의 연결("타이머 → scrollNext", "select → 장 표시와 타이머 재시작")을 확인할 수 있다. 설계 8.4는 embla용 `IntersectionObserver`·`ResizeObserver` mock도 예상했지만, embla를 가짜로 바꿔서 필요 없어졌다. `browserMocks.ts`에는 컴포넌트가 직접 쓰는 `matchMedia`만 두었다.

### `it.failing`을 만들지 않은 근거
- 포커스가 나가면 자동 넘김이 다시 시작된다. WAI 캐러셀 패턴은 "포커스가 들어오면 멈추고 사용자가 재생을 누를 때까지 다시 시작하지 않는다"를 권하지만, plan 2.2는 "그동안 자동 넘김 멈춤"으로 정했다. 지금 동작이 plan과 같아 `it`으로 고정했다.
- 모바일에서 탭하면 `mouseenter`만 오고 `mouseleave`가 늦게 와서 자동 넘김이 한동안 멈출 수 있다. 사용자가 만진 뒤라 해가 없고 jsdom으로는 실제 터치 이벤트 순서를 재현할 수 없어 E2E·실기기 확인으로 넘긴다.

### 실패를 가른 근거
첫 실행부터 20개가 모두 통과해서 가를 실패가 없었다. 테스트가 아무것도 확인하지 않고 통과하는 일이 없도록, 멈춤 테스트는 모두 "멈춰 있다"와 "풀리면 다시 넘긴다"를 한 테스트 안에서 함께 확인한다(마우스, 포커스). 일시정지 테스트에서는 버튼을 누른 뒤 포커스를 밖으로 빼서, 멈춘 이유가 포커스가 아니라 일시정지임을 분명히 했다.

### coverage
- `useAutoplay.ts` 100%, `PagedCarousel.tsx` 분기 100%·줄 100%
- 빠진 함수 1개: `subscribeReducedMotion`이 돌려주는 정리 함수(언마운트할 때만 불림). 동작 규칙이 아니라 추가하지 않았다.

## 일부러 테스트하지 않은 것 (module-3)
- `SectionHeader`, `EmptyNotice`, `BannerSlide`, `UpcomingPage`, `BestPage`: 동기 서버 컴포넌트지만 조건 없이 받은 값을 그리는 마크업이다. 고르는 규칙(순위 번호가 이어지는지 포함)은 `selectHomeSections`와 `startRank` 계산이 맡고, 화면은 E2E에서 본다.
- 위치 막대 폭, 화살표 위치 같은 스타일
- E2E로 넘길 것: `app/page.tsx` 조립, 실제 스와이프·넘김 애니메이션·무한 반복, 모바일 터치 뒤 자동 넘김, 배너를 누르면 `/best?category=`로 가는 흐름

## 실행 결과 (module-3)
- `pnpm test -- useAutoplay PagedCarousel`: 20 통과 (useAutoplay 6, PagedCarousel 14)
- 전체 `pnpm test`: 14 suites, 126 통과
- `pnpm exec tsc --noEmit`, `pnpm lint`: 통과
- `pnpm build`: 성공

## 계획서와 비교 (module-3)
| 성공 조건 | 상태 |
|-----------|------|
| FR-01 배너 `01 / 05` 표시, 화살표 | ✅ |
| FR-03·FR-04 `1 / 3`, 자동 넘김 없음, 5개 이하면 장치 없음 | ✅ 캐러셀 수준 (장이 1개일 때). 5개씩 묶는 규칙은 module-1 |
| FR-11 5초 간격, 일시정지·재생, 마우스·키보드 포커스 중 멈춤, 동작 줄이기 | ✅ |
| NFR 배너 접근성 (상태에 맞는 버튼 이름, 화살표 이름, 현재 장 읽기) | ✅ `getByRole('button', { name })`, `aria-live` |
| 4.1 `it.failing`이 남지 않음 | ✅ 0개 |
| 4.2 `test`·`tsc`·`lint` 통과, `build` 성공 | ✅ |
| FR-02 오늘 마감 캐러셀, FR-07 전체보기 링크, FR-08 빈 상태 문구 | 테스트 안 함 (페이지 조립). analyze 화면 확인 + E2E |

## 면접에서 설명할 한 줄 (module-3)
넘김 자체는 라이브러리에 맡기고 가짜 api로 바꿔 "언제 넘기는가"라는 우리 규칙만 가짜 시간으로 검증했다. 자동 넘김을 막는 조건 다섯 개를 하나씩 켜고 끄면서, 멈춘 뒤 다시 넘기는지까지 같은 테스트에서 확인했다.
