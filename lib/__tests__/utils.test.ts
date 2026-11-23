import { chunk } from "@/lib/utils";

describe("chunk", () => {
  it("12개를 5개씩 나누면 5·5·2개다", () => {
    const items = Array.from({ length: 12 }, (_, i) => i + 1);

    expect(chunk(items, 5)).toEqual([
      [1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10],
      [11, 12],
    ]);
  });

  it("빈 배열이면 빈 배열이다", () => {
    expect(chunk([], 5)).toEqual([]);
  });

  it("size가 0이거나 정수가 아니면 RangeError를 던진다", () => {
    expect(() => chunk([1, 2], 0)).toThrow(RangeError);
    expect(() => chunk([1, 2], 2.5)).toThrow(RangeError);
  });
});
