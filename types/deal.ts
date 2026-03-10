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
  endTime: string; // ISO 8601 format
  badge: "BEST" | "HOT" | "NEW" | null;
  rating: number;
  reviewCount: number;
  freeShipping: boolean;
}

export type DealTimerProps = {
  endTime: string; // ISO 8601 format
  discountRate: number;
};
