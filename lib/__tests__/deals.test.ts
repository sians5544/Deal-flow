import { getDealById } from "@/lib/deals";

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
    for (let id = 1; id <= 12; id++) {
      expect(getDealById(id)).not.toBeNull();
    }
  });
});
