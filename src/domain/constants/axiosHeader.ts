export const headers = {
  accept: "application/json",
  "content-type": "application/json",
  Authorization: "",
  "x-transaction-id": ""
};

export const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000", "http://localhost:5173"];
