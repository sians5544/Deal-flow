import { bannerHref } from "@/lib/banners";
import { makeBanner } from "@/test-utils/factories";

describe("bannerHref", () => {
  it("배너를 누르면 그 카테고리로 걸러진 /best 주소를 돌려준다", () => {
    expect(bannerHref(makeBanner({ category: "food" }))).toBe(
      "/best?category=food",
    );
  });
});
