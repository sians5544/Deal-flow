// app/api/deals/route.ts

import { Deal } from "@/types/deal";
export const GET = () => {
  console.log("API 호출됨:", new Date().toISOString());

  const deals: Deal[] = [
    {
      id: 1,
      thumbnail:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
      title: "에어 조던 1 레트로 하이 OG 스니커즈",
      category: "패션",
      brand: "나이키",
      originalPrice: 299000,
      salePrice: 99000,
      discountRate: 67,
      endTime: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(), // 1.5시간 후
      badge: "BEST" as const,
      rating: 4.8,
      reviewCount: 1234,
      freeShipping: true,
    },
    {
      id: 2,
      thumbnail:
        "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
      title: "갤럭시 버즈2 프로 무선 이어폰",
      category: "가전",
      brand: "삼성",
      originalPrice: 289000,
      salePrice: 139000,
      discountRate: 52,
      endTime: new Date(Date.now() + 3.25 * 60 * 60 * 1000).toISOString(), // 3시간 15분 후
      badge: "HOT" as const,
      rating: 4.6,
      reviewCount: 892,
      freeShipping: true,
    },
    {
      id: 3,
      thumbnail:
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400",
      title: "어드밴스드 나이트 리페어 세럼 50ml + 기획세트",
      category: "뷰티",
      brand: "에스티로더",
      originalPrice: 180000,
      salePrice: 99000,
      discountRate: 45,
      endTime: new Date(Date.now() + 12.75 * 60 * 60 * 1000).toISOString(), // 12시간 45분 후
      badge: null,
      rating: 4.9,
      reviewCount: 2341,
      freeShipping: true,
    },
    {
      id: 4,
      thumbnail:
        "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400",
      title: "V15 디텍트 앱솔루트 무선청소기",
      category: "생활",
      brand: "다이슨",
      originalPrice: 1290000,
      salePrice: 799000,
      discountRate: 38,
      endTime: new Date(Date.now() + 8.2 * 60 * 60 * 1000).toISOString(), // 8시간 12분 후
      badge: "NEW" as const,
      rating: 4.7,
      reviewCount: 567,
      freeShipping: true,
    },
    {
      id: 5,
      thumbnail:
        "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400",
      title: "비비고 왕교자 만두 1kg x 5봉",
      category: "식품",
      brand: "CJ",
      originalPrice: 49500,
      salePrice: 13900,
      discountRate: 72,
      endTime: new Date(Date.now() + 0.75 * 60 * 60 * 1000).toISOString(), // 45분 후
      badge: null,
      rating: 4.8,
      reviewCount: 3421,
      freeShipping: false,
    },
    {
      id: 6,
      thumbnail:
        "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400",
      title: "그램 17인치 노트북 13세대 i7 / 16GB / 512GB",
      category: "가전",
      brand: "LG",
      originalPrice: 2690000,
      salePrice: 1199000,
      discountRate: 55,
      endTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(), // 2시간 30분 후
      badge: "BEST" as const,
      rating: 4.5,
      reviewCount: 234,
      freeShipping: true,
    },
    {
      id: 7,
      thumbnail:
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400",
      title: "울트라부스트 22 러닝화",
      category: "패션",
      brand: "아디다스",
      originalPrice: 219000,
      salePrice: 129000,
      discountRate: 41,
      endTime: new Date(Date.now() + 15.37 * 60 * 60 * 1000).toISOString(), // 15시간 22분 후
      badge: null,
      rating: 4.7,
      reviewCount: 789,
      freeShipping: true,
    },
    {
      id: 8,
      thumbnail:
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400",
      title: "워터뱅크 블루 히알루론산 기획세트",
      category: "뷰티",
      brand: "라네즈",
      originalPrice: 98000,
      salePrice: 39000,
      discountRate: 60,
      endTime: new Date(Date.now() + 4.31 * 60 * 60 * 1000).toISOString(), // 4시간 18분 후
      badge: "HOT" as const,
      rating: 4.9,
      reviewCount: 1892,
      freeShipping: true,
    },
    {
      id: 9,
      thumbnail:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
      title: "에어팟 프로 2세대 USB-C",
      category: "가전",
      brand: "애플",
      originalPrice: 359000,
      salePrice: 289000,
      discountRate: 19,
      endTime: new Date(Date.now() + 6.5 * 60 * 60 * 1000).toISOString(), // 6시간 30분 후
      badge: "NEW" as const,
      rating: 4.9,
      reviewCount: 4521,
      freeShipping: true,
    },
    {
      id: 10,
      thumbnail:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
      title: "메타 퀘스트 3 VR 헤드셋 128GB",
      category: "가전",
      brand: "메타",
      originalPrice: 729000,
      salePrice: 549000,
      discountRate: 25,
      endTime: new Date(Date.now() + 10.15 * 60 * 60 * 1000).toISOString(), // 10시간 9분 후
      badge: null,
      rating: 4.6,
      reviewCount: 328,
      freeShipping: true,
    },
    {
      id: 11,
      thumbnail:
        "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400",
      title: "레이밴 웨이페어러 선글라스",
      category: "패션",
      brand: "레이밴",
      originalPrice: 189000,
      salePrice: 99000,
      discountRate: 48,
      endTime: new Date(Date.now() + 7.8 * 60 * 60 * 1000).toISOString(), // 7시간 48분 후
      badge: null,
      rating: 4.8,
      reviewCount: 612,
      freeShipping: true,
    },
    {
      id: 12,
      thumbnail:
        "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400",
      title: "백설 요리유 대두유 1.8L x 4개",
      category: "식품",
      brand: "CJ",
      originalPrice: 42000,
      salePrice: 19900,
      discountRate: 53,
      endTime: new Date(Date.now() + 1.2 * 60 * 60 * 1000).toISOString(), // 1시간 12분 후
      badge: null,
      rating: 4.7,
      reviewCount: 2156,
      freeShipping: false,
    },
  ];

  return Response.json(deals);
};
