import "@testing-library/jest-dom";

// Polyfill or mock fetch if it is not present in the environment
if (!global.fetch) {
  // @ts-ignore
  global.fetch = jest.fn();
}

// Mock localStorage
const localStorageMock = (function () {
  let store: Record<string, string> = {};
  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = String(value);
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock next/image globally to prevent non-boolean attributes forwarding warnings
jest.mock("next/image", () => {
  const React = require("react");
  return function MockImage({ src, alt, priority, fill, unoptimized, ...props }: any) {
    return React.createElement("img", {
      src,
      alt,
      "data-priority": priority ? "true" : undefined,
      "data-fill": fill ? "true" : undefined,
      "data-unoptimized": unoptimized ? "true" : undefined,
      ...props,
    });
  };
});
