import { Navigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

type PublicRouteProps = {
  children: React.ReactNode;
};

const PublicRoute = ({ children }: PublicRouteProps) => {
  const token = useAppSelector((state) => state.auth.token);

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
