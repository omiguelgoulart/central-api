import axios from "axios";

const ENV = (process.env.ASAAS_ENV ?? (process.env.NODE_ENV === "production" ? "production" : "sandbox")).toLowerCase();
const BASE_URL =
  ENV === "production"
    ? "https://api.asaas.com/v3"
    : "https://api-sandbox.asaas.com/v3";

const API_KEY = process.env.ASAAS_API_KEY?.trim() ?? "";

if (!API_KEY) {
  throw new Error("ASAAS_API_KEY nao configurada");
}

export const asaas = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    access_token: API_KEY,
    Authorization: `Bearer ${API_KEY}`,
  },
});
