import nextJest from "next/jest.js";

// 배포 서버(Vercel)와 같은 UTC로 고정합니다. 개발자 PC 시간대(Asia/Seoul 등)에 따라 결과가 달라지지 않게 합니다.
// 워커 프로세스가 만들어지기 전에 설정해야 하므로 설정 파일 맨 위에 둡니다.
process.env.TZ = "UTC";

// next.config와 .env를 읽어 Next.js 앱과 같은 방식(SWC)으로 TS/JSX를 변환합니다.
const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  // 브라우저 흉내(jsdom). 컴포넌트 테스트에 필요합니다.
  testEnvironment: "jsdom",
  // 모든 테스트 파일보다 먼저 실행할 설정 (toBeInTheDocument 같은 matcher 추가)
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // tsconfig의 "@/*" 경로 별칭을 Jest에도 알려줍니다.
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  // .claude/ 아래에는 스킬 평가용 테스트 사본이 있어 실제 테스트로 돌리지 않습니다.
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/.claude/"],
};

export default createJestConfig(config);
