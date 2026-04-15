import { afterEach, describe, expect, it, vi } from "vitest";
import { registerUser, verifyFace } from "@/services/api";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

afterEach(() => {
  fetchMock.mockReset();
});

describe("api service", () => {
  it("registerUser sends expected payload fields", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, userId: "u1", message: "registered" }),
    });

    await registerUser("img-base64", "01700000000", "M-100");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/register$/),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: "img-base64",
          phoneNumber: "01700000000",
          machineCode: "M-100",
          phone: "01700000000",
          employeeId: "M-100",
        }),
      }),
    );
  });

  it("registerUser throws backend error message", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Duplicate user" }),
    });

    await expect(registerUser("img")).rejects.toThrow("Duplicate user");
  });

  it("verifyFace sends image and returns response", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        matched: true,
        userId: "u1",
        userName: "John Doe",
        action: "check-in",
        message: "Attendance marked",
      }),
    });

    const res = await verifyFace("img-base64");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/verify$/),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ image: "img-base64" }),
      }),
    );
    expect(res.matched).toBe(true);
  });
});
