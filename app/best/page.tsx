import { DealCardGrid, DealCardGridSkeleton } from "@/components/features";

import { PageTitle } from "@/components/layout";
import { Suspense } from "react";

type Props = {
  searchParams: Promise<{ category?: string }>;
};

const BestDealsPage = async ({ searchParams }: Props) => {
  const { category } = await searchParams;

  return (
    <div>
      <PageTitle
        title="Best Deals"
        description="지금 가장 인기있는 특가 상품을 만나보세요."
      />

      {/* 카테고리가 바뀌면 key가 바뀌어 스켈레톤부터 다시 보여줍니다. */}
      <Suspense key={category ?? "all"} fallback={<DealCardGridSkeleton />}>
        <DealCardGrid category={category} />
      </Suspense>
    </div>
  );
};

export default BestDealsPage;
