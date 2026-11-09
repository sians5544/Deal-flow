// app/api/deals/[id]/route.ts

import { getDealById } from "@/lib/deals";

export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  const deal = getDealById(Number(id));

  if (!deal) {
    return Response.json(
      { message: "상품을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return Response.json(deal);
};
