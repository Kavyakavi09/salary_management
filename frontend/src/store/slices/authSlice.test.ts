import { describe, expect, it, beforeEach } from "vitest";
import authReducer, {
  clearCredentials,
  setCredentials,
} from "./authSlice";

describe("authSlice", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores credentials and persists token", () => {
    const next = authReducer(undefined, setCredentials({
      token: "jwt-token",
      user: {
        id: "1",
        name: "ACME HR",
        email: "hr@acme.com",
        role: "hr_admin",
      },
    }));

    expect(next.token).toBe("jwt-token");
    expect(next.user?.email).toBe("hr@acme.com");
    expect(localStorage.getItem("token")).toBe("jwt-token");
  });

  it("clears credentials and removes token", () => {
    localStorage.setItem("token", "jwt-token");
    const next = authReducer(
      {
        token: "jwt-token",
        user: {
          id: "1",
          name: "ACME HR",
          email: "hr@acme.com",
          role: "hr_admin",
        },
      },
      clearCredentials()
    );

    expect(next.token).toBeNull();
    expect(next.user).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });
});
