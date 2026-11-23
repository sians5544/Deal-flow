import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import DealCard from "@/components/features/deal/components/DealCard";
import {
  BannerSlide,
  BestPage,
  EmptyNotice,
  PagedCarousel,
  SectionHeader,
  UpcomingPage,
} from "@/components/features/home/components";
import { getHomeSections, HOME_LIMITS } from "@/lib/home";
import { formatKstTime } from "@/lib/dealTime";

// Design Ref: §2.3 — 홈은 searchParams를 읽지 않아 그대로 두면 빌드 때 한 번 그려져 now가 빌드 시각에 멈춥니다.
// ISR(revalidate)은 방문이 드물면 첫 방문자가 오래된 화면을 봅니다. 그래서 요청마다 그립니다.
// Plan SC: FR-05 끝난 딜이 보이지 않음
export const dynamic = "force-dynamic";

// Design Ref: §2.1 — 서버 컴포넌트. 캐러셀만 클라이언트이고, 그 안의 카드·장은 여기서 그려 children으로 넘깁니다.
const Home = () => {
  // Design Ref: §1.2 — 시각은 한 번만 정해 아래로 내려줍니다. 컴포넌트 안에서 new Date()를 부르지 않습니다.
  const now = new Date();
  const { banners, closing, upcomingPages, bestPages, nextOpenAt } =
    getHomeSections(now);

  return (
    <div className="flex flex-col gap-10 pb-12">
      <h1 className="sr-only">오늘의 특가 딜</h1>

      {/* 1. 기획전 배너: 노출할 배너가 없으면 영역을 그리지 않습니다 (Plan SC: FR-01) */}
      {banners.length > 0 && (
        // 영역 이름은 PagedCarousel의 region(label="기획전")이 붙입니다. section에도 붙이면 "기획전"이 두 번 읽힙니다.
        <section>
          <PagedCarousel label="기획전" itemName="기획전" autoplay padIndex>
            {banners.map((banner, i) => (
              <BannerSlide key={banner.id} banner={banner} priority={i === 0} />
            ))}
          </PagedCarousel>
        </section>
      )}

      {/* 2. 오늘 마감: 기존 shadcn Carousel로 카드를 옆으로 넘깁니다 (Plan SC: FR-02) */}
      <section>
        <SectionHeader title="오늘 마감" sub="마감 빠른 순" href="/today?tab=closing" />
        {closing.length === 0 ? (
          // Plan SC: FR-08 진행 중인 딜이 없으면 다음 오픈 시각을 알려줍니다.
          <EmptyNotice>
            지금 진행 중인 딜이 없어요.{" "}
            {nextOpenAt
              ? `다음 딜은 ${formatKstTime(nextOpenAt)}에 열려요.`
              : "내일 오전 9시에 새 딜이 열려요."}
          </EmptyNotice>
        ) : (
          <Carousel opts={{ align: "start" }} aria-label="오늘 마감 딜">
            <CarouselContent className="-ml-3">
              {closing.map((deal) => (
                <CarouselItem
                  key={deal.id}
                  className="basis-[70%] pl-3 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <DealCard deal={deal} now={now} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious
              aria-label="이전 딜"
              className="left-2 top-[30%] hidden bg-white/90 md:flex"
            />
            <CarouselNext
              aria-label="다음 딜"
              className="right-2 top-[30%] hidden bg-white/90 md:flex"
            />
          </Carousel>
        )}
      </section>

      {/* 3. 곧 오픈: 오픈 시각 순 최대 15개를 5개씩 한 장 (Plan SC: FR-03) */}
      <section>
        <SectionHeader title="곧 오픈" sub="오픈 시각 순" href="/today?tab=open" />
        {upcomingPages.length === 0 ? (
          <EmptyNotice>오늘 남은 오픈 예정 딜이 없어요.</EmptyNotice>
        ) : (
          <PagedCarousel label="곧 오픈 딜" itemName="목록">
            {upcomingPages.map((deals, i) => (
              <UpcomingPage key={i} deals={deals} />
            ))}
          </PagedCarousel>
        )}
      </section>

      {/* 4. 베스트: 리뷰 많은 순 최대 15개를 5개씩 한 장, 순위는 장을 넘어 이어짐 (Plan SC: FR-04) */}
      <section>
        <SectionHeader title="베스트" sub="리뷰 많은 순" href="/best" />
        {bestPages.length === 0 ? (
          <EmptyNotice>지금 살 수 있는 딜이 없어요.</EmptyNotice>
        ) : (
          <PagedCarousel label="베스트 순위" itemName="목록">
            {bestPages.map((deals, i) => (
              <BestPage
                key={i}
                deals={deals}
                startRank={i * HOME_LIMITS.pageSize + 1}
              />
            ))}
          </PagedCarousel>
        )}
      </section>
    </div>
  );
};

export default Home;
