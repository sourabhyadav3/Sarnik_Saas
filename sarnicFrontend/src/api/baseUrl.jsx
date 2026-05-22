// API base URL — set in .env.development (local) or .env.production (deploy)
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/s1";

export default BASE_URL;
