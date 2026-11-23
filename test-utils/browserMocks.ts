// jsdom에 없는 브라우저 API를 테스트용으로 채웁니다.
// Design Ref: §8.4 — 캐러셀 테스트에서 불러 씁니다.

// window.matchMedia: 모든 미디어 쿼리에 matches 값을 돌려줍니다.
// PagedCarousel은 "(prefers-reduced-motion: reduce)"를 읽으므로, true면 동작 줄이기가 켜진 상태입니다.
export const mockMatchMedia = (matches = false) => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};
