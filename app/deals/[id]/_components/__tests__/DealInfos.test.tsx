import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DetailInfos from "../DealInfos";
import { makeDealDetail } from "@/test-utils/factories";

const renderInfos = (overrides = {}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { images, ...props } = makeDealDetail(overrides);
  return render(<DetailInfos {...props} />);
};

describe("DealInfos", () => {
  it("수량을 올리면 총 상품금액이 판매가 × 수량으로 바뀐다", async () => {
    const user = userEvent.setup();
    renderInfos({ salePrice: 70000 });

    await user.click(screen.getByRole("button", { name: "+" }));

    expect(screen.getByText("₩140,000")).toBeInTheDocument();
  });

  it("수량은 1보다 작아지지 않는다", async () => {
    const user = userEvent.setup();
    renderInfos({ salePrice: 70000 });

    await user.click(screen.getByRole("button", { name: "−" }));

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getAllByText("₩70,000").length).toBeGreaterThan(0);
  });

  it("정상가와 판매가의 차이를 절약 금액으로 보여준다", () => {
    renderInfos({ originalPrice: 100000, salePrice: 70000 });

    expect(screen.getByText("30,000원 절약")).toBeInTheDocument();
  });

  it("옵션이 없는 상품(식품)은 색상·사이즈 영역을 숨긴다", () => {
    renderInfos({ colors: [], sizes: [] });

    expect(screen.queryByText("색상")).not.toBeInTheDocument();
    expect(screen.queryByText("사이즈")).not.toBeInTheDocument();
  });

  it("품절 사이즈는 누를 수 없다", () => {
    renderInfos({ sizes: [{ label: "280", soldOut: true }] });

    expect(screen.getByRole("button", { name: "280" })).toBeDisabled();
  });

  // 예전 버그: discountRate && ... 라서 0%일 때 React가 숫자 0을 그대로 화면에 그렸다.
  it("할인율이 0이면 할인 배지도 '0'도 보이지 않는다", () => {
    const { container } = renderInfos({ discountRate: 0 });

    expect(container.textContent).not.toMatch(/할인가0/);
  });
});
