import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import "vitest";

/* eslint-disable @typescript-eslint/no-empty-object-type */
declare module "vitest" {
  interface Assertion<T = unknown> extends TestingLibraryMatchers<unknown, T> {}
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<
    unknown,
    unknown
  > {}
}

declare module "@vitest/expect" {
  interface Assertion<T = unknown> extends TestingLibraryMatchers<unknown, T> {}
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<
    unknown,
    unknown
  > {}
}
/* eslint-enable @typescript-eslint/no-empty-object-type */
