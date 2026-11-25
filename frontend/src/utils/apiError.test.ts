import axios from "axios";
import { describe, expect, it } from "vitest";
import { getApiErrorMessage } from "./apiError";

describe("getApiErrorMessage", () => {
  it("reads message from axios response body", () => {
    const error = new axios.AxiosError("Request failed");
    error.response = {
      data: { message: "Invalid credentials" },
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config: { headers: {} as never },
    };

    expect(getApiErrorMessage(error, "fallback")).toBe("Invalid credentials");
  });

  it("falls back when response has no message", () => {
    expect(getApiErrorMessage(new Error("boom"), "fallback")).toBe("boom");
    expect(getApiErrorMessage({}, "fallback")).toBe("fallback");
  });
});
