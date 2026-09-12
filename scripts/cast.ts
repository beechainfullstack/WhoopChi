/**
 * First-implementation-step script: authorise with WHOOP (if needed), pull the
 * last ~35 days of your own data, run the z-score/line logic for the most
 * recent day, and print the hexagram to the console.
 *
 *   npm run cast            # most recent day
 *   npm run cast -- 2026-09-10
 *
 * Requires WHOOP_CLIENT_ID / WHOOP_CLIENT_SECRET in .env. The redirect URI must
 * match the one registered in the WHOOP dashboard (default
 * http://localhost:3000/api/auth/whoop/callback) and the Next dev server must
 * NOT be running on that port while this script does its one-off OAuth dance.
 */
import { createServer } from "node:http";
import { exec } from "node:child_process";
import { prisma } from "../src/lib/db";
import { env } from "../src/lib/env";
import { authorizeUrl, exchangeCode } from "../src/lib/whoop/oauth";
import { fetchProfileWithToken } from "../src/lib/whoop/client";
import { fetchDays } from "../src/lib/whoop/sync";
import { asciiHexagram, castHexagram, LINE_METRICS } from "../src/lib/hexagram/engine";
import { hexagramGlyph } from "../src/lib/hexagram/data";
import { randomState } from "../src/lib/session";

async function oauthViaLocalServer() {
  const redirect = new URL(env.whoopRedirectUri);
  const state = randomState();
  const url = authorizeUrl(state);

  const code = await new Promise<string>((resolve, reject) => {
    const server = createServer((req, res) => {
      const u = new URL(req.url ?? "/", redirect.origin);
      if (u.pathname !== redirect.pathname) {
        res.writeHead(404).end();
        return;
      }
      const err = u.searchParams.get("error");
      if (err || u.searchParams.get("state") !== state || !u.searchParams.get("code")) {
        res.writeHead(400).end("OAuth failed. Check the terminal.");
        server.close();
        reject(new Error(err ?? "state mismatch"));
        return;
      }
      res.writeHead(200, { "Content-Type": "text/plain" }).end("Connected. You can close this tab.");
      server.close();
      resolve(u.searchParams.get("code")!);
    });
    server.listen(Number(redirect.port || 80), () => {
      console.log(`\nOpen this URL to authorise WHOOP:\n\n  ${url}\n`);
      exec(`xdg-open "${url}" || open "${url}"`, () => {});
    });
  });

  const token = await exchangeCode(code);
  if (!token.refresh_token) throw new Error("No refresh token returned; is the `offline` scope enabled?");
  const profile = await fetchProfileWithToken(token.access_token);
  const data = {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: new Date(Date.now() + token.expires_in * 1000),
    scopes: token.scope ?? "",
    email: profile.email,
    firstName: profile.first_name,
  };
  return prisma.user.upsert({
    where: { whoopUserId: String(profile.user_id) },
    create: { whoopUserId: String(profile.user_id), ...data },
    update: data,
  });
}

function fmt(n: number | null, digits = 1): string {
  return n === null || !Number.isFinite(n) ? "—" : n.toFixed(digits);
}

async function main() {
  const targetDate = process.argv[2];

  let user = await prisma.user.findFirst({ orderBy: { updatedAt: "desc" } });
  if (!user) user = await oauthViaLocalServer();
  console.log(`Using WHOOP user ${user.whoopUserId}${user.firstName ? ` (${user.firstName})` : ""}`);

  const { rows } = await fetchDays(user, 35);
  rows.sort((a, b) => a.date.localeCompare(b.date));
  if (rows.length === 0) throw new Error("WHOOP returned no cycles");

  const idx = targetDate ? rows.findIndex((r) => r.date === targetDate) : rows.length - 1;
  if (idx < 0) throw new Error(`No data for ${targetDate}. Have: ${rows.map((r) => r.date).join(", ")}`);
  const today = rows[idx];
  const history = rows.slice(0, idx);

  const c = castHexagram(today, history);

  console.log(`\nReading for ${today.date}  (baseline: ${c.baselineDays} days${c.stable ? "" : ", not yet stable"})\n`);
  console.log(asciiHexagram(c.lines));
  console.log(`\n${hexagramGlyph(c.primary.number)}  ${c.primary.number}. ${c.primary.name} (${c.primary.pinyin} ${c.primary.chinese})`);
  console.log(`   ${c.primary.brief}`);
  if (c.transformed) {
    console.log(`\n→ changing to ${hexagramGlyph(c.transformed.number)}  ${c.transformed.number}. ${c.transformed.name} (${c.transformed.pinyin})`);
    console.log(`   ${c.transformed.brief}`);
  }

  console.log("\nLine  Metric                  Today    Mean     SD      z      Line");
  for (const l of [...c.lines].reverse()) {
    const spec = LINE_METRICS[l.position - 1];
    const kind = `${l.yang ? "yang" : "yin"}${l.changing ? " (changing)" : ""}`;
    console.log(
      `${String(l.position).padEnd(5)} ${spec.label.padEnd(23)} ${fmt(l.value).padStart(6)}  ${fmt(l.mean).padStart(6)}  ${fmt(l.stdDev).padStart(6)}  ${fmt(l.zScore, 2).padStart(6)}  ${kind}`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
