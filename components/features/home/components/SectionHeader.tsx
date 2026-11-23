import Link from "next/link";

// 홈 섹션 머리: h2 제목 + 기준 설명 + "전체보기" 링크.
// Plan SC: FR-07 영역마다 전체보기 링크. 링크 이름에 영역 이름을 넣어 어디로 가는지 알 수 있게 합니다 (Plan NFR 접근성).
const SectionHeader = ({
  title,
  sub,
  href,
}: {
  title: string;
  sub?: string;
  href: string;
}) => (
  <div className="mb-3 flex items-end justify-between gap-2">
    <div>
      <h2 className="text-lg font-bold text-[#111827] md:text-xl">{title}</h2>
      {sub && <p className="text-xs text-[#6B7280]">{sub}</p>}
    </div>
    <Link
      href={href}
      aria-label={`${title} 전체보기`}
      className="shrink-0 text-sm text-[#6B7280] hover:text-[#111827]"
    >
      전체보기 →
    </Link>
  </div>
);

export default SectionHeader;
