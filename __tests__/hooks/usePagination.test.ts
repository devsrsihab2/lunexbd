/**
 * usePagination.test.ts
 * Tests the usePagination utility hook:
 * - Correct page state calculation
 * - hasNext / hasPrevious boundary conditions
 * - nextPage / previousPage clamping
 */
import { usePagination } from "@/hooks/usePagination";

describe("usePagination hook", () => {
  it("returns correct state for first page", () => {
    const result = usePagination(1, 5);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(5);
    expect(result.hasNext).toBe(true);
    expect(result.hasPrevious).toBe(false);
    expect(result.previousPage).toBe(1); // clamped to 1
    expect(result.nextPage).toBe(2);
  });

  it("returns correct state for middle page", () => {
    const result = usePagination(3, 5);
    expect(result.page).toBe(3);
    expect(result.hasNext).toBe(true);
    expect(result.hasPrevious).toBe(true);
    expect(result.previousPage).toBe(2);
    expect(result.nextPage).toBe(4);
  });

  it("returns correct state for last page", () => {
    const result = usePagination(5, 5);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrevious).toBe(true);
    expect(result.previousPage).toBe(4);
    expect(result.nextPage).toBe(5); // clamped to totalPages
  });

  it("returns correct state for single page", () => {
    const result = usePagination(1, 1);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrevious).toBe(false);
    expect(result.previousPage).toBe(1);
    expect(result.nextPage).toBe(1);
  });

  it("uses defaults (page=1, totalPages=1) when no args provided", () => {
    const result = usePagination();
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrevious).toBe(false);
  });
});
