import { getCategoryLabel, isCategoryId } from "@/lib/categories";

describe("getCategoryLabel", () => {
  it('"food"면 화면 이름 "식품"을 돌려준다', () => {
    expect(getCategoryLabel("food")).toBe("식품");
  });

  it("코드와 화면 이름이 다른 카테고리도 화면 이름을 돌려준다", () => {
    expect(getCategoryLabel("beauty")).toBe("뷰티/건강");
  });
});

describe("isCategoryId", () => {
  it("실제 카테고리 코드면 true를 돌려준다", () => {
    expect(isCategoryId("food")).toBe(true);
  });

  it('"all"이면 거르지 않도록 false를 돌려준다', () => {
    expect(isCategoryId("all")).toBe(false);
  });

  it("값이 없으면 false를 돌려준다", () => {
    expect(isCategoryId(undefined)).toBe(false);
    expect(isCategoryId(null)).toBe(false);
  });

  it("모르는 값이면 false를 돌려준다", () => {
    expect(isCategoryId("zzz")).toBe(false);
  });
});
