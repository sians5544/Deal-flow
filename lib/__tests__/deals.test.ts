import {
  getAllDeals,
  getBestDeals,
  getDealById,
  getDealsByTab,
  kstDayStart,
} from "@/lib/deals";

// 모듈이 불러와지는 시점의 시간이 중요한 테스트용. 캐시를 비우고 새로 불러온다.
const loadDealsAt = async (time: string) => {
  jest.setSystemTime(new Date(time));
  jest.resetModules();
  return import("@/lib/deals");
};

describe("딜 데이터 정합성", () => {
  it("모든 딜은 할인가가 정가보다 낮고, 할인율이 두 가격으로 계산한 값과 같다", () => {
    for (const deal of getAllDeals()) {
      const expectedRate = Math.round(
        (1 - deal.salePrice / deal.originalPrice) * 100,
      );

      expect(deal.salePrice).toBeLessThan(deal.originalPrice);
      expect(deal.discountRate).toBe(expectedRate);
    }
  });

  it("모든 딜은 오픈 시간이 마감 시간보다 빠르다", () => {
    for (const deal of getAllDeals()) {
      expect(new Date(deal.openTime).getTime()).toBeLessThan(
        new Date(deal.endTime).getTime(),
      );
    }
  });
});

describe("딜 시간 계산", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // 예전 버그: `today`를 모듈이 처음 불러와질 때 한 번만 계산해, 서버가 자정을 넘기면 어제 딜을 돌려줬다.
  // (한국·UTC 날짜가 같은 정오 시각을 써서 시간대 문제와 섞이지 않게 했다)
  it("날짜가 바뀌면 새 날짜의 딜을 돌려준다", async () => {
    const deals = await loadDealsAt("2026-11-10T12:00:00+09:00");

    jest.setSystemTime(new Date("2026-11-11T12:00:00+09:00"));
    const { items } = deals.getDealsByTab("open");

    expect(items.length).toBeGreaterThan(0);
    for (const deal of items) {
      expect(new Date(deal.openTime).getTime()).toBeGreaterThanOrEqual(
        new Date("2026-11-11T00:00:00+09:00").getTime(),
      );
    }
  });

  // 예전 버그: `todayAt`이 서버의 현지 시간대로 시각을 만들어, Vercel(UTC)에서 "09:00 오픈"이 한국 18:00이 됐다.
  it(
    "서버가 UTC여도 오픈·마감 시간은 한국 시간 기준이다",
    async () => {
      const deals = await loadDealsAt("2026-11-10T12:00:00+09:00");

      const deal = deals.getDealById(1);

      // 1번 딜: 09:00 오픈, 22:30 마감 (한국 시간)
      expect(deal?.openTime).toBe(
        new Date("2026-11-10T09:00:00+09:00").toISOString(),
      );
      expect(deal?.endTime).toBe(
        new Date("2026-11-10T22:30:00+09:00").toISOString(),
      );
    },
  );

  it("한국 시간 새벽(UTC로는 전날)에도 한국 날짜 기준으로 오늘 딜을 돌려준다", async () => {
    // 한국 11-11 08:00 = UTC 11-10 23:00
    const deals = await loadDealsAt("2026-11-11T08:00:00+09:00");

    const { items } = deals.getDealsByTab("open");

    expect(items.length).toBeGreaterThan(0);
    for (const deal of items) {
      expect(deal.openTime.startsWith("2026-11-11")).toBe(true);
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
    expect(deals.every((deal) => deal.category === "food")).toBe(true);
  });

  it('"all"이나 모르는 카테고리면 거르지 않는다', () => {
    expect(getAllDeals("all")).toHaveLength(12);
    expect(getAllDeals("zzz")).toHaveLength(12);
  });
});

describe("getDealsByTab", () => {
  it("카테고리를 함께 주면 그 카테고리 딜만 돌려주고, total도 걸러진 개수다", () => {
    const result = getDealsByTab("open", 1, "tech");

    expect(result.items).toHaveLength(4);
    expect(result.items.every((deal) => deal.category === "tech")).toBe(true);
    expect(result.total).toBe(4);
    expect(result.totalPages).toBe(1);
  });

  it("now를 넘기면 그 한국 날짜에 열리는 딜로 거른다", () => {
    const dayStart = new Date("2026-11-10T00:00:00+09:00").getTime();
    const { items } = getDealsByTab("open", 1, null, 12, new Date("2026-11-10T12:00:00+09:00"));

    expect(items.length).toBeGreaterThan(0);
    for (const deal of items) {
      const open = new Date(deal.openTime).getTime();
      expect(open).toBeGreaterThanOrEqual(dayStart);
      expect(open).toBeLessThan(dayStart + 24 * 60 * 60 * 1000);
    }
  });

  it('"end" 탭이면 오늘 마감되는 딜을 돌려준다', () => {
    // 지금 목 데이터는 오픈·마감이 모두 같은 날이라 "open" 탭과 결과가 같다.
    // 두 탭의 차이는 데이터를 밖에서 넣을 수 있게 바꾼 뒤 검증한다.
    const result = getDealsByTab("end");

    expect(result.total).toBe(12);
  });

  describe("페이지 나누기", () => {
    it("한 페이지 개수만큼만 돌려주고 전체 페이지 수를 계산한다", () => {
      const result = getDealsByTab("open", 1, null, 5);

      expect(result.items).toHaveLength(5);
      expect(result.total).toBe(12);
      expect(result.totalPages).toBe(3);
    });

    it("마지막 페이지에는 남은 개수만 돌려준다", () => {
      const result = getDealsByTab("open", 3, null, 5);

      expect(result.items).toHaveLength(2);
      expect(result.items.map((deal) => deal.id)).toEqual([11, 12]);
    });

    it("범위를 넘는 페이지면 빈 목록을 돌려주고, total은 그대로다", () => {
      const result = getDealsByTab("open", 4, null, 5);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(12);
      expect(result.page).toBe(4);
    });

    it("페이지끼리 같은 딜이 겹치지 않는다", () => {
      const ids = [1, 2, 3].flatMap((page) =>
        getDealsByTab("open", page, null, 5).items.map((deal) => deal.id),
      );

      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});

describe("getDealById", () => {
  it("있는 id면 기본 정보와 상세 정보를 합쳐서 돌려준다", () => {
    const deal = getDealById(1);

    expect(deal).toEqual(
      expect.objectContaining({
        id: 1,
        title: "에어 조던 1 레트로 하이 OG 스니커즈",
        salePrice: 99000,
        returnPolicy: "구매일로부터 30일 이내 무료 반품",
      }),
    );
    expect(deal?.images.length).toBeGreaterThan(0);
  });

  it("없는 id면 null을 돌려준다", () => {
    expect(getDealById(999)).toBeNull();
  });

  it("NaN이면 null을 돌려준다", () => {
    // 상세 API가 /api/deals/abc 요청을 Number("abc")로 바꿔 넘기는 경우
    expect(getDealById(Number("abc"))).toBeNull();
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

describe("kstDayStart", () => {
  it("UTC 15:30이면 한국 다음 날 0시를 돌려준다", () => {
    expect(kstDayStart(new Date("2026-11-23T15:30:00Z"))).toBe(
      new Date("2026-11-24T00:00:00+09:00").getTime(),
    );
  });
});

describe("getAllDeals에 now를 넘길 때", () => {
  it("now를 넘기면 그 한국 날짜의 딜을 돌려준다", () => {
    const dayStart = new Date("2026-11-10T00:00:00+09:00").getTime();
    const deals = getAllDeals(undefined, new Date("2026-11-10T12:00:00+09:00"));

    for (const deal of deals) {
      const open = new Date(deal.openTime).getTime();
      expect(open).toBeGreaterThanOrEqual(dayStart);
      expect(open).toBeLessThan(dayStart + 24 * 60 * 60 * 1000);
    }
  });

  it("getBestDeals를 불러도 getAllDeals는 id 순서를 유지한다 (/api/deals 응답 순서)", () => {
    getBestDeals();

    expect(getAllDeals().map((deal) => deal.id)).toEqual(
      Array.from({ length: 12 }, (_, i) => i + 1),
    );
  });
});

describe("getBestDeals", () => {
  it("리뷰 수가 많은 순이고, 같으면 id 순이다", () => {
    const deals = getBestDeals();

    for (let i = 1; i < deals.length; i++) {
      const [prev, curr] = [deals[i - 1], deals[i]];
      expect(prev.reviewCount).toBeGreaterThanOrEqual(curr.reviewCount);
      if (prev.reviewCount === curr.reviewCount) {
        expect(prev.id).toBeLessThan(curr.id);
      }
    }
  });

  it("모든 딜이 끝난 시각(23:59:30)에도 끝난 딜을 포함해 12개를 돌려준다", () => {
    expect(
      getBestDeals(undefined, new Date("2026-11-23T23:59:30+09:00")),
    ).toHaveLength(12);
  });

  it("카테고리를 넘기면 그 카테고리만 돌려준다", () => {
    const deals = getBestDeals("food");

    expect(deals.length).toBe(getAllDeals("food").length);
    expect(deals.every((deal) => deal.category === "food")).toBe(true);
  });
});
