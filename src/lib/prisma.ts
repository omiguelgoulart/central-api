import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

function normalizePostgresConnectionString(connectionString: string): string {
    try {
        const databaseUrl = new URL(connectionString);
        const sslMode = databaseUrl.searchParams.get("sslmode");

        if (["prefer", "require", "verify-ca"].includes(sslMode ?? "")) {
            databaseUrl.searchParams.set("sslmode", "verify-full");
        }

        return databaseUrl.toString();
    } catch {
        return connectionString;
    }
}

const rawConnectionString = process.env.DATABASE_URL;

if (!rawConnectionString) {
    throw new Error("DATABASE_URL não configurada");
}

const connectionString = normalizePostgresConnectionString(rawConnectionString);

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };