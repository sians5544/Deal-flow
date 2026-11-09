"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";

// 카테고리로 거를 수 있는 목록 페이지. 다른 페이지에서 탭을 누르면 베스트로 이동합니다.
const LISTING_PATHS = ["/best", "/today"];

const CategoryTabs = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isListing = LISTING_PATHS.includes(pathname);
  const active = isListing ? (searchParams.get("category") ?? "all") : "all";

  const handleSelect = (id: string) => {
    const params = new URLSearchParams(
      isListing ? searchParams.toString() : "",
    );
    if (id === "all") {
      params.delete("category");
    } else {
      params.set("category", id);
    }
    // 카테고리가 바뀌면 결과 수도 바뀌므로 첫 페이지부터 보여줍니다.
    if (params.has("page")) params.set("page", "1");

    const query = params.toString();
    const path = isListing ? pathname : "/best";
    router.push(query ? `${path}?${query}` : path);
  };

  return (
    <nav className="bg-[#111827]">
      <ul className="mx-auto flex max-w-[1440px] items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4 py-3 md:px-8 lg:px-[120px]">
        {CATEGORIES.map((category) => {
          const isActive = active === category.id;
          return (
            <li key={category.id}>
              <button
                onClick={() => handleSelect(category.id)}
                aria-pressed={isActive}
                className={`shrink-0 whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white text-[#111827]"
                    : "text-[#9CA3AF] hover:bg-white hover:text-[#111827]"
                }`}
              >
                {category.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default CategoryTabs;
