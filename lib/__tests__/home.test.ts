import { getHomeSections, selectHomeSections } from "@/lib/home";
import { makeBanner, makeDeal } from "@/test-utils/factories";

// 2026-11-23 한국 시각을 만든다. Jest는 UTC로 고정되어 있다.
const kst = (time: string, date = "2026-11-23") =>
  new Date(`${date}T${time}+09:00`);
const iso = (time: string, date?: string) => kst(time, date).toISOString();

const ids = (list: { id: number }[]) => list.map((item) => item.id);
const pageIds = (pages: { id: number }[][]) => pages.map(ids);

// 지금 진행 중인 딜 (09:00 오픈)
const liveDeal = (id: number, endTime: string, reviewCount = 10) =>
  makeDeal({ id, openTime: iso("09:00"), endTime, reviewCount });

describe("selectHomeSections", () => {
  describe("오늘 마감", () => {
    it("진행 중인 딜은 마감 빠른 순으로 들어간다", () => {
      const deals = [
        liveDeal(1, iso("22:00")),
        liveDeal(2, iso("18:00")),
        liveDeal(3, iso("20:00")),
      ];

      const { closing } = selectHomeSections(deals, [], kst("14:00"));

      expect(ids(closing)).toEqual([2, 3, 1]);
    });

    it("진행 중인 딜이 7개 이상이면 6개까지만 담는다", () => {
      const deals = Array.from({ length: 8 }, (_, i) =>
        liveDeal(i + 1, iso(`${15 + i}:00`)),
      );

      const { closing } = selectHomeSections(deals, [], kst("14:00"));

      expect(ids(closing)).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it("마감 시각이 같으면 id 순이다", () => {
      const deals = [liveDeal(3, iso("18:00")), liveDeal(1, iso("18:00"))];

      const { closing } = selectHomeSections(deals, [], kst("14:00"));

      expect(ids(closing)).toEqual([1, 3]);
    });

    it("오픈 시각과 같은 순간의 딜은 진행 중으로 분류된다", () => {
      const deal = makeDeal({ id: 1, openTime: iso("14:00"), endTime: iso("18:00") });

      const sections = selectHomeSections([deal], [], kst("14:00"));

      expect(ids(sections.closing)).toEqual([1]);
      expect(sections.upcomingPages).toEqual([]);
    });
  });

  describe("곧 오픈", () => {
    it("오픈 전(08:00)이면 오늘 마감이 비고, 곧 오픈은 오픈 시각 순이며, nextOpenAt은 첫 오픈 시각이다", () => {
      const deals = [
        makeDeal({ id: 1, openTime: iso("11:00"), endTime: iso("20:00") }),
        makeDeal({ id: 2, openTime: iso("09:00"), endTime: iso("20:00") }),
        makeDeal({ id: 3, openTime: iso("10:00"), endTime: iso("20:00") }),
      ];

      const sections = selectHomeSections(deals, [], kst("08:00"));

      expect(sections.closing).toEqual([]);
      expect(pageIds(sections.upcomingPages)).toEqual([[2, 3, 1]]);
      expect(sections.nextOpenAt).toBe(iso("09:00"));
    });

    it("오픈 시각이 같으면 id 순이다", () => {
      const deals = [
        makeDeal({ id: 3, openTime: iso("16:00"), endTime: iso("22:00") }),
        makeDeal({ id: 1, openTime: iso("16:00"), endTime: iso("22:00") }),
      ];

      const { upcomingPages } = selectHomeSections(deals, [], kst("14:00"));

      expect(pageIds(upcomingPages)).toEqual([[1, 3]]);
    });

    it("내일(한국 날짜) 0시에 열리는 딜은 곧 오픈에 없다", () => {
      const deal = makeDeal({
        id: 1,
        openTime: iso("00:00", "2026-11-24"),
        endTime: iso("12:00", "2026-11-24"),
      });

      const { upcomingPages } = selectHomeSections([deal], [], kst("22:00"));

      expect(upcomingPages).toEqual([]);
    });

    it("오픈 예정 딜이 16개 이상이면 15개만 5개씩 담는다", () => {
      const deals = Array.from({ length: 17 }, (_, i) =>
        makeDeal({ id: i + 1, openTime: iso(`15:${String(i).padStart(2, "0")}`), endTime: iso("23:00") }),
      );

      const { upcomingPages } = selectHomeSections(deals, [], kst("14:00"));

      expect(upcomingPages.map((page) => page.length)).toEqual([5, 5, 5]);
      expect(upcomingPages[2].at(-1)?.id).toBe(15);
    });
  });

  describe("베스트", () => {
    it("리뷰 수 많은 순이고, 같으면 id 순이다", () => {
      const deals = [
        liveDeal(1, iso("20:00"), 50),
        liveDeal(2, iso("20:00"), 100),
        liveDeal(3, iso("20:00"), 50),
      ];

      const { bestPages } = selectHomeSections(deals, [], kst("14:00"));

      expect(pageIds(bestPages)).toEqual([[2, 1, 3]]);
    });

    it("아직 오픈 전인 딜도 베스트에 들어간다", () => {
      const deal = makeDeal({ id: 1, openTime: iso("18:00"), endTime: iso("22:00") });

      const { bestPages } = selectHomeSections([deal], [], kst("14:00"));

      expect(pageIds(bestPages)).toEqual([[1]]);
    });

    it("끝나지 않은 딜이 12개면 5·5·2개짜리 3장이다", () => {
      const deals = Array.from({ length: 12 }, (_, i) => liveDeal(i + 1, iso("20:00")));

      const { bestPages } = selectHomeSections(deals, [], kst("14:00"));

      expect(bestPages.map((page) => page.length)).toEqual([5, 5, 2]);
    });

    it("끝나지 않은 딜이 20개면 15개만 5개씩 3장이다", () => {
      const deals = Array.from({ length: 20 }, (_, i) =>
        liveDeal(i + 1, iso("20:00"), 100 - i),
      );

      const { bestPages } = selectHomeSections(deals, [], kst("14:00"));

      expect(bestPages.map((page) => page.length)).toEqual([5, 5, 5]);
      // 2장 첫 카드가 6위다 (순위 번호가 장을 넘어 이어지는 근거)
      expect(bestPages[1][0].id).toBe(6);
    });
  });

  describe("끝난 딜과 빈 결과", () => {
    it("마감 시각과 같은 순간의 딜은 어느 영역에도 없다", () => {
      const deal = liveDeal(1, iso("14:00"));

      const sections = selectHomeSections([deal], [], kst("14:00"));

      expect(sections.closing).toEqual([]);
      expect(sections.upcomingPages).toEqual([]);
      expect(sections.bestPages).toEqual([]);
    });

    it("끝나지 않은 딜이 없으면 곧 오픈·베스트가 빈 배열이고 nextOpenAt은 null이다", () => {
      const deal = liveDeal(1, iso("12:00"));

      const sections = selectHomeSections([deal], [], kst("14:00"));

      expect(sections.upcomingPages).toEqual([]);
      expect(sections.bestPages).toEqual([]);
      expect(sections.nextOpenAt).toBeNull();
    });

    it("마감 시각이 잘못된 딜은 어느 영역에도 없다", () => {
      const deal = makeDeal({ id: 1, openTime: iso("09:00"), endTime: "not-a-date" });

      const sections = selectHomeSections([deal], [], kst("14:00"));

      expect(sections.closing).toEqual([]);
      expect(sections.upcomingPages).toEqual([]);
      expect(sections.bestPages).toEqual([]);
    });

    // 찾은 버그: 오픈 시각만 잘못되면 오늘 마감·곧 오픈에서는 빠지지만, 베스트는 live(마감 전) 전체에서 고르므로 남는다.
    //   언제 열리는지 모르는 딜이 순위에 오른다.
    // 고칠 방향: live를 만들 때 openTime·endTime이 모두 올바른 딜만 남긴다.
    it.failing("오픈 시각이 잘못된 딜은 베스트에도 없다", () => {
      const deal = makeDeal({ id: 1, openTime: "not-a-date", endTime: iso("20:00") });

      const { bestPages } = selectHomeSections([deal], [], kst("14:00"));

      expect(bestPages).toEqual([]);
    });
  });

  describe("배너", () => {
    it("노출 시작과 같은 순간이면 보이고, 끝과 같은 순간이면 안 보인다", () => {
      const banners = [
        makeBanner({ id: 1, startAt: iso("14:00"), endAt: iso("20:00") }),
        makeBanner({ id: 2, startAt: iso("09:00"), endAt: iso("14:00") }),
      ];

      const sections = selectHomeSections([], banners, kst("14:00"));

      expect(ids(sections.banners)).toEqual([1]);
    });

    it("노출 중인 배너가 6개 이상이면 order 순 5개만 담는다", () => {
      const banners = Array.from({ length: 6 }, (_, i) =>
        makeBanner({ id: i + 1, order: 6 - i, startAt: iso("00:00"), endAt: iso("23:00") }),
      );

      const sections = selectHomeSections([], banners, kst("14:00"));

      expect(ids(sections.banners)).toEqual([6, 5, 4, 3, 2]);
    });

    it("order가 같으면 id 순이다", () => {
      const banners = [
        makeBanner({ id: 2, order: 1, startAt: iso("00:00"), endAt: iso("23:00") }),
        makeBanner({ id: 1, order: 1, startAt: iso("00:00"), endAt: iso("23:00") }),
      ];

      const sections = selectHomeSections([], banners, kst("14:00"));

      expect(ids(sections.banners)).toEqual([1, 2]);
    });

    it("노출 중인 배너가 없으면 banners가 빈 배열이다", () => {
      const banners = [makeBanner({ startAt: iso("15:00"), endAt: iso("21:00") })];

      const sections = selectHomeSections([], banners, kst("14:00"));

      expect(sections.banners).toEqual([]);
    });
  });
});

// 실제 목 데이터(lib/deals.ts, lib/banners.ts)로 시간대별 결과를 확인한다.
describe("getHomeSections", () => {
  it("한국 14:00이면 배너는 1·2·4번이다 (3번은 15시 시작, 5번은 지난 기획전)", () => {
    expect(ids(getHomeSections(kst("14:00")).banners)).toEqual([1, 2, 4]);
  });

  it("한국 16:00이면 3번 배너도 보인다", () => {
    expect(ids(getHomeSections(kst("16:00")).banners)).toEqual([1, 2, 3, 4]);
  });

  it("한국 23:59:30이면 모든 딜이 끝나 오늘 마감·곧 오픈·베스트가 비어 있다", () => {
    const sections = getHomeSections(kst("23:59:30"));

    expect(sections.closing).toEqual([]);
    expect(sections.upcomingPages).toEqual([]);
    expect(sections.bestPages).toEqual([]);
  });

  it("다음 날 00:30이면 어제 딜은 남지 않고, 곧 오픈은 모두 새 날짜의 딜이다", () => {
    const sections = getHomeSections(kst("00:30", "2026-11-24"));
    const dayStart = kst("00:00", "2026-11-24").getTime();

    expect(sections.closing).toEqual([]);
    expect(sections.upcomingPages.flat()).toHaveLength(12);
    for (const deal of sections.upcomingPages.flat()) {
      expect(new Date(deal.openTime).getTime()).toBeGreaterThanOrEqual(dayStart);
    }
  });
});
