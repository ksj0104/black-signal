/**
 * 최소 Node 빌트인 타입 선언 — @types/node 의존성 추가 없이 테스트 전용
 * (`scenes.test.ts` 의 배경 에셋 존재 확인)에서만 쓰는 API 만 선언한다.
 * Vitest 는 런타임에 esbuild 를 통해 node: 임포트를 그대로 해석하므로 실행엔
 * 문제가 없고, 이 파일은 `tsc --noEmit` 타입체크만을 위한 최소 앰비언트 선언이다.
 */
declare module 'node:fs' {
  export function existsSync(path: string): boolean;
}

declare module 'node:path' {
  export function join(...parts: string[]): string;
}

declare const process: { cwd(): string };
