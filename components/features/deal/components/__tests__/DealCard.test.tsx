import { render, screen } from "@testing-library/react";
import DealCard from "../DealCard";
import { makeDeal } from "@/test-utils/factories";

describe("DealCard", () => {
  it("누르면 해당 상품 상세로 이동하는 링크다", () => {
    render(<DealCard deal={makeDeal({ id: 7 })} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/deals/7");
  });

  it("가격을 천 단위 쉼표와 함께 보여준다", () => {
    render(
      <DealCard deal={makeDeal({ originalPrice: 299000, salePrice: 99000 })} />,
    );

    expect(screen.getByText("299,000원")).toBeInTheDocument();
    expect(screen.getByText("99,000원")).toBeInTheDocument();
  });

  it("카테고리는 코드가 아니라 화면 이름으로 보여준다", () => {
    render(<DealCard deal={makeDeal({ category: "beauty", brand: "설화수" })} />);

    expect(screen.getByText("뷰티/건강 · 설화수")).toBeInTheDocument();
    expect(screen.queryByText(/beauty/)).not.toBeInTheDocument();
  });

  it("무료배송이 아니면 '배송비 포함'을 보여준다", () => {
    render(<DealCard deal={makeDeal({ freeShipping: false })} />);

    expect(screen.getByText("배송비 포함")).toBeInTheDocument();
  });
});
