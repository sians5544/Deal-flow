import { Deal } from "@/types";
import DealCard from "./DealCard";

const DealCardGrid = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/deals`,
    {
      cache: "force-cache", // 항상 최신 데이터를 가져오기 위해 캐시 사용 안 함
    },
  );

  const deals: Deal[] = await response.json();

  return (
    <div className="grid grid-cols-4 gap-6">
      {deals.map((deal) => (
        <DealCard key={deal.id} deal={deal} />
      ))}
    </div>
  );
};

export default DealCardGrid;
