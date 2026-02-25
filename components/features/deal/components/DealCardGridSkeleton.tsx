const DealCardGridSkeleton = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl bg-muted animate-pulse">
          <div className="aspect-video w-full rounded-t-xl bg-muted-foreground/20" />
          <div className="p-3 space-y-2">
            <div className="h-3 w-1/2 rounded bg-muted-foreground/20" />
            <div className="h-4 w-3/4 rounded bg-muted-foreground/20" />
            <div className="h-5 w-1/3 rounded bg-muted-foreground/20" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DealCardGridSkeleton;
