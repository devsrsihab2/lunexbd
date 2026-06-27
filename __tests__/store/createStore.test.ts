/**
 * createStore.test.ts — store/createStore.ts
 * Tests the generic reactive store factory.
 */
import { createStore } from "@/store/createStore";

describe("createStore", () => {
  it("should return initial state from getSnapshot", () => {
    const store = createStore({ count: 0 });
    expect(store.getSnapshot()).toEqual({ count: 0 });
  });

  it("should update state with setState", () => {
    const store = createStore({ count: 0 });
    store.setState({ count: 5 });
    expect(store.getSnapshot()).toEqual({ count: 5 });
  });

  it("should notify subscribed listeners on setState", () => {
    const store = createStore({ count: 0 });
    const listener = jest.fn();
    store.subscribe(listener);
    store.setState({ count: 1 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("should notify multiple listeners", () => {
    const store = createStore({ value: "a" });
    const l1 = jest.fn();
    const l2 = jest.fn();
    store.subscribe(l1);
    store.subscribe(l2);
    store.setState({ value: "b" });
    expect(l1).toHaveBeenCalledTimes(1);
    expect(l2).toHaveBeenCalledTimes(1);
  });

  it("should stop notifying after unsubscribe", () => {
    const store = createStore({ x: 1 });
    const listener = jest.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.setState({ x: 2 });
    expect(listener).not.toHaveBeenCalled();
  });
});
