import { Deal } from "@/types";
import DealCard from "./DealCard";
import { getAllDeals } from "@/lib/deals";

const DealCardGrid = async () => {
  // 서버 컴포넌트에서는 API 라우트를 HTTP로 부르지 않고 데이터 함수를 직접 호출합니다.
  const deals: Deal[] = getAllDeals();

  return (
    <div className="grid grid-cols-4 gap-6">
      {deals.map((deal) => (
        <DealCard key={deal.id} deal={deal} />
      ))}
    </div>
  );
};

export default DealCardGrid;
