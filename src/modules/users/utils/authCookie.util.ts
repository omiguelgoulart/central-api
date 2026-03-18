export const TOKEN_COOKIE_NAME = "token";

export function getTokenCookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        maxAge: 60 * 60 * 1000,
    };
}