import { Deal } from "@/types";
import DealCard from "./DealCard";
import { getBestDeals } from "@/lib/deals";

const DealCardGrid = async ({ category }: { category?: string | null }) => {
  // 서버 컴포넌트에서는 API 라우트를 HTTP로 부르지 않고 데이터 함수를 직접 호출합니다.
  // /best는 리뷰 수가 많은 순입니다 (홈 베스트와 같은 기준).
  // 시각은 여기서 한 번만 정해 목록과 카드의 마감 문구가 같은 "지금"을 보게 합니다.
  const now = new Date();
  const deals: Deal[] = getBestDeals(category, now);

  if (deals.length === 0) {
    return (
      <p className="py-24 text-center text-sm text-muted-foreground">
        이 카테고리에는 지금 진행 중인 딜이 없어요.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
      {deals.map((deal) => (
        <DealCard key={deal.id} deal={deal} now={now} />
      ))}
    </div>
  );
};

export default DealCardGrid;
