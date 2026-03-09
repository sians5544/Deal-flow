const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mx-auto max-w-[1440px] px-[120px] py-8">{children}</div>
  );
};

export default Container;
