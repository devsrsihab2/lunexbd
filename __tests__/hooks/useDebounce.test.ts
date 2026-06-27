/**
 * useDebounce.test.ts — hooks/useDebounce.ts
 * Tests the debounce hook using fake timers.
 */
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "@/hooks/useDebounce";

describe("useDebounce hook", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should return the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("should NOT update value before the delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "initial" } }
    );

    rerender({ value: "updated" });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe("initial");
  });

  it("should update value after the delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "initial" } }
    );

    rerender({ value: "updated" });
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe("updated");
  });

  it("should reset the timer when value changes rapidly", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } }
    );

    rerender({ value: "b" });
    act(() => { jest.advanceTimersByTime(200); });
    rerender({ value: "c" });
    act(() => { jest.advanceTimersByTime(200); });
    // Still shouldn't have debounced since we keep resetting
    expect(result.current).toBe("a");

    act(() => { jest.advanceTimersByTime(300); });
    expect(result.current).toBe("c");
  });

  it("should use default delay of 350ms when none specified", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: "start" } }
    );

    rerender({ value: "end" });
    act(() => { jest.advanceTimersByTime(349); });
    expect(result.current).toBe("start");

    act(() => { jest.advanceTimersByTime(1); });
    expect(result.current).toBe("end");
  });
});
