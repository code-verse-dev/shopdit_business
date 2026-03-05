const { hostname } = window.location;

const servers = {
  local: "http://localhost:3011",
  customDev: "https://react.customdev.solutions:3011",
  live: "",
  dummy: "https://9d2f-204-157-158-10.ngrok-free.app",
};

let URL;

type Environment = "development" | "customdev" | "live";

let enviroment: Environment = "development";

let publicUrl = "/";

if (hostname.includes("react.customdev.solutions")) {
  URL = servers.customDev;
} else if (hostname.includes("localhost")) {
  URL = servers.local;
} else if (hostname.includes("devtunnels.ms")) {
  URL = servers.dummy;
} else {
  URL = servers.live;
}

export const SOCKET_URL = URL;
export const UPLOADS_URL = `${URL}/Uploads/`;
export const BASE_URL = `${URL}/api`;
export const PUBLIC_URL = publicUrl;
export const ENV = enviroment;

/**
 * Loyalty Dashboard (separate frontend) base URL.
 * When the user clicks "Loyalty Dashboard" in the sidebar, they are sent here
 * with the current JWT in the URL hash so they land already authenticated.
 * Set per environment (e.g. localhost for dev, production URL for live).
 */
export const LOYALTY_DASHBOARD_URL =
  typeof import.meta.env?.VITE_LOYALTY_DASHBOARD_URL === "string"
    ? import.meta.env.VITE_LOYALTY_DASHBOARD_URL.replace(/\/$/, "")
    : hostname.includes("localhost")
    ? "http://localhost:3000"
    : "https://react.customdev.solutions/shopdit/loyalty-dash/";
