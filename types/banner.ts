// types/banner.ts
// 기획전 배너. 운영자가 정하는 전시 데이터라 딜(Deal)과 따로 둡니다.
// Design Ref: §1.2 — 딜은 판매 단위, 배너는 보여주기 단위. 배너 정보를 Deal에 붙이지 않습니다.
import { CategoryId } from "./deal";

export interface Banner {
  id: number;
  category: CategoryId; // 누르면 /best?category={category}
  image: string; // 기획전용 가로 이미지
  title: string; // "겨울 아우터 특가전"
  subtitle?: string; // "패딩·코트 최대 60%"
  startAt: string; // ISO 8601, 노출 시작 (포함)
  endAt: string; // ISO 8601, 노출 끝 (미포함)
  order: number; // 작을수록 앞
}
