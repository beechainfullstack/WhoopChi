function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var ${name}`);
  return v;
}

export const env = {
  get whoopClientId() {
    return required("WHOOP_CLIENT_ID");
  },
  get whoopClientSecret() {
    return required("WHOOP_CLIENT_SECRET");
  },
  get whoopRedirectUri() {
    return (
      process.env.WHOOP_REDIRECT_URI ??
      "http://localhost:3000/api/auth/whoop/callback"
    );
  },
  get whoopWebhookSecret() {
    return process.env.WHOOP_WEBHOOK_SECRET ?? "";
  },
  get sessionSecret() {
    return required("SESSION_SECRET");
  },
};
