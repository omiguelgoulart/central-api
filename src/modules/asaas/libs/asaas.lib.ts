import axios from "axios";

const ENV = process.env.ASAAS_ENV ?? "sandbox";
const BASE_URL =
  ENV === "production"
    ? "https://api.asaas.com/v3"
    : "https://api-sandbox.asaas.com/v3";

export const asaas = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    access_token: process.env.ASAAS_API_KEY || "",
  },
});
