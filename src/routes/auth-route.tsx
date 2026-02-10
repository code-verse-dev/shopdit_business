import { jwtDecode } from "jwt-decode";
import React, { ReactNode } from "react";
import { Navigate } from "react-router";
import Cookies from "js-cookie";

interface UserAuthCheckProps {
  children: ReactNode;
}

interface JwtPayload {
  exp: number;
  email?: string;
  [key: string]: any;
}

const ProtectedRoute: React.FC<UserAuthCheckProps> = ({ children }) => {
  const token = Cookies.get("jwt");

  // If no token, redirect to signin
  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  let decoded: JwtPayload;
  try {
    decoded = jwtDecode<JwtPayload>(token);
  } catch (_error) {
    // Invalid token → remove it & redirect
    Cookies.remove("jwt");
    return <Navigate to="/signin" replace />;
  }

  // Check if token is expired
  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    Cookies.remove("jwt");
    return <Navigate to="/signin" replace />;
  }

  // If valid token, render the protected children
  return <>{children}</>;
};

export default ProtectedRoute;
