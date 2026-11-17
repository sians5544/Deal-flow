// types/deal.ts
// 카테고리 코드. 화면 표시 이름은 lib/categories.ts의 getCategoryLabel로 바꿉니다.
export type CategoryId = "fashion" | "tech" | "beauty" | "food" | "living";

export interface Deal {
  id: number;
  thumbnail: string;
  title: string;
  category: CategoryId;
  brand: string;
  originalPrice: number;
  salePrice: number;
  discountRate: number;
  openTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  badge: "BEST" | "HOT" | "NEW" | null;
  rating: number;
  reviewCount: number;
  freeShipping: boolean;
}

export type DealTimerProps = {
  endTime: string; // ISO 8601 format
  discountRate?: number;
};

export interface DealDetail extends Deal {
  title: string;
  images: string[]; // 메인 이미지 포함 전체 이미지 배열
  qnaCount: number;
  wishCount: number;
  breadcrumb: string[]; // 예: ["홈", "패션", "신발", "스니커즈"]
  colors: { name: string; hex: string }[];
  sizes: { label: string; soldOut: boolean }[];
  returnPolicy: string;
  description: string; // 상품 상세 내용 (HTML or 텍스트)
}

export type DealInfosProps = Omit<DealDetail, "images">;
