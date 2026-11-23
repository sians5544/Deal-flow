import Image from "next/image";
import Link from "next/link";
import { Banner } from "@/types/banner";
import { bannerHref } from "@/lib/banners";
import { getCategoryLabel } from "@/lib/categories";

// 기획전 배너 한 장. 전체가 그 카테고리 목록(/best?category=)으로 가는 링크입니다.
// Design Ref: §5.1 — 목업의 큰 딜 영역 모양(왼쪽 이미지, 오른쪽 어두운 글 영역)을 기획전 내용으로 바꿈.
// 모바일에서는 사진 위, 글 아래 (Plan 2.2).
// Plan SC: FR-01
const BannerSlide = ({
  banner,
  priority = false,
}: {
  banner: Banner;
  // 첫 장만 true. 첫 화면에 바로 보이는 큰 이미지라 먼저 받아 LCP를 줄입니다.
  priority?: boolean;
}) => (
  <Link
    href={bannerHref(banner)}
    className="grid overflow-hidden rounded-2xl bg-[#111827] text-white md:grid-cols-2"
  >
    <div className="relative aspect-video bg-[#F3F4F6] md:aspect-auto md:min-h-72">
      {/* 제목·부제목이 글로 옆에 있으므로 이미지는 꾸밈용(alt="")입니다. */}
      <Image
        src={banner.image}
        alt=""
        fill
        priority={priority}
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover"
      />
    </div>
    <div className="flex flex-col justify-center gap-3 p-6 md:p-10">
      <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
        {getCategoryLabel(banner.category)} 기획전
      </span>
      <p className="text-2xl font-bold md:text-3xl">{banner.title}</p>
      {banner.subtitle && (
        <p className="text-sm text-white/70 md:text-base">{banner.subtitle}</p>
      )}
      <p className="text-sm text-white/50">기획전 보러 가기 →</p>
    </div>
  </Link>
);

export default BannerSlide;
