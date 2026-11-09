import { Deal } from "@/types";
import DealCard from "./DealCard";
import { getAllDeals } from "@/lib/deals";

const DealCardGrid = async ({ category }: { category?: string | null }) => {
  // 서버 컴포넌트에서는 API 라우트를 HTTP로 부르지 않고 데이터 함수를 직접 호출합니다.
  const deals: Deal[] = getAllDeals(category);

  if (deals.length === 0) {
    return (
      <p className="py-24 text-center text-sm text-muted-foreground">
        이 카테고리에는 지금 진행 중인 딜이 없어요.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-6">
      {deals.map((deal) => (
        <DealCard key={deal.id} deal={deal} />
      ))}
    </div>
  );
};

export default DealCardGrid;
