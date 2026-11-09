"use client";

import Link from "next/link";
import useSWR from "swr";
import { DealDetail as DealDetailType } from "@/types/deal";
import DealImages from "./DealImages";
import DetailInfos from "./DealInfos";

class FetchError extends Error {
  constructor(public status: number) {
    super(`Request failed with status ${status}`);
  }
}

// 404처럼 실패한 응답을 데이터로 착각하지 않도록, 상태 코드를 확인한 뒤에만 JSON을 꺼냅니다.
const fetcher = async (url: string): Promise<DealDetailType> => {
  const res = await fetch(url);
  if (!res.ok) throw new FetchError(res.status);
  return res.json();
};

const DealDetail = ({ dealId }: { dealId: string }) => {
  const { data, error } = useSWR(`/api/deals/${dealId}`, fetcher);

  if (error) {
    const notFound = error instanceof FetchError && error.status === 404;
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-lg font-semibold text-[#111827]">
          {notFound
            ? "상품을 찾을 수 없어요."
            : "상품 정보를 불러오지 못했어요."}
        </p>
        <p className="text-sm text-muted-foreground">
          {notFound
            ? "판매가 끝났거나 주소가 잘못됐어요."
            : "잠시 후 다시 시도해 주세요."}
        </p>
        <Link
          href="/best"
          className="rounded-lg bg-[#111827] px-5 py-2 text-sm font-semibold text-white"
        >
          베스트 딜 보러 가기
        </Link>
      </div>
    );
  }
  if (!data) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <DealImages thumbnail={data.thumbnail} images={data.images} />
      <DetailInfos {...data} />
    </div>
  );
};

export default DealDetail;
