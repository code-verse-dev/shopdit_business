import { Navigate } from "react-router";
import Cookies from "js-cookie";
import { JSX } from "react";

export default function PublicRoute({ children }: { children: JSX.Element }) {
  const token = Cookies.get("jwt");

  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
}
