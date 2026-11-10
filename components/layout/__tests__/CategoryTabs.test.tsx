import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategoryTabs from "../CategoryTabs";

// Next.js 라우터는 테스트 환경에 없으므로 현재 경로·쿼리와 push를 가짜로 정합니다.
const push = jest.fn();
let pathname = "/best";
let search = "";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => pathname,
  useSearchParams: () => new URLSearchParams(search),
}));

const setLocation = (path: string, query = "") => {
  pathname = path;
  search = query;
};

describe("CategoryTabs", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("목록 페이지에서 탭을 누르면 같은 페이지에 카테고리를 붙인다", async () => {
    const user = userEvent.setup();
    setLocation("/best");
    render(<CategoryTabs />);

    await user.click(screen.getByRole("button", { name: "식품" }));

    expect(push).toHaveBeenCalledWith("/best?category=food");
  });

  it("목록이 아닌 페이지(상세)에서 탭을 누르면 베스트로 이동한다", async () => {
    const user = userEvent.setup();
    setLocation("/deals/1");
    render(<CategoryTabs />);

    await user.click(screen.getByRole("button", { name: "패션" }));

    expect(push).toHaveBeenCalledWith("/best?category=fashion");
  });

  it("오늘의 딜에서 카테고리를 바꾸면 탭은 유지하고 1페이지로 돌아간다", async () => {
    const user = userEvent.setup();
    setLocation("/today", "tab=closing&page=3");
    render(<CategoryTabs />);

    await user.click(screen.getByRole("button", { name: "가전" }));

    expect(push).toHaveBeenCalledWith(
      "/today?tab=closing&page=1&category=tech",
    );
  });

  it("'전체'를 누르면 카테고리 조건을 지운다", async () => {
    const user = userEvent.setup();
    setLocation("/best", "category=food");
    render(<CategoryTabs />);

    await user.click(screen.getByRole("button", { name: "전체" }));

    expect(push).toHaveBeenCalledWith("/best");
  });

  it("현재 카테고리 탭을 선택된 상태로 표시한다", () => {
    setLocation("/best", "category=food");
    render(<CategoryTabs />);

    expect(screen.getByRole("button", { name: "식품" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "전체" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
