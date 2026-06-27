import { validators } from "@/utils/validators";

describe("validators", () => {
  describe("email", () => {
    it("should return true for valid email addresses", () => {
      expect(validators.email("test@example.com")).toBe(true);
      expect(validators.email("user.name+tag@domain.co.uk")).toBe(true);
    });

    it("should return false for invalid email addresses", () => {
      expect(validators.email("testexample.com")).toBe(false);
      expect(validators.email("test@")).toBe(false);
      expect(validators.email("test@domain")).toBe(false);
    });
  });

  describe("phone", () => {
    it("should return true for valid phone numbers", () => {
      expect(validators.phone("12345678")).toBe(true);
      expect(validators.phone("+8801700000000")).toBe(true);
      expect(validators.phone("01711-223344")).toBe(true);
    });

    it("should return false for invalid phone numbers", () => {
      expect(validators.phone("12345")).toBe(false); // Too short
      expect(validators.phone("abcdefgh")).toBe(false); // Alphabetic
      expect(validators.phone("123456789012345678901")).toBe(false); // Too long
    });
  });

  describe("required", () => {
    it("should return true for non-empty trimmed strings", () => {
      expect(validators.required("hello")).toBe(true);
      expect(validators.required("  hello  ")).toBe(true);
    });

    it("should return false for empty or whitespace-only strings", () => {
      expect(validators.required("")).toBe(false);
      expect(validators.required("   ")).toBe(false);
      expect(validators.required(undefined)).toBe(false);
    });
  });
});
