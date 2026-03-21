"use client";

import useSWR from "swr";
import DealImages from "./DealImages";
import DetailInfos from "./DealInfos";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const DealDetail = ({ dealId }: { dealId: string }) => {
  const { data, error } = useSWR(`/api/deals/${dealId}`, fetcher);

  if (error) return <div>Failed to load deal details.</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div className="flex gap-6">
      <DealImages thumbnail={data.thumbnail} images={data.images} />
      <DetailInfos {...data} />
    </div>
  );
};

export default DealDetail;
