import Image from "next/image";
import Link from "next/link";
import { Deal } from "@/types/deal";
import { formatKstTime } from "@/lib/dealTime";

// 곧 오픈 한 장 (최대 5개). 데스크톱은 카드 5칸 한 줄, 모바일은 왼쪽에 오픈 시각이 있는 목록 5줄.
// Design Ref: §5.1, §5.2 — 서버에서 그려 PagedCarousel에 children으로 넘깁니다.
// Plan SC: FR-03 카드 위에 오픈 시각
const UpcomingPage = ({ deals }: { deals: Deal[] }) => (
  <ul className="grid gap-3 md:grid-cols-5">
    {deals.map((deal) => (
      <li key={deal.id}>
        <Link
          href={`/deals/${deal.id}`}
          className="flex items-center gap-3 md:block"
        >
          <p className="w-12 shrink-0 text-sm font-bold text-[#111827] md:mb-1.5 md:w-auto">
            <time dateTime={deal.openTime}>{formatKstTime(deal.openTime)}</time>
            <span className="sr-only"> 오픈</span>
          </p>
          <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-[#F3F4F6] md:aspect-square md:size-auto md:w-full">
            <Image
              src={deal.thumbnail}
              alt=""
              fill
              sizes="(min-width: 768px) 20vw, 64px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 md:mt-2">
            <p className="line-clamp-1 text-sm text-[#111827]">{deal.title}</p>
            <p className="text-sm font-bold">
              {deal.discountRate > 0 && (
                <span className="text-red-600">{deal.discountRate}% </span>
              )}
              {deal.salePrice.toLocaleString()}원
            </p>
          </div>
        </Link>
      </li>
    ))}
  </ul>
);

export default UpcomingPage;
