import { DealCardGrid, DealCardGridSkeleton } from "@/components/features";

import { PageTitle } from "@/components/layout";
import { Suspense } from "react";

const BestDealsPage = async () => {
  return (
    <div>
      <PageTitle
        title="Best Deals"
        description="지금 가장 인기있는 특가 상품을 만나보세요."
      />

      <Suspense fallback={<DealCardGridSkeleton />}>
        <DealCardGrid />
      </Suspense>
    </div>
  );
};

export default BestDealsPage;
