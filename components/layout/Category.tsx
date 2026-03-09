import { Suspense } from "react";
import CategoryTabs from "./CategoryTabs";

const Category = () => {
  return (
    <Suspense fallback={<div className="h-12 bg-gray-200 animate-pulse" />}>
      <CategoryTabs />
    </Suspense>
  );
};

export default Category;
