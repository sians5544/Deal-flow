import Image from "next/image";
import { Deal } from "@/types/deal";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import DealTimer from "./DealTimer";
import Link from "next/link";

const DealCard = ({ deal }: { deal: Deal }) => {
  return (
    <Link href={`/deals/${deal.id}`} className="block">
      <Card className="relative mx-auto w-full max-w-sm pt-0 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="absolute inset-0 z-30 aspect-video " />
        <div className="relative z-20 aspect-video w-full rounded-lg bg-white">
          <Image
            src={deal.thumbnail}
            alt={`${deal.title} thumbnail`}
            fill
            className="object-cover brightness-60 grayscale dark:brightness-40 rounded-lg"
          />

          <DealTimer
            className="absolute bottom-2 right-2"
            endTime={deal.endTime}
            discountRate={deal.discountRate}
          />
        </div>
        <CardHeader className="flex-col">
          <span className="text-xs text-muted-foreground">
            {deal.category} · {deal.brand}
          </span>
          <CardTitle className="line-clamp-2 min-h-[3rem]">
            {deal.title}
          </CardTitle>
          <div className="flex-col">
            <div className="text-sm line-through text-muted-foreground">
              {deal.originalPrice.toLocaleString()}원
            </div>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-red-600">
                {deal.discountRate}%
              </span>
              <span className="text-lg font-bold">
                {deal.salePrice.toLocaleString()}원
              </span>
            </div>
          </div>
        </CardHeader>
        <CardHeader className="pt-0">
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
