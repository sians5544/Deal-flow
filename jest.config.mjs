import nextJest from "next/jest.js";

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
};

export default createJestConfig(config);
