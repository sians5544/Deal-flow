import { DealDetail } from "@/types/deal";

const mockDeals: DealDetail[] = [
  {
    id: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800",
      "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800",
      "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800",
    ],
    title: "에어 조던 1 레트로 하이 OG 스니커즈",
    category: "패션",
    brand: "나이키",
    originalPrice: 299000,
    salePrice: 99000,
    discountRate: 67,
    endTime: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(),
    badge: "BEST",
    rating: 4.8,
    reviewCount: 1234,
    qnaCount: 45,
    wishCount: 8291,
    freeShipping: true,
    breadcrumb: ["홈", "패션", "신발", "스니커즈"],
    colors: [
      { name: "블랙/화이트", hex: "#111827" },
      { name: "화이트", hex: "#FFFFFF" },
      { name: "블루", hex: "#3B82F6" },
      { name: "옐로우", hex: "#D97706" },
    ],
    sizes: [
      { label: "260", soldOut: false },
      { label: "265", soldOut: false },
      { label: "270", soldOut: false },
      { label: "275", soldOut: false },
      { label: "280", soldOut: true },
    ],
    returnPolicy: "구매일로부터 30일 이내 무료 반품",
    description: "에어 조던 1 레트로 하이 OG 상품 상세 정보입니다.",
  },
  {
    id: 2,
    thumbnail:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800",
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
      "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=800",
    ],
    title: "갤럭시 버즈2 프로 무선 이어폰",
    category: "가전",
    brand: "삼성",
    originalPrice: 289000,
    salePrice: 139000,
    discountRate: 52,
    endTime: new Date(Date.now() + 3.25 * 60 * 60 * 1000).toISOString(),
    badge: "HOT",
    rating: 4.6,
    reviewCount: 892,
    qnaCount: 23,
    wishCount: 3412,
    freeShipping: true,
    breadcrumb: ["홈", "가전", "음향기기", "무선이어폰"],
    colors: [
      { name: "그라파이트", hex: "#374151" },
      { name: "화이트", hex: "#F9FAFB" },
      { name: "보라", hex: "#7C3AED" },
    ],
    sizes: [{ label: "기본", soldOut: false }],
    returnPolicy: "구매일로부터 30일 이내 무료 반품",
    description: "갤럭시 버즈2 프로 상품 상세 정보입니다.",
  },
];

export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const deal = mockDeals.find((d) => d.id === Number(id));

  if (!deal) {
    return Response.json({ message: "상품을 찾을 수 없습니다." }, { status: 404 });
  }

  return Response.json(deal);
};
