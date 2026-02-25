import { Deal } from "@/types";
import { DealCard } from "@/components/features";
import { GET } from "@/app/api/deals/route";

const DealCardGrid = async () => {
  const response = await GET();

  const deals: Deal[] = await response.json();

  return (
    <div className="grid grid-cols-2 gap-4">
      {deals.map((deal) => (
        <DealCard key={deal.id} deal={deal} />
      ))}
    </div>
  );
};

export default DealCardGrid;
