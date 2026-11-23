import { formatEndLabel, formatKstTime } from "@/lib/dealTime";

// 한국 시각 2026-11-23 14:00. Jest는 UTC로 고정되어 있어 +09:00을 붙여 한국 시각을 만든다.
const NOW = new Date("2026-11-23T14:00:00+09:00");
const after = (ms: number) => new Date(NOW.getTime() + ms).toISOString();
const MIN = 60 * 1000;

describe("formatEndLabel", () => {
  it("59분 59초 남으면 '곧 마감 · HH:MM'이고 urgent다", () => {
    expect(formatEndLabel(after(60 * MIN - 1000), NOW)).toEqual({
      text: "곧 마감 · 14:59",
      urgent: true,
    });
  });

  it("정확히 60분 남으면 urgent가 아니다", () => {
    expect(formatEndLabel(after(60 * MIN), NOW)).toEqual({
      text: "오늘 15:00 마감",
      urgent: false,
    });
  });

  it("남은 시간이 0이면 '마감'이다", () => {
    expect(formatEndLabel(NOW.toISOString(), NOW)).toEqual({
      text: "마감",
      urgent: false,
    });
  });

  it("마감이 지났으면 '마감'이다", () => {
    expect(formatEndLabel(after(-3 * 60 * MIN), NOW)).toEqual({
      text: "마감",
      urgent: false,
    });
  });

  it("같은 한국 날짜면 '오늘 HH:MM 마감'이다", () => {
    expect(formatEndLabel("2026-11-23T18:00:00+09:00", NOW).text).toBe(
      "오늘 18:00 마감",
    );
  });

  it("다음 한국 날짜면 '내일 HH:MM 마감'이다", () => {
    expect(formatEndLabel("2026-11-24T12:00:00+09:00", NOW).text).toBe(
      "내일 12:00 마감",
    );
  });

  it("이틀 뒤면 'M월 D일 HH:MM 마감'이다", () => {
    expect(formatEndLabel("2026-11-25T12:00:00+09:00", NOW).text).toBe(
      "11월 25일 12:00 마감",
    );
  });

  // UTC로는 같은 23일이지만 한국으로는 24일 00:30이다.
  it("UTC 날짜는 같아도 한국 날짜가 다음 날이면 '내일'이다", () => {
    const now = new Date("2026-11-23T14:00:00Z"); // 한국 23일 23:00
    expect(formatEndLabel("2026-11-23T15:30:00Z", now).text).toBe(
      "내일 00:30 마감",
    );
  });

  // UTC로는 23일 → 24일이지만 한국으로는 둘 다 24일이다.
  it("UTC 날짜는 달라도 한국 날짜가 같으면 '오늘'이다", () => {
    const now = new Date("2026-11-23T15:30:00Z"); // 한국 24일 00:30
    expect(formatEndLabel("2026-11-24T14:00:00Z", now).text).toBe(
      "오늘 23:00 마감",
    );
  });

  // 11-23 고친 버그: 날짜가 아닌 문자열이면 계산이 모두 NaN이 되어 "NaN월 NaN일 NaN:NaN 마감"이 화면에 나왔다.
  it("시각 값이 잘못되면 '마감 시간 미정'을 돌려준다", () => {
    expect(formatEndLabel("not-a-date", NOW)).toEqual({
      text: "마감 시간 미정",
      urgent: false,
    });
  });
});

describe("formatKstTime", () => {
  it("서버가 UTC여도 한국 시각 HH:MM을 돌려준다", () => {
    expect(formatKstTime("2026-11-23T09:00:00.000Z")).toBe("18:00");
  });

  it("한 자리 시·분은 앞에 0을 붙인다", () => {
    expect(formatKstTime("2026-11-23T00:05:00+09:00")).toBe("00:05");
  });

  // 11-23 고친 버그: 잘못된 문자열이면 "NaN:NaN"이 나왔다 (곧 오픈 시각 표시에도 쓰인다).
  it("시각 값이 잘못되면 '--:--'를 돌려준다", () => {
    expect(formatKstTime("not-a-date")).toBe("--:--");
  });
});
