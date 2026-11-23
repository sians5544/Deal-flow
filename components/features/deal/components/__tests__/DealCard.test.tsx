import { render, screen } from "@testing-library/react";
import DealCard from "../DealCard";
import { makeDeal } from "@/test-utils/factories";

// makeDeal의 기본 마감(13:00Z)보다 이른 시각. 마감 문구는 이 파일의 관심사가 아니라 고정값만 넘깁니다.
const now = new Date("2026-11-10T03:00:00.000Z");

describe("DealCard", () => {
  it("누르면 해당 상품 상세로 이동하는 링크다", () => {
    render(<DealCard deal={makeDeal({ id: 7 })} now={now} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/deals/7");
  });

  it("가격을 천 단위 쉼표와 함께 보여준다", () => {
    render(
      <DealCard deal={makeDeal({ originalPrice: 299000, salePrice: 99000 })} now={now} />,
    );

    expect(screen.getByText("299,000원")).toBeInTheDocument();
    expect(screen.getByText("99,000원")).toBeInTheDocument();
  });

  it("카테고리는 코드가 아니라 화면 이름으로 보여준다", () => {
    render(<DealCard deal={makeDeal({ category: "beauty", brand: "설화수" })} now={now} />);

    expect(screen.getByText("뷰티/건강 · 설화수")).toBeInTheDocument();
    expect(screen.queryByText(/beauty/)).not.toBeInTheDocument();
  });

  it("무료배송이 아니면 '배송비 포함'을 보여준다", () => {
    render(<DealCard deal={makeDeal({ freeShipping: false })} now={now} />);

    expect(screen.getByText("배송비 포함")).toBeInTheDocument();
  });
});
