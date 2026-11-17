// lib/categories.ts
// 카테고리 코드와 화면 표시 이름. 상품 데이터와 URL(?category=)은 같은 코드를 쓰고, 화면에 보일 때만 이름으로 바꿉니다.

import { CategoryId } from "@/types/deal";

export const CATEGORIES: { id: CategoryId | "all"; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "fashion", label: "패션" },
  { id: "tech", label: "가전" },
  { id: "beauty", label: "뷰티/건강" },
  { id: "food", label: "식품" },
  { id: "living", label: "생활/주방" },
];

// URL에서 온 값이 실제 카테고리 코드인지 확인합니다. "all"이거나 모르는 값이면 false라서 거르지 않습니다.
export const isCategoryId = (id?: string | null): id is CategoryId =>
  !!id && id !== "all" && CATEGORIES.some((category) => category.id === id);

export const getCategoryLabel = (id: CategoryId): string =>
  CATEGORIES.find((category) => category.id === id)?.label ?? id;
