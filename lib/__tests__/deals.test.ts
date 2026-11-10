import { getAllDeals, getDealById, getDealsByTab } from "@/lib/deals";

describe("getDealById", () => {
  it("있는 id면 기본 정보와 상세 정보를 합쳐서 돌려준다", () => {
    const deal = getDealById(1);

    expect(deal).not.toBeNull();
    expect(deal?.title).toBe("에어 조던 1 레트로 하이 OG 스니커즈");
    expect(deal?.images.length).toBeGreaterThan(0);
    expect(deal?.returnPolicy).toBeDefined();
  });

  it("없는 id면 null을 돌려준다", () => {
    expect(getDealById(999)).toBeNull();
  });

  it("목록에 있는 모든 상품은 상세 정보도 있다", () => {
    for (const deal of getAllDeals()) {
      expect(getDealById(deal.id)).not.toBeNull();
    }
  });

  it("목록과 상세의 같은 상품은 가격·마감 시간이 같다", () => {
    for (const deal of getAllDeals()) {
      const detail = getDealById(deal.id);
      expect(detail?.salePrice).toBe(deal.salePrice);
      expect(detail?.endTime).toBe(deal.endTime);
    }
  });
});

describe("getAllDeals", () => {
  it("카테고리가 없으면 전체 12개를 돌려준다", () => {
    expect(getAllDeals()).toHaveLength(12);
  });

  it('"food"면 식품 딜만 돌려준다', () => {
    const deals = getAllDeals("food");

    expect(deals).toHaveLength(2);
    expect(deals.every((deal) => deal.category === "식품")).toBe(true);
  });

  it('"all"이나 모르는 카테고리면 거르지 않는다', () => {
    expect(getAllDeals("all")).toHaveLength(12);
    expect(getAllDeals("zzz")).toHaveLength(12);
  });
});

describe("getDealsByTab", () => {
  it("응답에 items, total, page, totalPages가 있다", () => {
    const result = getDealsByTab("open");

    expect(result).toEqual(
      expect.objectContaining({
        items: expect.any(Array),
        total: expect.any(Number),
        page: 1,
        totalPages: expect.any(Number),
      }),
    );
  });

  it("카테고리를 함께 주면 그 카테고리 딜만 돌려준다", () => {
    const { items } = getDealsByTab("open", 1, "tech");

    expect(items.length).toBeGreaterThan(0);
    expect(items.every((deal) => deal.category === "가전")).toBe(true);
  });

  describe("페이지 나누기", () => {
    it("한 페이지 개수만큼만 돌려주고 전체 페이지 수를 계산한다", () => {
      const result = getDealsByTab("open", 1, null, 5);

      expect(result.items).toHaveLength(5);
      expect(result.total).toBe(12);
      expect(result.totalPages).toBe(3);
    });

    it("마지막 페이지에는 남은 개수만 돌려준다", () => {
      expect(getDealsByTab("open", 3, null, 5).items).toHaveLength(2);
    });

    it("페이지끼리 같은 딜이 겹치지 않는다", () => {
      const ids = [1, 2, 3].flatMap((page) =>
        getDealsByTab("open", page, null, 5).items.map((deal) => deal.id),
      );

      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe("오늘 범위 (알려진 버그)", () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    // lib/deals.ts는 파일이 처음 불러와질 때 today를 한 번만 계산한다.
    // 서버가 자정을 넘겨 계속 떠 있으면 '오늘 오픈' 탭이 어제 딜을 보여준다.
    // 고치면 it.failing을 it으로 바꾼다.
    it.failing("자정이 지나면 '오늘 오픈' 탭은 새 날짜 기준으로 거른다", () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-11-10T10:00:00+09:00"));

      jest.isolateModules(() => {
        // 11월 10일에 서버가 떠서 모듈이 불러와짐
        // 모듈을 이 시점(11월 10일)에 새로 불러오기 위해 require를 씁니다.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { getDealsByTab: getByTab } = require("@/lib/deals");

        // 다음 날 아침에 요청이 들어옴
        jest.setSystemTime(new Date("2026-11-11T09:00:00+09:00"));
        const { items } = getByTab("open");

        const openDates = items.map((deal: { openTime: string }) =>
          new Date(deal.openTime).toDateString(),
        );
        expect(
          openDates.every((date: string) => date === new Date().toDateString()),
        ).toBe(true);
      });
    });
  });
});
