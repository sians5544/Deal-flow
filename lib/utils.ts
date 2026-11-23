import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 배열을 size개씩 나눕니다. [1..12], 5 → [[1..5], [6..10], [11, 12]]
// 홈의 곧 오픈·베스트를 캐러셀 한 장(5개)씩 묶을 때 씁니다.
export function chunk<T>(items: T[], size: number): T[][] {
  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError(`chunk size는 1 이상의 정수여야 합니다: ${size}`)
  }
  const pages: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size))
  }
  return pages
}
