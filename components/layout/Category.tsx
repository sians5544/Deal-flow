"use client";

import { useRouter, useSearchParams } from "next/navigation";

const CATEGORIES = [
  { id: "all", label: "전체" },
  { id: "fashion", label: "패션" },
  { id: "tech", label: "가전" },
  { id: "beauty", label: "뷰티/건강" },
  { id: "food", label: "식품" },
  { id: "living", label: "생활/주방" },
];

const Category = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "all";

  const handleSelect = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id === "all") {
      params.delete("category");
    } else {
      params.set("category", id);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <nav>
      <ul className="flex space-x-2 bg-[#111827] px-10 py-3 items-center">
        {CATEGORIES.map((category) => {
          const isActive = active === category.id;
          return (
            <li key={category.id}>
              <button
                onClick={() => handleSelect(category.id)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
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

export default Category;
