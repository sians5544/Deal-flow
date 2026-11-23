// 영역이 비었을 때 보여주는 안내 상자 (Design §6).
const EmptyNotice = ({ children }: { children: React.ReactNode }) => (
  <p className="rounded-lg bg-[#F9FAFB] py-10 text-center text-sm text-[#6B7280]">
    {children}
  </p>
);

export default EmptyNotice;
