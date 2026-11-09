import Link from "next/link";
import { PageTitle } from "@/components/layout";
import DealCard from "@/components/features/deal/components/DealCard";
import { Deal } from "@/types";
import { getDealsByTab } from "@/lib/deals";

export const revalidate = 30;

type Props = {
  searchParams: Promise<{ tab?: string; page?: string; category?: string }>;
};

const TodayPage = async ({ searchParams }: Props) => {
  const { tab: tabParam, page: pageParam, category } = await searchParams;
  const tab = tabParam ?? "open";
  const page = Number(pageParam ?? "1");

  // 서버 컴포넌트에서는 API 라우트를 HTTP로 부르지 않고 데이터 함수를 직접 호출합니다.
  const { items, totalPages } = getDealsByTab(tab, page, category);

  // 탭·페이지를 옮겨도 선택한 카테고리가 유지되도록 링크를 만듭니다.
  const hrefFor = (nextTab: string, nextPage: number) => {
    const params = new URLSearchParams({
      tab: nextTab,
      page: String(nextPage),
    });
    if (category) params.set("category", category);
    return `/today?${params.toString()}`;
  };

  return (
    <>
      <PageTitle
        title="오늘의 딜"
        description="오늘 오픈하거나 오늘 마감되는 특가 상품을 만나보세요."
      />

      {/* 탭 */}
      <div className="flex gap-2 mb-6">
        <Link
          href={hrefFor("open", 1)}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tab === "open"
              ? "bg-[#111827] text-white"
              : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
          }`}
        >
          오늘 오픈
        </Link>
        <Link
          href={hrefFor("closing", 1)}
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
      {items.length === 0 ? (
        <p className="py-24 text-center text-sm text-muted-foreground">
          조건에 맞는 딜이 없어요.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {items.map((deal: Deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      <div className="flex justify-center items-center gap-2 mt-10">
        <Link
          href={hrefFor(tab, page - 1)}
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
            href={hrefFor(tab, p)}
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
          href={hrefFor(tab, page + 1)}
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
