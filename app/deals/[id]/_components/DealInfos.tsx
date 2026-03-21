import { useState } from "react";
import { DealInfosProps } from "@/types/deal";
import DealTimer from "@/components/features/deal/components/DealTimer";

const DetailInfos = ({
  title,
  category,
  brand,
  rating,
  reviewCount,
  qnaCount,
  wishCount,
  endTime,
  discountRate,
  originalPrice,
  salePrice,
  freeShipping,
  returnPolicy,
  colors,
  sizes,
}: DealInfosProps) => {
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name ?? "");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex flex-col gap-2 w-1/2">
      {/* 타이틀 */}
      <div className="border-b pb-4 flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">
          {category} · {brand}
        </span>
        <h1 className="text-xl font-bold text-[#111827]">{title}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>⭐️ {rating}</span>
          <span>({reviewCount.toLocaleString()}개 리뷰)</span>
          <span className="text-[#D1D5DB]">·</span>
          <span>Q&A {qnaCount}</span>
          <span className="text-[#D1D5DB]">·</span>
          <span>찜 {wishCount.toLocaleString()}</span>
        </div>
      </div>

      {/* 타이머 */}
      <div className="border-b flex items-center bg-[#F3F4F6] rounded-lg p-4 gap-4 mt-1 mb-1">
        <div className="flex flex-col gap-1 flex-1">
          <div className="text-sm font-semibold text-[#111827]">
            판매 마감까지
          </div>
          <div className="text-sm text-muted-foreground">
            이 가격에 살 수 있는 마지막 기회
          </div>
        </div>
        <DealTimer
          className="bg-[#000000]/20 backdrop-blur-sm"
          endTime={endTime}
          discountRate={discountRate}
        />
      </div>

      {/* 가격 */}
      <div className="border-b pb-4 flex flex-col gap-1">
        <div className="flex items-center gap-3 text-sm">
          <span className="w-12 text-muted-foreground">정상가</span>
          <span className="line-through text-muted-foreground">
            ₩{originalPrice.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-12 text-sm text-muted-foreground">할인가</span>
          {discountRate && (
            <span className="bg-[#EF4444] text-white text-xs font-bold px-2 py-0.5 rounded">
              {discountRate}%↓
            </span>
          )}
          <span className="text-2xl font-bold text-[#EF4444]">
            ₩{salePrice.toLocaleString()}
          </span>
        </div>
        <span className="text-xs text-muted-foreground pl-15">
          {(originalPrice - salePrice).toLocaleString()}원 절약
        </span>
      </div>

      {/* 배송/반품 */}
      <div className="border-b pb-4 flex flex-col gap-2">
        <div className="flex gap-3 text-sm">
          <span className="w-12 text-muted-foreground">배송</span>
          <span>
            {freeShipping ? (
              <span className="font-semibold text-[#10B981]">무료배송</span>
            ) : (
              <span className="text-[#6B7280]">유료배송</span>
            )}
            <span className="text-muted-foreground">
              {" "}
              · 오늘 오후 2시 이전 주문 시 오늘 출발
            </span>
          </span>
        </div>
        <div className="flex gap-3 text-sm">
          <span className="w-12 text-muted-foreground">반품</span>
          <span className="text-[#6B7280]">{returnPolicy}</span>
        </div>
      </div>

      {/* 색상 + 사이즈 */}
      <div className="border-b pb-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="w-12 text-sm text-[#6B7280]">색상</span>
          <div className="flex gap-2">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color.name)}
                title={color.name}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  selectedColor === color.name
                    ? "border-[#111827] scale-110"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-12 text-sm text-[#6B7280]">사이즈</span>
          <div className="flex gap-2 flex-wrap">
            {sizes.map((size) => (
              <button
                key={size.label}
                disabled={size.soldOut}
                onClick={() => !size.soldOut && setSelectedSize(size.label)}
                className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                  size.soldOut
                    ? "bg-[#F3F4F6] text-[#D1D5DB] cursor-not-allowed"
                    : selectedSize === size.label
                      ? "bg-[#111827] text-white font-semibold"
                      : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 수량 */}
      <div className="border-b pb-4 flex items-center gap-3">
        <span className="w-12 text-sm text-[#6B7280]">수량</span>
        <div className="flex items-center border border-[#E5E7EB] rounded-md">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-1.5 text-[#6B7280] hover:bg-[#F3F4F6] rounded-l-md"
          >
            −
          </button>
          <span className="px-4 py-1.5 text-sm font-semibold">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="px-3 py-1.5 text-[#6B7280] hover:bg-[#F3F4F6] rounded-r-md"
          >
            +
          </button>
        </div>
      </div>

      {/* 총 금액 + CTA */}
      <div className="flex flex-col gap-3 pt-1">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-[#111827]">
            총 상품금액
          </span>
          <span className="text-xl font-bold text-[#111827]">
            ₩{(salePrice * quantity).toLocaleString()}
          </span>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 py-3 rounded-lg border border-[#E5E7EB] text-sm font-semibold text-[#111827] hover:bg-[#F3F4F6] transition-colors">
            장바구니 담기
          </button>
          <button className="flex-[1.1] py-3 rounded-lg bg-[#111827] text-sm font-bold text-white hover:bg-[#1f2937] transition-colors">
            바로 구매하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailInfos;
