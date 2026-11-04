// app/api/deals/route.ts

import { NextRequest } from "next/server";
import { getAllDeals, getDealsByTab } from "@/lib/deals";

export const GET = (request: NextRequest) => {
  console.log("API 호출됨:", new Date().toISOString());

  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab");
  const page = Number(searchParams.get("page") ?? "1");

  // tab 파라미터 없으면 기존처럼 전체 배열 반환 (best 페이지용)
  if (!tab) {
    return Response.json(getAllDeals());
  }

  return Response.json(getDealsByTab(tab, page));
};
