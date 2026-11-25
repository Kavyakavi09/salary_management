import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import authReducer from "../store/slices/authSlice";
import ProtectedRoute from "./ProtectedRoute";

const renderProtected = (token: string | null) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: { token, user: null },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>Dashboard secret</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe("ProtectedRoute", () => {
  it("redirects unauthenticated users to login", () => {
    renderProtected(null);
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    renderProtected("jwt-token");
    expect(screen.getByText("Dashboard secret")).toBeInTheDocument();
  });
});
