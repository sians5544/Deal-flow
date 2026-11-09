// lib/deals.ts
// 목 데이터와 조회 로직. 서버 컴포넌트와 API 라우트가 함께 사용합니다.

import { Deal, DealDetail } from "@/types/deal";
import { getCategoryValue } from "@/lib/categories";

const today = new Date();
const todayAt = (hour: number, minute = 0) =>
  new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    hour,
    minute,
  ).toISOString();

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
    openTime: todayAt(9, 0),
    endTime: todayAt(22, 30),
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
    openTime: todayAt(10, 30),
    endTime: todayAt(20, 0),
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
    openTime: todayAt(11, 0),
    endTime: todayAt(23, 59),
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
    openTime: todayAt(12, 0),
    endTime: todayAt(21, 0),
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
    openTime: todayAt(13, 0),
    endTime: todayAt(18, 0),
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
    openTime: todayAt(14, 0),
    endTime: todayAt(23, 0),
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
    openTime: todayAt(15, 0),
    endTime: todayAt(22, 0),
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
    openTime: todayAt(16, 0),
    endTime: todayAt(21, 30),
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
    openTime: todayAt(17, 0),
    endTime: todayAt(23, 30),
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
    openTime: todayAt(18, 0),
    endTime: todayAt(22, 0),
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
    openTime: todayAt(19, 0),
    endTime: todayAt(23, 0),
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
    openTime: todayAt(20, 0),
    endTime: todayAt(23, 59),
    badge: null,
    rating: 4.7,
    reviewCount: 2156,
    freeShipping: false,
  },
];

// 상세 페이지에만 필요한 정보. 기본 정보(deals)와 id로 합쳐서 쓰므로 같은 값을 두 번 적지 않습니다.
type DealDetailExtra = Omit<DealDetail, keyof Deal>;

const RETURN_30 = "구매일로부터 30일 이내 무료 반품";
const RETURN_FOOD = "신선·냉동 식품은 단순 변심 반품 불가";

const dealDetailExtras: Record<number, DealDetailExtra> = {
  1: {
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800",
      "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800",
      "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800",
    ],
    qnaCount: 45,
    wishCount: 8291,
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
    returnPolicy: RETURN_30,
    description: "에어 조던 1 레트로 하이 OG 상품 상세 정보입니다.",
  },
  2: {
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800",
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
      "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=800",
    ],
    qnaCount: 23,
    wishCount: 3412,
    breadcrumb: ["홈", "가전", "음향기기", "무선이어폰"],
    colors: [
      { name: "그라파이트", hex: "#374151" },
      { name: "화이트", hex: "#F9FAFB" },
      { name: "보라", hex: "#7C3AED" },
    ],
    sizes: [{ label: "기본", soldOut: false }],
    returnPolicy: RETURN_30,
    description: "갤럭시 버즈2 프로 상품 상세 정보입니다.",
  },
  3: {
    images: [
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800",
    ],
    qnaCount: 61,
    wishCount: 5120,
    breadcrumb: ["홈", "뷰티", "스킨케어", "세럼"],
    colors: [],
    sizes: [{ label: "50ml", soldOut: false }],
    returnPolicy: "미개봉 상품에 한해 7일 이내 반품",
    description: "어드밴스드 나이트 리페어 세럼 상품 상세 정보입니다.",
  },
  4: {
    images: ["https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800"],
    qnaCount: 34,
    wishCount: 2789,
    breadcrumb: ["홈", "생활", "청소기", "무선청소기"],
    colors: [{ name: "니켈", hex: "#9CA3AF" }],
    sizes: [{ label: "기본", soldOut: false }],
    returnPolicy: RETURN_30,
    description: "V15 디텍트 앱솔루트 상품 상세 정보입니다.",
  },
  5: {
    images: [
      "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800",
    ],
    qnaCount: 12,
    wishCount: 1980,
    breadcrumb: ["홈", "식품", "냉동식품", "만두"],
    colors: [],
    sizes: [],
    returnPolicy: RETURN_FOOD,
    description: "비비고 왕교자 상품 상세 정보입니다.",
  },
  6: {
    images: [
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800",
    ],
    qnaCount: 88,
    wishCount: 6402,
    breadcrumb: ["홈", "가전", "컴퓨터", "노트북"],
    colors: [
      { name: "스노우 화이트", hex: "#F3F4F6" },
      { name: "옵시디언 블랙", hex: "#1F2937" },
    ],
    sizes: [{ label: "16GB / 512GB", soldOut: false }],
    returnPolicy: "개봉 후 단순 변심 반품 불가",
    description: "그램 17인치 노트북 상품 상세 정보입니다.",
  },
  7: {
    images: [
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800",
    ],
    qnaCount: 19,
    wishCount: 2234,
    breadcrumb: ["홈", "패션", "신발", "러닝화"],
    colors: [
      { name: "코어 블랙", hex: "#111827" },
      { name: "클라우드 화이트", hex: "#FFFFFF" },
    ],
    sizes: [
      { label: "250", soldOut: false },
      { label: "260", soldOut: false },
      { label: "270", soldOut: true },
      { label: "280", soldOut: false },
    ],
    returnPolicy: RETURN_30,
    description: "울트라부스트 22 러닝화 상품 상세 정보입니다.",
  },
  8: {
    images: ["https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800"],
    qnaCount: 27,
    wishCount: 3150,
    breadcrumb: ["홈", "뷰티", "스킨케어", "크림"],
    colors: [],
    sizes: [{ label: "기획세트", soldOut: false }],
    returnPolicy: "미개봉 상품에 한해 7일 이내 반품",
    description: "워터뱅크 블루 히알루론산 기획세트 상품 상세 정보입니다.",
  },
  9: {
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    ],
    qnaCount: 102,
    wishCount: 9870,
    breadcrumb: ["홈", "가전", "음향기기", "무선이어폰"],
    colors: [{ name: "화이트", hex: "#FFFFFF" }],
    sizes: [{ label: "기본", soldOut: false }],
    returnPolicy: "개봉 후 단순 변심 반품 불가",
    description: "에어팟 프로 2세대 상품 상세 정보입니다.",
  },
  10: {
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
    ],
    qnaCount: 40,
    wishCount: 4102,
    breadcrumb: ["홈", "가전", "게임", "VR"],
    colors: [{ name: "화이트", hex: "#F9FAFB" }],
    sizes: [{ label: "128GB", soldOut: false }],
    returnPolicy: "개봉 후 단순 변심 반품 불가",
    description: "메타 퀘스트 3 상품 상세 정보입니다.",
  },
  11: {
    images: [
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800",
    ],
    qnaCount: 15,
    wishCount: 1876,
    breadcrumb: ["홈", "패션", "잡화", "선글라스"],
    colors: [
      { name: "블랙", hex: "#111827" },
      { name: "토터스", hex: "#78350F" },
    ],
    sizes: [{ label: "50mm", soldOut: false }],
    returnPolicy: RETURN_30,
    description: "레이밴 웨이페어러 선글라스 상품 상세 정보입니다.",
  },
  12: {
    images: [
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800",
    ],
    qnaCount: 8,
    wishCount: 960,
    breadcrumb: ["홈", "식품", "조미료", "식용유"],
    colors: [],
    sizes: [],
    returnPolicy: RETURN_FOOD,
    description: "백설 요리유 대두유 상품 상세 정보입니다.",
  },
};

export type DealsPage = {
  items: Deal[];
  total: number;
  page: number;
  totalPages: number;
};

const filterByCategory = (list: Deal[], categoryId?: string | null) => {
  const category = getCategoryValue(categoryId);
  return category ? list.filter((deal) => deal.category === category) : list;
};

export const getAllDeals = (categoryId?: string | null): Deal[] =>
  filterByCategory(deals, categoryId);

export const getDealsByTab = (
  tab: string,
  page = 1,
  categoryId?: string | null,
  limit = 12,
): DealsPage => {
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const filtered = filterByCategory(deals, categoryId).filter((deal) => {
    const target =
      tab === "open" ? new Date(deal.openTime) : new Date(deal.endTime);
    return target >= todayStart && target < todayEnd;
  });

  const totalPages = Math.ceil(filtered.length / limit);
  const items = filtered.slice((page - 1) * limit, page * limit);

  return { items, total: filtered.length, page, totalPages };
};

export const getDealById = (id: number): DealDetail | null => {
  const deal = deals.find((d) => d.id === id);
  const extra = dealDetailExtras[id];
  if (!deal || !extra) return null;
  return { ...deal, ...extra };
};
