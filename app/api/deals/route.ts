// app/api/deals/route.ts

import { NextRequest } from "next/server";
import { Deal } from "@/types/deal";

const today = new Date();
const todayAt = (hour: number, minute = 0) =>
  new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minute).toISOString();

const deals: Deal[] = [
  {
    id: 1,
    thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    title: "에어 조던 1 레트로 하이 OG 스니커즈",
    category: "패션",
    brand: "나이키",
    originalPrice: 299000,
    salePrice: 99000,
    discountRate: 67,
    openTime: todayAt(9, 0),
    endTime: todayAt(22, 30),
    badge: "BEST" as const,
    rating: 4.8,
    reviewCount: 1234,
    freeShipping: true,
  },
  {
    id: 2,
    thumbnail: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
    title: "갤럭시 버즈2 프로 무선 이어폰",
    category: "가전",
    brand: "삼성",
    originalPrice: 289000,
    salePrice: 139000,
    discountRate: 52,
    openTime: todayAt(10, 30),
    endTime: todayAt(20, 0),
    badge: "HOT" as const,
    rating: 4.6,
    reviewCount: 892,
    freeShipping: true,
  },
  {
    id: 3,
    thumbnail: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400",
    title: "어드밴스드 나이트 리페어 세럼 50ml + 기획세트",
    category: "뷰티",
    brand: "에스티로더",
    originalPrice: 180000,
    salePrice: 99000,
    discountRate: 45,
    openTime: todayAt(11, 0),
    endTime: todayAt(23, 59),
    badge: null,
    rating: 4.9,
    reviewCount: 2341,
    freeShipping: true,
  },
  {
    id: 4,
    thumbnail: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400",
    title: "V15 디텍트 앱솔루트 무선청소기",
    category: "생활",
    brand: "다이슨",
    originalPrice: 1290000,
    salePrice: 799000,
    discountRate: 38,
    openTime: todayAt(12, 0),
    endTime: todayAt(21, 0),
    badge: "NEW" as const,
    rating: 4.7,
    reviewCount: 567,
    freeShipping: true,
  },
  {
    id: 5,
    thumbnail: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400",
    title: "비비고 왕교자 만두 1kg x 5봉",
    category: "식품",
    brand: "CJ",
    originalPrice: 49500,
    salePrice: 13900,
    discountRate: 72,
    openTime: todayAt(13, 0),
    endTime: todayAt(18, 0),
    badge: null,
    rating: 4.8,
    reviewCount: 3421,
    freeShipping: false,
  },
  {
    id: 6,
    thumbnail: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400",
    title: "그램 17인치 노트북 13세대 i7 / 16GB / 512GB",
    category: "가전",
    brand: "LG",
    originalPrice: 2690000,
    salePrice: 1199000,
    discountRate: 55,
    openTime: todayAt(14, 0),
    endTime: todayAt(23, 0),
    badge: "BEST" as const,
    rating: 4.5,
    reviewCount: 234,
    freeShipping: true,
  },
  {
    id: 7,
    thumbnail: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400",
    title: "울트라부스트 22 러닝화",
    category: "패션",
    brand: "아디다스",
    originalPrice: 219000,
    salePrice: 129000,
    discountRate: 41,
    openTime: todayAt(15, 0),
    endTime: todayAt(22, 0),
    badge: null,
    rating: 4.7,
    reviewCount: 789,
    freeShipping: true,
  },
  {
    id: 8,
    thumbnail: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400",
    title: "워터뱅크 블루 히알루론산 기획세트",
    category: "뷰티",
    brand: "라네즈",
    originalPrice: 98000,
    salePrice: 39000,
    discountRate: 60,
    openTime: todayAt(16, 0),
    endTime: todayAt(21, 30),
    badge: "HOT" as const,
    rating: 4.9,
    reviewCount: 1892,
    freeShipping: true,
  },
  {
    id: 9,
    thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    title: "에어팟 프로 2세대 USB-C",
    category: "가전",
    brand: "애플",
    originalPrice: 359000,
    salePrice: 289000,
    discountRate: 19,
    openTime: todayAt(17, 0),
    endTime: todayAt(23, 30),
    badge: "NEW" as const,
    rating: 4.9,
    reviewCount: 4521,
    freeShipping: true,
  },
  {
    id: 10,
    thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    title: "메타 퀘스트 3 VR 헤드셋 128GB",
    category: "가전",
    brand: "메타",
    originalPrice: 729000,
    salePrice: 549000,
    discountRate: 25,
    openTime: todayAt(18, 0),
    endTime: todayAt(22, 0),
    badge: null,
    rating: 4.6,
    reviewCount: 328,
    freeShipping: true,
  },
  {
    id: 11,
    thumbnail: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400",
    title: "레이밴 웨이페어러 선글라스",
    category: "패션",
    brand: "레이밴",
    originalPrice: 189000,
    salePrice: 99000,
    discountRate: 48,
    openTime: todayAt(19, 0),
    endTime: todayAt(23, 0),
    badge: null,
    rating: 4.8,
    reviewCount: 612,
    freeShipping: true,
  },
  {
    id: 12,
    thumbnail: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400",
    title: "백설 요리유 대두유 1.8L x 4개",
    category: "식품",
    brand: "CJ",
    originalPrice: 42000,
    salePrice: 19900,
    discountRate: 53,
    openTime: todayAt(20, 0),
    endTime: todayAt(23, 59),
    badge: null,
    rating: 4.7,
    reviewCount: 2156,
    freeShipping: false,
  },
];

export const GET = (request: NextRequest) => {
  console.log("API 호출됨:", new Date().toISOString());

  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab");
  const page = Number(searchParams.get("page") ?? "1");
  const limit = 12;

  // tab 파라미터 없으면 기존처럼 전체 배열 반환 (best 페이지용)
  if (!tab) {
    return Response.json(deals);
  }

  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const filtered = deals.filter((deal) => {
    const target = tab === "open" ? new Date(deal.openTime) : new Date(deal.endTime);
    return target >= todayStart && target < todayEnd;
  });

  const totalPages = Math.ceil(filtered.length / limit);
  const items = filtered.slice((page - 1) * limit, page * limit);

  return Response.json({ items, total: filtered.length, page, totalPages });
};
