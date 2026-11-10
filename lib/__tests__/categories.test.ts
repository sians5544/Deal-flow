import { getCategoryValue } from "@/lib/categories";

describe("getCategoryValue", () => {
  it('"food"면 "식품"을 돌려준다', () => {
    expect(getCategoryValue("food")).toBe("식품");
  });

  it('"all"이면 거르지 않도록 null을 돌려준다', () => {
    expect(getCategoryValue("all")).toBeNull();
  });

  it("id가 없으면 null을 돌려준다", () => {
    expect(getCategoryValue(undefined)).toBeNull();
    expect(getCategoryValue(null)).toBeNull();
  });

  it("모르는 id면 null을 돌려준다", () => {
    expect(getCategoryValue("zzz")).toBeNull();
  });
});
