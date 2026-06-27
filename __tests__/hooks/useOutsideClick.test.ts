/**
 * useOutsideClick.test.ts
 *
 * Tests the useOutsideClick hook:
 * - Listens for mousedown event on document
 * - Fires callback when click is outside the ref element
 * - Does not fire callback when click is inside the ref element
 */
import { renderHook } from "@testing-library/react";
import { useOutsideClick } from "@/hooks/useOutsideClick";

describe("useOutsideClick hook", () => {
  let map: Record<string, any> = {};

  beforeEach(() => {
    map = {};
    document.addEventListener = jest.fn((event, cb) => {
      map[event] = cb;
    });
    document.removeEventListener = jest.fn((event) => {
      delete map[event];
    });
  });

  it("registers event listener on mount and unregisters on unmount", () => {
    const ref = { current: document.createElement("div") };
    const onOutsideClick = jest.fn();
    const { unmount } = renderHook(() => useOutsideClick(ref, onOutsideClick));

    expect(document.addEventListener).toHaveBeenCalledWith("mousedown", expect.any(Function));

    unmount();
    expect(document.removeEventListener).toHaveBeenCalledWith("mousedown", expect.any(Function));
  });

  it("triggers callback when click is outside target element", () => {
    const insideEl = document.createElement("div");
    const ref = { current: insideEl };
    const onOutsideClick = jest.fn();

    renderHook(() => useOutsideClick(ref, onOutsideClick));

    const outsideEl = document.createElement("span");
    const clickEvent = { target: outsideEl } as unknown as MouseEvent;

    // Simulate click outside
    map["mousedown"](clickEvent);
    expect(onOutsideClick).toHaveBeenCalled();
  });

  it("does not trigger callback when click is inside target element", () => {
    const insideEl = document.createElement("div");
    const ref = { current: insideEl };
    const onOutsideClick = jest.fn();

    renderHook(() => useOutsideClick(ref, onOutsideClick));

    const clickEvent = { target: insideEl } as unknown as MouseEvent;

    // Simulate click inside
    map["mousedown"](clickEvent);
    expect(onOutsideClick).not.toHaveBeenCalled();
  });
});
