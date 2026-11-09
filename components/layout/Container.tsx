const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-8 lg:px-[120px] lg:py-8">
      {children}
    </div>
  );
};

export default Container;
