import Link from "next/link";
import { PageTitle } from "@/components/layout";
import DealCard from "@/components/features/deal/components/DealCard";
import { Deal } from "@/types";
import DealCardGridSkeleton from "@/components/features/deal/components/DealCardGridSkeleton";
import { Suspense } from "react";
import { getDealsByTab } from "@/lib/deals";

export const revalidate = 30;

type Props = {
  searchParams: Promise<{ tab?: string; page?: string }>;
};

const TodayPage = async ({ searchParams }: Props) => {
  const { tab: tabParam, page: pageParam } = await searchParams;
  const tab = tabParam ?? "open";
  const page = Number(pageParam ?? "1");

  // 서버 컴포넌트에서는 API 라우트를 HTTP로 부르지 않고 데이터 함수를 직접 호출합니다.
  const { items, totalPages } = getDealsByTab(tab, page);

  return (
    <>
      <PageTitle
        title="오늘의 딜"
        description="오늘 오픈하거나 오늘 마감되는 특가 상품을 만나보세요."
      />

      {/* 탭 */}
      <div className="flex gap-2 mb-6">
        <Link
          href="/today?tab=open&page=1"
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tab === "open"
              ? "bg-[#111827] text-white"
              : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
          }`}
        >
          오늘 오픈
        </Link>
        <Link
          href="/today?tab=closing&page=1"
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tab === "closing"
              ? "bg-[#111827] text-white"
              : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
          }`}
        >
          오늘 마감
        </Link>
      </div>

      {/* 카드 그리드 */}
      <Suspense fallback={<DealCardGridSkeleton />}>
        <div className="grid grid-cols-4 gap-6">
          {items?.map((deal: Deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </Suspense>

      {/* 페이지네이션 */}
      <div className="flex justify-center items-center gap-2 mt-10">
        <Link
          href={`/today?tab=${tab}&page=${page - 1}`}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            page <= 1
              ? "bg-[#F3F4F6] text-[#D1D5DB] pointer-events-none"
              : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
          }`}
        >
          ← 이전
        </Link>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Link
            key={p}
            href={`/today?tab=${tab}&page=${p}`}
            className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-semibold ${
              p === page
                ? "bg-[#111827] text-white"
                : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
            }`}
          >
            {p}
          </Link>
        ))}
        <Link
          href={`/today?tab=${tab}&page=${page + 1}`}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            page >= totalPages
              ? "bg-[#F3F4F6] text-[#D1D5DB] pointer-events-none"
              : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
          }`}
        >
          다음 →
        </Link>
      </div>
    </>
  );
};

export default TodayPage;
