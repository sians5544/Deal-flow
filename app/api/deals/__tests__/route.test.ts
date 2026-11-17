/**
 * @jest-environment node
 */
// API 라우트는 브라우저가 아니라 서버(Node)에서 돌기 때문에 node 환경으로 테스트합니다.
import { NextRequest } from "next/server";
import { GET as getDeals } from "../route";
import { GET as getDealDetail } from "../[id]/route";

const request = (path: string) => new NextRequest(`http://localhost${path}`);
const params = (id: string) => ({ params: Promise.resolve({ id }) });

describe("GET /api/deals", () => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("tab이 없으면 딜 배열을 돌려준다 (베스트 페이지용)", async () => {
    const body = await getDeals(request("/api/deals")).json();

    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(12);
  });

  it("category를 주면 그 카테고리만 돌려준다", async () => {
    const body = await getDeals(request("/api/deals?category=food")).json();

    expect(body).toHaveLength(2);
  });

  it("tab이 있으면 페이지 정보와 함께 돌려준다", async () => {
    const body = await getDeals(
      request("/api/deals?tab=open&page=1&category=tech"),
    ).json();

    expect(body).toEqual(
      expect.objectContaining({ page: 1, items: expect.any(Array) }),
    );
    expect(
      body.items.every(
        (deal: { category: string }) => deal.category === "tech",
      ),
    ).toBe(true);
  });
});

describe("GET /api/deals/[id]", () => {
  it("있는 id면 200과 상세 정보를 돌려준다", async () => {
    const res = await getDealDetail(request("/api/deals/5"), params("5"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.id).toBe(5);
    expect(body.images.length).toBeGreaterThan(0);
  });

  it("없는 id면 404를 돌려준다", async () => {
    const res = await getDealDetail(request("/api/deals/999"), params("999"));

    expect(res.status).toBe(404);
  });

  it("숫자가 아닌 id면 404를 돌려준다", async () => {
    const res = await getDealDetail(request("/api/deals/abc"), params("abc"));

    expect(res.status).toBe(404);
  });
});
