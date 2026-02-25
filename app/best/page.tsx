import { DealCardGrid, DealCardGridSkeleton } from "@/components/features";
import { Suspense } from "react";

const BestDealsPage = async () => {
  return (
    <div>
      <h1>Best Deals</h1>

      <Suspense fallback={<DealCardGridSkeleton />}>
        <DealCardGrid />
      </Suspense>
    </div>
  );
};

export default BestDealsPage;
