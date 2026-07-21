import { vi, beforeAll, afterAll } from "vitest";

vi.mock("@config/env", () => ({
  env: {
    nodeEnv: "test",
    port: 3001,
    clientUrl: "http://localhost:5173",
    jwt: {
      accessSecret: "test-access-secret",
      refreshSecret: "test-refresh-secret",
      accessExpires: "15m",
      refreshExpires: "7d",
    },
    google: { clientId: "test-google-client-id" },
    openai: { apiKey: "", model: "gpt-4o-mini" },
    smtp: { host: "", port: 587, user: "", pass: "" },
  },
}));

vi.mock("@config/email", () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
  sendResetPasswordEmail: vi.fn().mockResolvedValue(undefined),
  sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
  sendInterviewScheduledEmail: vi.fn().mockResolvedValue(undefined),
  sendNewApplicationEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@config/db", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("mongoose", async () => {
  const actual = (await vi.importActual("mongoose")) as Record<string, any>;
  return {
    ...actual,
    default: {
      ...actual.default,
      connect: vi.fn().mockResolvedValue(undefined),
    },
  };
});
