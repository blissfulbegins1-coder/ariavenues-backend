import { CORS_ORIGINS } from "@/config/env";

export const headers = {
  accept: "application/json",
  "content-type": "application/json",
  Authorization: "",
  "x-transaction-id": ""
};

export const corsOrigins = CORS_ORIGINS;
