import Image from "next/image";
import Link from "next/link";
import { Deal } from "@/types/deal";

// 베스트 한 장 (최대 5개). 데스크톱은 카드 5칸 한 줄, 모바일은 왼쪽에 순위가 있는 목록 5줄.
// Design Ref: §3.3 — 순위 번호는 장을 넘어 이어집니다 (2장 첫 카드 = 6위). 그래서 startRank를 받습니다.
// Plan SC: FR-04 순위 · 썸네일 · 상품명 · 가격 · 리뷰 수
const BestPage = ({
  deals,
  startRank,
}: {
  deals: Deal[];
  startRank: number;
}) => (
  <ol className="grid gap-3 md:grid-cols-5">
    {deals.map((deal, i) => {
      const rank = startRank + i;
      return (
        <li key={deal.id}>
          <Link
            href={`/deals/${deal.id}`}
            className="flex items-center gap-3 md:block"
          >
            <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-[#F3F4F6] md:aspect-square md:size-auto md:w-full">
              <Image
                src={deal.thumbnail}
                alt=""
                fill
                sizes="(min-width: 768px) 20vw, 64px"
                className="object-cover"
              />
              <span className="absolute left-0 top-0 flex size-7 items-center justify-center rounded-br-lg bg-[#111827] text-sm font-extrabold text-white">
                <span className="sr-only">순위 </span>
                {rank}
              </span>
            </div>
            <div className="min-w-0 md:mt-2">
              <p className="line-clamp-1 text-sm text-[#111827]">{deal.title}</p>
              <p className="text-sm font-bold">
                {deal.discountRate > 0 && (
                  <span className="text-red-600">{deal.discountRate}% </span>
                )}
                {deal.salePrice.toLocaleString()}원
              </p>
              <p className="text-xs text-[#9CA3AF]">
                리뷰 {deal.reviewCount.toLocaleString()}
              </p>
            </div>
          </Link>
        </li>
      );
    })}
  </ol>
);

export default BestPage;
