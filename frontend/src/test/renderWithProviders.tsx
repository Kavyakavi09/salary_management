import { configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import authReducer from "../store/slices/authSlice";
import type { AuthUser } from "../store/slices/authSlice";

type RenderOptions = {
  route?: string;
  routeState?: unknown;
  token?: string | null;
  user?: AuthUser | null;
};

export const renderWithProviders = (
  ui: React.ReactElement,
  {
    route = "/",
    routeState,
    token = null,
    user = null,
  }: RenderOptions = {}
) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }

  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        token,
        user,
      },
    },
  });

  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: route, state: routeState }]}>
          {ui}
        </MemoryRouter>
      </Provider>
    ),
  };
};
