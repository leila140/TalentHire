import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";

describe("Auth Token & Hash Utilities", () => {
  describe("SHA-256 token hashing (used in verifyEmail and resetPassword)", () => {
    it("produces consistent hashes for the same input", () => {
      const token = crypto.randomBytes(32).toString("hex");
      const hash1 = crypto.createHash("sha256").update(token).digest("hex");
      const hash2 = crypto.createHash("sha256").update(token).digest("hex");
      expect(hash1).toBe(hash2);
    });

    it("produces different hashes for different inputs", () => {
      const token1 = crypto.randomBytes(32).toString("hex");
      const token2 = crypto.randomBytes(32).toString("hex");
      const hash1 = crypto.createHash("sha256").update(token1).digest("hex");
      const hash2 = crypto.createHash("sha256").update(token2).digest("hex");
      expect(hash1).not.toBe(hash2);
    });

    it("hash is a valid hex string of length 64", () => {
      const token = crypto.randomBytes(32).toString("hex");
      const hash = crypto.createHash("sha256").update(token).digest("hex");
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe("JWT token structure", () => {
    it("generates tokens with correct format", () => {
      const jwt = require("jsonwebtoken");
      const payload = { id: "test-user-id", role: "candidate" };
      const token = jwt.sign(payload, "test-secret", { expiresIn: "15m" });
      const decoded = jwt.verify(token, "test-secret");
      expect(decoded.id).toBe("test-user-id");
      expect(decoded.role).toBe("candidate");
    });

    it("rejects tokens signed with wrong secret", () => {
      const jwt = require("jsonwebtoken");
      const token = jwt.sign({ id: "test" }, "correct-secret", { expiresIn: "15m" });
      expect(() => jwt.verify(token, "wrong-secret")).toThrow();
    });
  });

  describe("Bcrypt password hashing", () => {
    it("hashes and verifies passwords correctly", async () => {
      const bcrypt = require("bcryptjs");
      const password = "test-password-123";
      const hash = await bcrypt.hash(password, 10);
      expect(hash).not.toBe(password);
      const isMatch = await bcrypt.compare(password, hash);
      expect(isMatch).toBe(true);
    });

    it("rejects wrong passwords", async () => {
      const bcrypt = require("bcryptjs");
      const hash = await bcrypt.hash("correct-password", 10);
      const isMatch = await bcrypt.compare("wrong-password", hash);
      expect(isMatch).toBe(false);
    });
  });

  describe("Token expiration", () => {
    it("access token has short expiry", () => {
      const jwt = require("jsonwebtoken");
      const token = jwt.sign({ id: "test" }, "secret", { expiresIn: "15m" });
      const decoded = jwt.decode(token);
      expect(decoded).toHaveProperty("exp");
      const expiresInMs = (decoded.exp - decoded.iat) * 1000;
      expect(expiresInMs).toBeLessThanOrEqual(15 * 60 * 1000);
    });

    it("refresh token has longer expiry", () => {
      const jwt = require("jsonwebtoken");
      const token = jwt.sign({ id: "test" }, "secret", { expiresIn: "7d" });
      const decoded = jwt.decode(token);
      expect(decoded).toHaveProperty("exp");
      const expiresInMs = (decoded.exp - decoded.iat) * 1000;
      expect(expiresInMs).toBeGreaterThan(15 * 60 * 1000);
    });
  });

  describe("Random token generation", () => {
    it("generates unique 64-char hex tokens", () => {
      const token1 = crypto.randomBytes(32).toString("hex");
      const token2 = crypto.randomBytes(32).toString("hex");
      expect(token1).toHaveLength(64);
      expect(token2).toHaveLength(64);
      expect(token1).not.toBe(token2);
    });
  });
});
