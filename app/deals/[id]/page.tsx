import DealDetail from "./_components/DealDetail";

const DealDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return <DealDetail dealId={id} />;
};

export default DealDetailPage;
