import { sanitizeHtml } from "@/utils/sanitizeHtml";

describe("sanitizeHtml", () => {
  it("should return empty string when input is undefined/empty", () => {
    expect(sanitizeHtml()).toBe("");
    expect(sanitizeHtml("")).toBe("");
  });

  it("should remove script tags completely", () => {
    const input = '<div>Hello <script>alert("hack");</script>World</div>';
    expect(sanitizeHtml(input)).toBe("<div>Hello World</div>");
  });

  it("should remove on* event handler attributes", () => {
    const input = '<button onclick="doSomething()" onload=\'onload()\'>Click me</button>';
    expect(sanitizeHtml(input)).toBe("<button>Click me</button>");
  });

  it("should leave normal HTML tags intact", () => {
    const input = '<div class="test">Hello <strong>World</strong></div>';
    expect(sanitizeHtml(input)).toBe(input);
  });
});
