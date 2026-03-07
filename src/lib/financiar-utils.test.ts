import { aggregateByMonth, groupByDayOfWeek, groupByMetoda } from "./financiar-utils";
import type { PlatiRow } from "./financiar-utils";

const makePayment = (overrides: Partial<PlatiRow> = {}): PlatiRow => ({
  suma: 100,
  status: "success",
  metoda_plata: "card",
  created_at: "2026-03-15T10:00:00Z",
  ...overrides,
});

describe("aggregateByMonth", () => {
  it("returns [] for empty array", () => {
    expect(aggregateByMonth([])).toEqual([]);
  });

  it("excludes failed payments (only success counted)", () => {
    const plati: PlatiRow[] = [
      makePayment({ status: "failed" }),
      makePayment({ status: "pending" }),
      makePayment({ status: "refunded" }),
    ];
    expect(aggregateByMonth(plati)).toEqual([]);
  });

  it("aggregates 2 success payments in March into one entry", () => {
    const plati: PlatiRow[] = [
      makePayment({ suma: 200, status: "success", created_at: "2026-03-01T10:00:00Z" }),
      makePayment({ suma: 100, status: "success", created_at: "2026-03-20T10:00:00Z" }),
    ];
    const result = aggregateByMonth(plati);
    expect(result).toHaveLength(1);
    expect(result[0].month).toBe("Mar");
    expect(result[0].colectat).toBe(300);
    expect(result[0].target).toBeCloseTo(300 * 1.08, 2);
  });

  it("groups payments across different months", () => {
    const plati: PlatiRow[] = [
      makePayment({ suma: 100, created_at: "2026-01-15T00:00:00Z" }),
      makePayment({ suma: 200, created_at: "2026-02-15T00:00:00Z" }),
    ];
    const result = aggregateByMonth(plati);
    expect(result).toHaveLength(2);
    const months = result.map((r) => r.month);
    expect(months).toContain("Ian");
    expect(months).toContain("Feb");
  });
});

describe("groupByDayOfWeek", () => {
  it("returns array of 7 items all zero for empty array", () => {
    const result = groupByDayOfWeek([]);
    expect(result).toHaveLength(7);
    result.forEach((item) => expect(item.volume).toBe(0));
  });

  it("days are ordered Mon-Dum", () => {
    const result = groupByDayOfWeek([]);
    expect(result[0].day).toBe("Lun");
    expect(result[6].day).toBe("Dum");
  });

  it("counts success payments only by day", () => {
    const plati: PlatiRow[] = [
      // 2026-03-16 is a Monday
      makePayment({ status: "success", created_at: "2026-03-16T10:00:00Z" }),
      makePayment({ status: "success", created_at: "2026-03-16T12:00:00Z" }),
      makePayment({ status: "failed", created_at: "2026-03-16T14:00:00Z" }),
    ];
    const result = groupByDayOfWeek(plati);
    // Monday is index 0
    expect(result[0].volume).toBe(2);
    // All other days should be 0
    for (let i = 1; i < 7; i++) {
      expect(result[i].volume).toBe(0);
    }
  });
});

describe("groupByMetoda", () => {
  it("returns {card: 0, transfer: 0, numerar: 0} for empty array", () => {
    expect(groupByMetoda([])).toEqual({ card: 0, transfer: 0, numerar: 0 });
  });

  it("counts only success payments", () => {
    const plati: PlatiRow[] = [
      makePayment({ metoda_plata: "card", status: "success" }),
      makePayment({ metoda_plata: "card", status: "failed" }),
      makePayment({ metoda_plata: "transfer", status: "success" }),
      makePayment({ metoda_plata: "numerar", status: "success" }),
    ];
    expect(groupByMetoda(plati)).toEqual({ card: 1, transfer: 1, numerar: 1 });
  });

  it("ignores null metoda_plata", () => {
    const plati: PlatiRow[] = [makePayment({ metoda_plata: null, status: "success" })];
    expect(groupByMetoda(plati)).toEqual({ card: 0, transfer: 0, numerar: 0 });
  });
});
