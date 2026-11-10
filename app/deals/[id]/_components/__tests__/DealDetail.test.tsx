import { render, screen } from "@testing-library/react";
import { SWRConfig } from "swr";
import DealDetail from "../DealDetail";
import { makeDealDetail } from "@/test-utils/factories";

// 이미지 캐러셀은 브라우저 API(ResizeObserver 등)가 필요해 이 테스트의 관심사가 아니므로 대체합니다.
jest.mock("../DealImages", () => ({
  __esModule: true,
  default: () => <div data-testid="deal-images" />,
}));

// 백엔드 대신 fetch가 돌려줄 응답을 정합니다.
// jsdom 환경에는 fetch가 없어서 spyOn 대신 가짜 함수를 직접 넣습니다.
const mockFetch = (status: number, body: unknown) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response);
};

// 테스트끼리 SWR 캐시가 섞이지 않게 매번 새 캐시를 씁니다.
const renderDetail = (dealId: string) =>
  render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <DealDetail dealId={dealId} />
    </SWRConfig>,
  );

describe("DealDetail", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("응답을 받으면 상품 정보를 보여준다", async () => {
    mockFetch(200, makeDealDetail({ title: "목 데이터 상품" }));

    renderDetail("1");

    expect(await screen.findByText("목 데이터 상품")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith("/api/deals/1");
  });

  it("404면 오류 화면 대신 '상품을 찾을 수 없어요' 안내를 보여준다", async () => {
    mockFetch(404, { message: "상품을 찾을 수 없습니다." });

    renderDetail("999");

    expect(
      await screen.findByText("상품을 찾을 수 없어요."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "베스트 딜 보러 가기" }),
    ).toHaveAttribute("href", "/best");
  });

  it("서버 오류면 다시 시도 안내를 보여준다", async () => {
    mockFetch(500, {});

    renderDetail("1");

    expect(
      await screen.findByText("상품 정보를 불러오지 못했어요."),
    ).toBeInTheDocument();
  });
});
