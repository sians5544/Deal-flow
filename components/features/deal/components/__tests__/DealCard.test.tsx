import { render, screen } from "@testing-library/react";
import DealCard from "../DealCard";
import { makeDeal } from "@/test-utils/factories";

// makeDeal의 기본 마감(13:00Z)보다 이른 시각. 마감 문구가 관심사가 아닌 테스트는 이 값을 씁니다.
const now = new Date("2026-11-10T03:00:00.000Z");

describe("DealCard", () => {
  it("누르면 해당 상품 상세로 이동하는 링크다", () => {
    render(<DealCard deal={makeDeal({ id: 7 })} now={now} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/deals/7");
  });

  it("가격을 천 단위 쉼표와 함께 보여준다", () => {
    render(
      <DealCard
        deal={makeDeal({ originalPrice: 299000, salePrice: 99000 })}
        now={now}
      />,
    );

    expect(screen.getByText("299,000원")).toBeInTheDocument();
    expect(screen.getByText("99,000원")).toBeInTheDocument();
  });

  it("카테고리는 코드가 아니라 화면 이름으로 보여준다", () => {
    render(
      <DealCard
        deal={makeDeal({ category: "beauty", brand: "설화수" })}
        now={now}
      />,
    );

    expect(screen.getByText("뷰티/건강 · 설화수")).toBeInTheDocument();
    expect(screen.queryByText(/beauty/)).not.toBeInTheDocument();
  });

  it("무료배송이 아니면 '배송비 포함'을 보여준다", () => {
    render(<DealCard deal={makeDeal({ freeShipping: false })} now={now} />);

    expect(screen.getByText("배송비 포함")).toBeInTheDocument();
  });

  // 할인율 0을 숨기는 기준은 상세 화면(DealInfos)이 이미 정해 두었습니다 (11-17에 고친 버그).
  // 목록 카드는 그 조건 없이 항상 `${discountRate}%`를 그려 "0%"가 빨간 글씨로 나옵니다.
  // 고칠 방향: DealCard에서도 discountRate > 0일 때만 할인율(과 원래 가격 줄)을 보여준다.
  it.failing("할인율이 0이면 '0%'를 보여주지 않는다", () => {
    render(
      <DealCard
        deal={makeDeal({ discountRate: 0, originalPrice: 50000, salePrice: 50000 })}
        now={now}
      />,
    );

    expect(screen.queryByText("0%")).not.toBeInTheDocument();
  });

  // Design Ref: §8.4 7~9 — 카운트다운 대신 마감 시각 문구. 시각은 한국 시간(+09:00)으로 적습니다.
  describe("마감 문구", () => {
    const endTime = "2026-11-10T20:00:00+09:00";

    it("마감 30분 전이면 '곧 마감 · HH:MM'을 보여준다", () => {
      render(
        <DealCard
          deal={makeDeal({ endTime })}
          now={new Date("2026-11-10T19:30:00+09:00")}
        />,
      );

      expect(screen.getByText("곧 마감 · 20:00")).toBeInTheDocument();
    });

    it("마감 5시간 전이면 '오늘 HH:MM 마감'을 보여주고 카운트다운은 없다", () => {
      render(
        <DealCard
          deal={makeDeal({ endTime })}
          now={new Date("2026-11-10T15:00:00+09:00")}
        />,
      );

      expect(screen.getByText("오늘 20:00 마감")).toBeInTheDocument();
      expect(screen.queryByText(/\d{2}:\d{2}:\d{2}/)).not.toBeInTheDocument();
    });

    it("마감이 지났으면 '마감'을 보여준다", () => {
      render(
        <DealCard
          deal={makeDeal({ endTime })}
          now={new Date("2026-11-10T20:00:01+09:00")}
        />,
      );

      expect(screen.getByText("마감")).toBeInTheDocument();
    });

    it("마감 시각이 잘못된 값이면 '마감 시간 미정'을 보여준다", () => {
      render(<DealCard deal={makeDeal({ endTime: "abc" })} now={now} />);

      expect(screen.getByText("마감 시간 미정")).toBeInTheDocument();
    });
  });
});
