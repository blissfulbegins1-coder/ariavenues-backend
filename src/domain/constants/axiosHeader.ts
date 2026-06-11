export const headers = {
  accept: "application/json",
  "content-type": "application/json",
  Authorization: "",
};
// Parse CORS origins from environment variable (comma-separated)
export const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000", "http://localhost:5173"];
