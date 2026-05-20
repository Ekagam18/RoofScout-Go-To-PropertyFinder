const isProd = import.meta.env.PROD;
const VITE_API_URL = import.meta.env.VITE_API_URL;

// If VITE_API_URL is provided, use it. 
// Otherwise, in production use empty string (relative paths).
// In development, use empty string because we have a proxy in vite.config.js.
// However, some parts of the app might still expect a full URL for things like socket.io if they are not using the proxy correctly.
// But with the proxy, relative paths should work fine.

export const API_BASE_URL = VITE_API_URL || "";
export const SOCKET_URL = VITE_API_URL || (isProd ? window.location.origin : "");

export default {
    API_BASE_URL,
    SOCKET_URL
};
