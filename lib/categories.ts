// lib/categories.ts
// 카테고리 탭(URL의 ?category=)과 상품 데이터의 category 값을 연결합니다.

export const CATEGORIES = [
  { id: "all", label: "전체", value: null },
  { id: "fashion", label: "패션", value: "패션" },
  { id: "tech", label: "가전", value: "가전" },
  { id: "beauty", label: "뷰티/건강", value: "뷰티" },
  { id: "food", label: "식품", value: "식품" },
  { id: "living", label: "생활/주방", value: "생활" },
] as const;

// URL의 카테고리 id를 상품 데이터의 category 값으로 바꿉니다. 전체이거나 모르는 값이면 null.
export const getCategoryValue = (id?: string | null): string | null =>
  CATEGORIES.find((category) => category.id === id)?.value ?? null;
