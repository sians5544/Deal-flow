import { PageTitleProps } from "@/types";

const PageTitle = ({ title, description }: PageTitleProps) => {
  return (
    <div className="pb-4">
      <h1 className="text-2xl font-bold text-[#111827] md:text-3xl">{title}</h1>
      {description && (
        <p className="mt-2 text-base text-[#6B7280]">{description}</p>
      )}
    </div>
  );
};

export default PageTitle;
