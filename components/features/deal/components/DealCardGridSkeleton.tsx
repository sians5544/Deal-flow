const DealCardGridSkeleton = () => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-white border border-[#E5E7EB] animate-pulse"
        >
          <div className="aspect-square w-full rounded-t-xl bg-muted-foreground/10" />
          <div className="p-3 space-y-2">
            <div className="h-3 w-1/3 rounded bg-muted-foreground/10" />
            <div className="h-4 w-3/4 rounded bg-muted-foreground/10" />
            <div className="h-4 w-1/2 rounded bg-muted-foreground/10" />
            <div className="h-3 w-1/4 rounded bg-muted-foreground/10" />
            <div className="h-6 w-2/5 rounded bg-muted-foreground/10" />
            <div className="h-3 w-1/2 rounded bg-muted-foreground/10" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DealCardGridSkeleton;
