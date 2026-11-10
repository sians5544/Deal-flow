// 테스트용 가짜 데이터 생성 함수.
// 실제 API 응답과 같은 타입(Deal, DealDetail)으로 만들고, 테스트마다 필요한 값만 덮어씁니다.
import { Deal, DealDetail } from "@/types/deal";

export const makeDeal = (overrides: Partial<Deal> = {}): Deal => ({
  id: 1,
  thumbnail: "https://images.unsplash.com/photo-test?w=400",
  title: "테스트 상품",
  category: "패션",
  brand: "테스트 브랜드",
  originalPrice: 100000,
  salePrice: 70000,
  discountRate: 30,
  openTime: "2026-11-10T00:00:00.000Z",
  endTime: "2026-11-10T13:00:00.000Z",
  badge: null,
  rating: 4.5,
  reviewCount: 10,
  freeShipping: true,
  ...overrides,
});

export const makeDealDetail = (
  overrides: Partial<DealDetail> = {},
): DealDetail => ({
  ...makeDeal(),
  images: ["https://images.unsplash.com/photo-test?w=800"],
  qnaCount: 1,
  wishCount: 2,
  breadcrumb: ["홈", "패션"],
  colors: [{ name: "블랙", hex: "#111827" }],
  sizes: [{ label: "260", soldOut: false }],
  returnPolicy: "구매일로부터 30일 이내 무료 반품",
  description: "테스트 상품 설명",
  ...overrides,
});
