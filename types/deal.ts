// types/deal.ts
export interface Deal {
  id: number;
  thumbnail: string;
  title: string;
  category: string;
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
