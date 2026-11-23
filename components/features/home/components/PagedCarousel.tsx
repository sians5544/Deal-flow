"use client";

import { Children, useEffect, useState, useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import useAutoplay from "./useAutoplay";

// 서버에서 그린 장(children)을 받아 한 장씩 넘겨 보여주는 캐러셀. 배너·곧 오픈·베스트가 함께 씁니다.
// Design Ref: §5.3 — 세 영역 모두 "서버에서 그린 장을 받아 넘긴다"는 구조가 같고 자동 넘김 여부만 다릅니다.
// 이 파일이 홈에서 새로 생긴 유일한 "use client"입니다. 장 내용은 서버 컴포넌트라 브라우저로 JS가 가지 않습니다.
// Plan SC: FR-01 배너 넘김, FR-03·FR-04 5개씩 넘김, FR-11 배너 자동 넘김

type Props = {
  children: React.ReactNode;
  label: string; // 영역 이름 (스크린리더가 "기획전, 캐러셀"처럼 읽음)
  itemName: string; // 화살표 이름에 붙는 말 ("이전 기획전", "다음 목록")
  autoplay?: boolean;
  intervalMs?: number;
  padIndex?: boolean; // 장 표시를 "01 / 05"처럼 두 자리로 (배너)
};

// 운영체제의 "동작 줄이기" 설정을 읽습니다.
// Design Ref: §5.3 — 렌더 중에 window를 읽으면 서버 HTML(false)과 달라져 hydration 불일치가 납니다.
// useSyncExternalStore는 hydration 동안 getServerSnapshot(false)을 쓰고, 그 다음에 실제 값으로 다시 그립니다.
// 그래서 "마운트 후에 읽는다"와 같은 결과를 effect 안의 setState 없이 얻고, 설정이 바뀌면 따라갑니다.
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const subscribeReducedMotion = (onChange: () => void) => {
  const mql = window.matchMedia(REDUCED_MOTION);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
};
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;
const getServerReducedMotion = () => false;

const PagedCarousel = ({
  children,
  label,
  itemName,
  autoplay = false,
  intervalMs = 5000,
  padIndex = false,
}: Props) => {
  const slides = Children.toArray(children);
  const count = slides.length;

  const [api, setApi] = useState<CarouselApi>();
  const [index, setIndex] = useState(0);
  // null = 사용자가 아직 누르지 않음. 그때는 동작 줄이기 설정을 따르고, 누른 뒤에는 사용자 선택을 존중합니다.
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  // 마우스가 올라가 있거나 키보드 포커스가 안에 있으면 읽는 중이라 넘기지 않습니다 (Plan 2.2).
  const [hovering, setHovering] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  );
  const paused = userPaused ?? reducedMotion;
  const playing = autoplay && !paused && !hovering && !focusWithin && count > 1;

  // 손으로 넘기든 자동으로 넘어가든 embla의 "select" 이벤트로 현재 장을 맞춥니다.
  useEffect(() => {
    if (!api) return;
    const onSelect = () => setIndex(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // index를 resetKey로 넘겨, 장이 바뀔 때마다 타이머가 처음부터 다시 셉니다.
  useAutoplay(playing, intervalMs, () => api?.scrollNext(), index);

  // 장이 1개면 화살표·"01 / 01"·일시정지가 의미 없으므로 내용만 그립니다 (Design §5.3).
  if (count <= 1) return <>{children}</>;

  const format = (n: number) => (padIndex ? String(n).padStart(2, "0") : String(n));

  return (
    <Carousel
      opts={{ loop: true }}
      setApi={setApi}
      aria-label={label}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setFocusWithin(true)}
      onBlur={(e) => {
        // 포커스가 캐러셀 안의 다른 요소로 옮겨 가는 경우는 아직 안에 있는 것입니다.
        if (!e.currentTarget.contains(e.relatedTarget)) setFocusWithin(false);
      }}
    >
      <CarouselContent>
        {slides.map((slide, i) => (
          <CarouselItem key={i} aria-label={`${i + 1} / ${count}`}>
            {slide}
          </CarouselItem>
        ))}
      </CarouselContent>

      <div className="mt-3 flex items-center gap-3">
        {/* 위치 막대: 지금 몇 번째 장인지 길이로 보여줍니다. 숫자 표시가 있으므로 스크린리더에서는 숨깁니다. */}
        <div aria-hidden="true" className="h-0.5 flex-1 bg-[#E5E7EB]">
          <div
            className="h-full bg-[#111827] transition-[width] duration-300"
            style={{ width: `${((index + 1) / count) * 100}%` }}
          />
        </div>
        <CarouselPrevious
          aria-label={`이전 ${itemName}`}
          className="static translate-x-0 translate-y-0"
        />
        {/* 재생 중에는 5초마다 읽어 대지 않도록 off, 멈췄거나 자동 넘김이 없으면 polite (WAI 캐러셀 패턴) */}
        <p
          aria-live={playing ? "off" : "polite"}
          aria-atomic="true"
          className="min-w-14 text-center text-sm tabular-nums text-[#6B7280]"
        >
          <b className="text-[#111827]">{format(index + 1)}</b> / {format(count)}
        </p>
        <CarouselNext
          aria-label={`다음 ${itemName}`}
          className="static translate-x-0 translate-y-0"
        />
        {autoplay && (
          <Button
            variant="outline"
            size="icon"
            className="size-8 rounded-full"
            aria-label={paused ? "자동 넘김 시작" : "자동 넘김 멈추기"}
            onClick={() => setUserPaused(!paused)}
          >
            {paused ? <Play /> : <Pause />}
          </Button>
        )}
      </div>
    </Carousel>
  );
};

export default PagedCarousel;
