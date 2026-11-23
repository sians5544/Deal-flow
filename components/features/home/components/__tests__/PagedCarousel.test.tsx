import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockMatchMedia } from "@/test-utils/browserMocks";
import PagedCarousel from "../PagedCarousel";

// embla는 jsdom에서 크기를 잴 수 없어 실제로 넘어가지 않습니다. 넘김 자체는 라이브러리 동작이라 테스트 대상이 아니므로
// 가짜 api로 바꿉니다. 그러면 "자동 넘김이 scrollNext를 부르는지", "select가 오면 장 표시가 바뀌는지" 같은 연결을 확인할 수 있습니다.
// 실제 스와이프·애니메이션은 E2E 대상입니다.
type Handler = () => void;
const fakeApi = {
  selected: 0,
  handlers: {} as Record<string, Handler[]>,
  on: jest.fn((event: string, handler: Handler) => {
    (fakeApi.handlers[event] ??= []).push(handler);
  }),
  off: jest.fn((event: string, handler: Handler) => {
    fakeApi.handlers[event] = (fakeApi.handlers[event] ?? []).filter((h) => h !== handler);
  }),
  selectedScrollSnap: () => fakeApi.selected,
  canScrollPrev: () => true,
  canScrollNext: () => true,
  scrollNext: jest.fn(),
  scrollPrev: jest.fn(),
  // 캐러셀이 i번째 장을 골랐을 때 embla가 하는 일 (select 이벤트)
  select(i: number) {
    fakeApi.selected = i;
    (fakeApi.handlers.select ?? []).forEach((h) => h());
  },
};

jest.mock("embla-carousel-react", () => ({
  __esModule: true,
  default: () => [jest.fn(), fakeApi],
}));

const slides = (n: number) =>
  Array.from({ length: n }, (_, i) => <div key={i}>{`장 ${i + 1}`}</div>);

const advance = (ms: number) =>
  act(() => {
    jest.advanceTimersByTime(ms);
  });

describe("PagedCarousel", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockMatchMedia(false);
    fakeApi.selected = 0;
    fakeApi.handlers = {};
    fakeApi.scrollNext.mockClear();
    fakeApi.scrollPrev.mockClear();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  const user = () => userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  describe("장 표시와 화살표", () => {
    it("장이 1개면 화살표·장 표시·일시정지 버튼 없이 내용만 그린다", () => {
      render(
        <PagedCarousel label="기획전" itemName="기획전" autoplay>
          {slides(1)}
        </PagedCarousel>,
      );

      expect(screen.getByText("장 1")).toBeInTheDocument();
      expect(screen.queryByRole("region")).not.toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(screen.queryByText(/\/ 1/)).not.toBeInTheDocument();
    });

    it("자동 넘김이 없으면 일시정지 버튼 없이 '1 / 3'을 보여주고 5초가 지나도 넘기지 않는다", () => {
      render(
        <PagedCarousel label="베스트 순위" itemName="목록">
          {slides(3)}
        </PagedCarousel>,
      );

      expect(screen.queryByRole("button", { name: /자동 넘김/ })).not.toBeInTheDocument();
      expect(screen.getByText("/ 3", { exact: false })).toHaveTextContent("1 / 3");

      advance(10000);
      expect(fakeApi.scrollNext).not.toHaveBeenCalled();
    });

    it("padIndex면 장 표시를 '01 / 05'처럼 두 자리로 보여준다", () => {
      render(
        <PagedCarousel label="기획전" itemName="기획전" padIndex>
          {slides(5)}
        </PagedCarousel>,
      );

      expect(screen.getByText("/ 05", { exact: false })).toHaveTextContent("01 / 05");
    });

    it("영역 이름은 label이고 화살표 이름은 '이전·다음 {itemName}'이다", () => {
      render(
        <PagedCarousel label="곧 오픈 딜" itemName="목록">
          {slides(3)}
        </PagedCarousel>,
      );

      expect(screen.getByRole("region", { name: "곧 오픈 딜" })).toHaveAttribute(
        "aria-roledescription",
        "carousel",
      );
      expect(screen.getByRole("button", { name: "이전 목록" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "다음 목록" })).toBeInTheDocument();
    });

    it("다음 화살표를 누르면 캐러셀을 다음 장으로 넘긴다", async () => {
      render(
        <PagedCarousel label="곧 오픈 딜" itemName="목록">
          {slides(3)}
        </PagedCarousel>,
      );

      await user().click(screen.getByRole("button", { name: "다음 목록" }));

      expect(fakeApi.scrollNext).toHaveBeenCalledTimes(1);
    });

    it("캐러셀이 다른 장을 고르면 장 표시가 그 장으로 바뀐다", () => {
      render(
        <PagedCarousel label="베스트 순위" itemName="목록">
          {slides(3)}
        </PagedCarousel>,
      );

      act(() => fakeApi.select(1));

      expect(screen.getByText("/ 3", { exact: false })).toHaveTextContent("2 / 3");
    });
  });

  describe("자동 넘김", () => {
    const renderBanner = () =>
      render(
        <PagedCarousel label="기획전" itemName="기획전" autoplay padIndex>
          {slides(3)}
        </PagedCarousel>,
      );

    it("autoplay면 5초마다 다음 장으로 넘긴다", () => {
      renderBanner();

      advance(5000);
      expect(fakeApi.scrollNext).toHaveBeenCalledTimes(1);
      advance(5000);
      expect(fakeApi.scrollNext).toHaveBeenCalledTimes(2);
    });

    it("손으로 넘겨 장이 바뀌면 타이머가 처음부터 다시 센다", () => {
      renderBanner();
      advance(3000);

      act(() => fakeApi.select(2));
      advance(3000);
      expect(fakeApi.scrollNext).not.toHaveBeenCalled();

      advance(2000);
      expect(fakeApi.scrollNext).toHaveBeenCalledTimes(1);
    });

    it("일시정지를 누르면 버튼 이름이 '자동 넘김 시작'으로 바뀌고 더 넘기지 않는다", async () => {
      renderBanner();
      const u = user();

      await u.click(screen.getByRole("button", { name: "자동 넘김 멈추기" }));
      // 버튼을 누르면 포커스가 캐러셀 안에 남으므로, 밖으로 빼서 "일시정지 때문에" 멈췄는지만 본다
      await u.click(document.body);
      advance(10000);

      expect(screen.getByRole("button", { name: "자동 넘김 시작" })).toBeInTheDocument();
      expect(fakeApi.scrollNext).not.toHaveBeenCalled();
    });

    it("동작 줄이기가 켜져 있으면 처음부터 '자동 넘김 시작'이고 넘기지 않는다", () => {
      mockMatchMedia(true);
      renderBanner();

      advance(10000);

      expect(screen.getByRole("button", { name: "자동 넘김 시작" })).toBeInTheDocument();
      expect(fakeApi.scrollNext).not.toHaveBeenCalled();
    });

    it("동작 줄이기가 켜져 있어도 사용자가 시작을 누르면 넘긴다", async () => {
      mockMatchMedia(true);
      renderBanner();
      const u = user();

      await u.click(screen.getByRole("button", { name: "자동 넘김 시작" }));
      await u.click(document.body);
      advance(5000);

      expect(screen.getByRole("button", { name: "자동 넘김 멈추기" })).toBeInTheDocument();
      expect(fakeApi.scrollNext).toHaveBeenCalledTimes(1);
    });

    it("마우스가 올라가 있으면 넘기지 않고, 떠나면 다시 넘긴다", async () => {
      renderBanner();
      const u = user();
      const region = screen.getByRole("region", { name: "기획전" });

      await u.hover(region);
      advance(10000);
      expect(fakeApi.scrollNext).not.toHaveBeenCalled();

      await u.unhover(region);
      advance(5000);
      expect(fakeApi.scrollNext).toHaveBeenCalledTimes(1);
    });

    it("키보드 포커스가 안에 있으면 안에서 옮겨 다녀도 넘기지 않고, 밖으로 나가면 다시 넘긴다", async () => {
      render(
        <>
          <PagedCarousel label="기획전" itemName="기획전" autoplay>
            {slides(3)}
          </PagedCarousel>
          <button>바깥 버튼</button>
        </>,
      );
      const u = user();

      await u.tab(); // 이전 기획전
      await u.tab(); // 다음 기획전 (캐러셀 안에서 이동)
      expect(screen.getByRole("button", { name: "다음 기획전" })).toHaveFocus();
      advance(10000);
      expect(fakeApi.scrollNext).not.toHaveBeenCalled();

      await u.tab(); // 자동 넘김 멈추기
      await u.tab(); // 바깥 버튼
      expect(screen.getByRole("button", { name: "바깥 버튼" })).toHaveFocus();
      advance(5000);
      expect(fakeApi.scrollNext).toHaveBeenCalledTimes(1);
    });

    it("재생 중에는 장 표시를 읽지 않고(aria-live=off), 멈추면 읽는다(polite)", async () => {
      renderBanner();
      const counter = () => screen.getByText("/ 03", { exact: false });
      expect(counter()).toHaveAttribute("aria-live", "off");

      const u = user();
      await u.click(screen.getByRole("button", { name: "자동 넘김 멈추기" }));
      await u.click(document.body);

      expect(counter()).toHaveAttribute("aria-live", "polite");
    });
  });
});
