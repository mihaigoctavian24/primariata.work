import { buildCalendarGrid, getMonthOffset } from "./calendar-utils";

describe("getMonthOffset", () => {
  it("returns 3 for January 2026 (Thursday → Mon-start offset 3)", () => {
    expect(getMonthOffset(2026, 0)).toBe(3);
  });

  it("returns 6 for February 2026 (Sunday → Mon-start offset 6)", () => {
    expect(getMonthOffset(2026, 1)).toBe(6);
  });

  it("returns 6 for March 2026 (Sunday → Mon-start offset 6)", () => {
    expect(getMonthOffset(2026, 2)).toBe(6);
  });

  it("returns 0 for a Monday start (no offset)", () => {
    // January 2018 starts on Monday
    expect(getMonthOffset(2018, 0)).toBe(0);
  });
});

describe("buildCalendarGrid", () => {
  it("January 2026: starts on Thursday (offset 3), 31 days, grid length 35", () => {
    const grid = buildCalendarGrid(2026, 0);
    expect(grid.length).toBe(35);
    expect(grid[0]).toBeNull();
    expect(grid[1]).toBeNull();
    expect(grid[2]).toBeNull();
    expect(grid[3]).toBe(1);
  });

  it("February 2026: starts on Sunday (offset 6), 28 days, grid length 35", () => {
    const grid = buildCalendarGrid(2026, 1);
    expect(grid.length).toBe(35);
    expect(grid[6]).toBe(1); // first non-null at index 6
    expect(grid[6 + 27]).toBe(28); // last day
  });

  it("March 2026: starts on Sunday (offset 6), 31 days, grid length 42", () => {
    const grid = buildCalendarGrid(2026, 2);
    expect(grid.length).toBe(42);
    expect(grid[6]).toBe(1);
    expect(grid[6 + 30]).toBe(31);
  });

  it("grid length is always divisible by 7", () => {
    for (let month = 0; month < 12; month++) {
      const grid = buildCalendarGrid(2026, month);
      expect(grid.length % 7).toBe(0);
    }
  });

  it("first non-null value is always 1", () => {
    for (let month = 0; month < 12; month++) {
      const grid = buildCalendarGrid(2026, month);
      const firstNonNull = grid.find((d) => d !== null);
      expect(firstNonNull).toBe(1);
    }
  });
});
