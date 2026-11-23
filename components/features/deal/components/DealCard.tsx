import Image from "next/image";
import Link from "next/link";
import { Deal } from "@/types/deal";
import { getCategoryLabel } from "@/lib/categories";
import { formatEndLabel } from "@/lib/dealTime";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

// Design Ref: §3.4, §5.4 — 초 단위 카운트다운 대신 "오늘 HH:MM 마감".
// 시각만 보여주므로 1초마다 도는 클라이언트 타이머가 필요 없고, 카드가 서버 컴포넌트로 남습니다.
// now는 페이지가 한 번 정해 내려줍니다 (컴포넌트 안에서 new Date()를 부르지 않음, §1.2).
// Plan SC: FR-06 마감 표시 통일, FR-09 흑백 처리 제거
const DealCard = ({ deal, now }: { deal: Deal; now: Date }) => {
  const endLabel = formatEndLabel(deal.endTime, now);
  const hasDiscount = deal.discountRate > 0;

  return (
    <Link href={`/deals/${deal.id}`} className="block">
      <Card className="relative mx-auto w-full max-w-sm pt-0 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="relative aspect-video w-full rounded-lg bg-[#F3F4F6]">
          <Image
            src={deal.thumbnail}
            alt={`${deal.title} thumbnail`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover rounded-lg"
          />
        </div>
        <CardHeader className="flex-col px-3 sm:px-6">
          <span className="text-xs text-muted-foreground">
            {getCategoryLabel(deal.category)} · {deal.brand}
          </span>
          <CardTitle className="line-clamp-2 min-h-[3rem]">
            {deal.title}
          </CardTitle>
          <div className="flex-col">
            {/* 할인이 없으면 "0%"와 같은 값의 취소선 가격을 그리지 않습니다 (상세 DealInfos와 같은 기준).
                취소선 줄은 빈 칸으로 남겨 카드 높이를 다른 카드와 맞춥니다. */}
            <div className="min-h-5 text-sm line-through text-muted-foreground">
              {hasDiscount && `${deal.originalPrice.toLocaleString()}원`}
            </div>
            <div className="flex items-center gap-1">
              {hasDiscount && (
                <span className="text-base font-bold text-red-600 sm:text-lg">
                  {deal.discountRate}%
                </span>
              )}
              <span className="whitespace-nowrap text-base font-bold sm:text-lg">
                {deal.salePrice.toLocaleString()}원
              </span>
            </div>
          </div>
          <span
            className={
              endLabel.urgent
                ? "text-xs font-bold text-red-600"
                : "text-xs text-[#6B7280]"
            }
          >
            {endLabel.text}
          </span>
        </CardHeader>
        <CardHeader className="px-3 pt-0 sm:px-6">
          <span className="text-sm text-muted-foreground">
            {`⭐️ ${deal.rating} (${deal.reviewCount.toLocaleString()})`}
          </span>
          <span className="text-sm font-medium text-green-600">
            {deal.freeShipping ? "무료배송" : "배송비 포함"}
          </span>
        </CardHeader>
      </Card>
    </Link>
  );
};

export default DealCard;
