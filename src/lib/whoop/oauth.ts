import { z } from "zod";
import { env } from "../env";

export const WHOOP_AUTH_URL = "https://api.prod.whoop.com/oauth/oauth2/auth";
export const WHOOP_TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token";

/** `offline` yields a refresh token; `read:profile` gives us the WHOOP user id for webhooks. */
export const WHOOP_SCOPES = [
  "offline",
  "read:profile",
  "read:recovery",
  "read:sleep",
  "read:cycles",
  "read:workout",
];

const TokenResponse = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  expires_in: z.number(),
  scope: z.string().optional(),
  token_type: z.string(),
});
export type TokenResponse = z.infer<typeof TokenResponse>;

export function authorizeUrl(state: string): string {
  const u = new URL(WHOOP_AUTH_URL);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("client_id", env.whoopClientId);
  u.searchParams.set("redirect_uri", env.whoopRedirectUri);
  u.searchParams.set("scope", WHOOP_SCOPES.join(" "));
  u.searchParams.set("state", state);
  return u.toString();
}

async function tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(WHOOP_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      ...body,
      client_id: env.whoopClientId,
      client_secret: env.whoopClientSecret,
    }),
  });
  if (!res.ok) {
    throw new Error(`WHOOP token request failed (${res.status}): ${await res.text()}`);
  }
  return TokenResponse.parse(await res.json());
}

export function exchangeCode(code: string): Promise<TokenResponse> {
  return tokenRequest({
    grant_type: "authorization_code",
    code,
    redirect_uri: env.whoopRedirectUri,
  });
}

export function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  return tokenRequest({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope: "offline",
  });
}
