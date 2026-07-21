import { describe, it, expect, vi } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "common.loading": "Loading...",
      };
      return map[key] || key;
    },
  }),
}));

import { timeAgo } from "@/utils/format";
import { SKILL_SUGGESTIONS, EMPLOYMENT_TYPES, WORK_MODES, CURRENCIES } from "@/utils/constants";

describe("timeAgo", () => {
  it("returns 'now' for recent dates", () => {
    const now = new Date().toISOString();
    expect(timeAgo(now)).toBe("now");
  });

  it("returns minutes for dates within the hour", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString();
    expect(timeAgo(fiveMinAgo)).toBe("5m");
  });

  it("returns hours for dates within the day", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600000).toISOString();
    expect(timeAgo(threeHoursAgo)).toBe("3h");
  });

  it("returns days for older dates", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
    expect(timeAgo(twoDaysAgo)).toBe("2d");
  });

  it("returns '1m' for 1 minute ago", () => {
    const oneMinAgo = new Date(Date.now() - 60000).toISOString();
    expect(timeAgo(oneMinAgo)).toBe("1m");
  });

  it("returns '1h' for 1 hour ago", () => {
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    expect(timeAgo(oneHourAgo)).toBe("1h");
  });
});

describe("Constants", () => {
  it("SKILL_SUGGESTIONS has expected skills", () => {
    expect(SKILL_SUGGESTIONS.length).toBeGreaterThan(40);
    expect(SKILL_SUGGESTIONS).toContain("React");
    expect(SKILL_SUGGESTIONS).toContain("TypeScript");
    expect(SKILL_SUGGESTIONS).toContain("Node.js");
    expect(SKILL_SUGGESTIONS).toContain("Python");
    expect(SKILL_SUGGESTIONS).toContain("Docker");
  });

  it("EMPLOYMENT_TYPES has 4 types", () => {
    expect(EMPLOYMENT_TYPES).toHaveLength(4);
    const values = EMPLOYMENT_TYPES.map((t) => t.value);
    expect(values).toEqual(expect.arrayContaining(["full-time", "part-time", "contract", "internship"]));
  });

  it("EMPLOYMENT_TYPES has labels for all types", () => {
    EMPLOYMENT_TYPES.forEach((type) => {
      expect(type.label).toBeTruthy();
      expect(typeof type.label).toBe("string");
    });
  });

  it("WORK_MODES has 3 modes", () => {
    expect(WORK_MODES).toHaveLength(3);
    const values = WORK_MODES.map((m) => m.value);
    expect(values).toEqual(expect.arrayContaining(["remote", "hybrid", "on-site"]));
  });

  it("WORK_MODES has labels for all modes", () => {
    WORK_MODES.forEach((mode) => {
      expect(mode.label).toBeTruthy();
    });
  });

  it("CURRENCIES includes major currencies", () => {
    expect(CURRENCIES).toContain("USD");
    expect(CURRENCIES).toContain("EUR");
    expect(CURRENCIES).toContain("GBP");
  });
});
