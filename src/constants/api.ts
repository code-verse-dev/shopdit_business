const { hostname } = window.location;

const servers = {
  local: "http://localhost:3011",
  customDev: "https://react.customdev.solutions:3011",
  live: "https://api.shopditusa.com",
  dummy: "https://9d2f-204-157-158-10.ngrok-free.app",
};

const loyaltyPortalUrls = {
  development: "http://localhost:3000",
  customdev: "https://react.customdev.solutions/shopdit-loyalbase",
  live: "https://loyalbase.shopditusa.com",
};

let URL;

type Environment = "development" | "customdev" | "live";

let enviroment: Environment = "development";

let publicUrl = "/";

if (hostname.includes("react.customdev.solutions")) {
  URL = servers.customDev;
  enviroment = "customdev";
} else if (hostname.includes("localhost")) {
  URL = servers.local;
  enviroment = "development";
} else if (hostname.includes("devtunnels.ms")) {
  URL = servers.dummy;
  enviroment = "development";
} else {
  URL = servers.live;
  enviroment = "live";
}

const portalUrls = loyaltyPortalUrls[enviroment];

export const SOCKET_URL = URL;
export const UPLOADS_URL = `${URL}/Uploads/`;
export const BASE_URL = `${URL}/api`;
export const PUBLIC_URL = publicUrl;
export const ENV = enviroment;

/** Loyalty dashboard – sidebar SSO link (JWT passed in URL hash). */
export const LOYALTY_DASHBOARD_URL = portalUrls;
