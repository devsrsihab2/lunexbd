import {
  getAddresses,
  saveAddress,
  updateAddress,
  deleteAddress,
  uploadAvatar,
  deleteAvatar,
} from "@/services/api/Addresses.api";
import { apiFetch } from "@/services/api/http";

jest.mock("@/services/api/http", () => ({
  apiFetch: jest.fn(),
}));

describe("Addresses API service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch addresses", async () => {
    (apiFetch as jest.Mock).mockResolvedValueOnce({ success: true, data: [] });
    const response = await getAddresses();
    expect(response.success).toBe(true);
    expect(apiFetch).toHaveBeenCalledWith("/lunex/v1/me/addresses", {
      auth: true,
      cache: "no-store",
    });
  });

  it("should save address", async () => {
    const payload = {
      type: "home" as const,
      addressLine: "123 Street",
      district: "Dhaka",
      thana: "Gulshan",
      postalCode: "1212",
      country: "Bangladesh",
    };
    (apiFetch as jest.Mock).mockResolvedValueOnce({ success: true, data: [payload] });
    const response = await saveAddress(payload);
    expect(response.success).toBe(true);
    expect(apiFetch).toHaveBeenCalledWith("/lunex/v1/me/addresses", {
      method: "POST",
      auth: true,
      body: payload,
    });
  });

  it("should update address", async () => {
    const payload = {
      addressLine: "New Street",
    };
    (apiFetch as jest.Mock).mockResolvedValueOnce({ success: true, data: [] });
    const response = await updateAddress("office", payload);
    expect(response.success).toBe(true);
    expect(apiFetch).toHaveBeenCalledWith("/lunex/v1/me/addresses/office", {
      method: "PUT",
      auth: true,
      body: payload,
    });
  });

  it("should delete address", async () => {
    (apiFetch as jest.Mock).mockResolvedValueOnce({ success: true, data: [] });
    const response = await deleteAddress("home");
    expect(response.success).toBe(true);
    expect(apiFetch).toHaveBeenCalledWith("/lunex/v1/me/addresses/home", {
      method: "DELETE",
      auth: true,
    });
  });

  it("should delete avatar", async () => {
    (apiFetch as jest.Mock).mockResolvedValueOnce({ success: true, data: { deleted: true } });
    const response = await deleteAvatar();
    expect(response.success).toBe(true);
    expect(apiFetch).toHaveBeenCalledWith("/lunex/v1/me/avatar", {
      method: "DELETE",
      auth: true,
    });
  });

  it("should upload avatar using fetch", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce({
      json: async () => ({ success: true, data: { avatarId: 10, avatarUrl: "test-url" } }),
    });
    global.fetch = fetchMock;

    const file = new File(["dummy content"], "avatar.png", { type: "image/png" });
    const response = await uploadAvatar(file);

    expect(response.success).toBe(true);
    expect(fetchMock).toHaveBeenCalled();
  });
});
