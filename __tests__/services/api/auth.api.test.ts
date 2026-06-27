import {
  login,
  register,
  requestPasswordReset,
  logout,
  getMe,
  updateMe,
  updatePassword,
} from "@/services/api/auth.api";
import { storefrontProxy } from "@/services/api/http";

jest.mock("@/services/api/http", () => ({
  storefrontProxy: jest.fn(),
}));

describe("auth.api service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle login request", async () => {
    const payload = { username: "user", password: "pwd" };
    await login(payload);
    expect(storefrontProxy).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: payload,
    });
  });

  it("should handle register request", async () => {
    const payload = { username: "user", email: "a@b.com" };
    await register(payload);
    expect(storefrontProxy).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: payload,
    });
  });

  it("should request password reset", async () => {
    const payload = { email: "a@b.com" };
    await requestPasswordReset(payload);
    expect(storefrontProxy).toHaveBeenCalledWith("/auth/forgot-password", {
      method: "POST",
      body: payload,
    });
  });

  it("should logout user", async () => {
    await logout();
    expect(storefrontProxy).toHaveBeenCalledWith("/auth/logout", {
      method: "POST",
      auth: true,
    });
  });

  it("should get me", async () => {
    await getMe();
    expect(storefrontProxy).toHaveBeenCalledWith("/me", {
      cache: "no-store",
      auth: true,
    });
  });

  it("should update profile", async () => {
    const payload = { firstName: "Test" };
    await updateMe(payload);
    expect(storefrontProxy).toHaveBeenCalledWith("/me", {
      method: "PUT",
      body: payload,
      auth: true,
    });
  });

  it("should update password", async () => {
    const payload = { currentPassword: "1", password: "2", confirmPassword: "2" };
    await updatePassword(payload);
    expect(storefrontProxy).toHaveBeenCalledWith("/me/password", {
      method: "POST",
      body: payload,
      auth: true,
    });
  });
});
