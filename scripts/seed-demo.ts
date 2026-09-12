/**
 * Seed a demo user with 35 days of synthetic metrics and readings so the UI can
 * be developed without WHOOP credentials. Then visit /api/dev/login.
 *
 *   npm run seed:demo
 */
import { prisma } from "../src/lib/db";
import { generateReadings } from "../src/lib/readings";

function jitter(base: number, spread: number, i: number, seed: number): number {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  const r = x - Math.floor(x); // 0..1 deterministic
  return base + (r - 0.5) * 2 * spread;
}

async function main() {
  const user = await prisma.user.upsert({
    where: { whoopUserId: "demo" },
    create: {
      whoopUserId: "demo",
      firstName: "Demo",
      email: "demo@example.com",
      accessToken: "demo",
      refreshToken: "demo",
      expiresAt: new Date(Date.now() + 365 * 86_400_000),
      scopes: "",
      tier: "paid",
    },
    update: {},
  });

  const dates: string[] = [];
  const today = new Date();
  for (let i = 35; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86_400_000).toISOString().slice(0, 10);
    dates.push(d);
    const k = 35 - i;
    const spike = i === 0 ? 1 : 0; // make today's HRV an outlier so a changing line appears
    const metrics = {
      sleepPerformance: jitter(82, 10, k, 1),
      sleepConsistency: jitter(74, 12, k, 2),
      hrv: jitter(62, 8, k, 3) + spike * 30,
      restingHeartRate: jitter(55, 4, k, 4),
      recoveryScore: jitter(66, 20, k, 5),
      previousStrain: jitter(11, 4, k, 6),
    };
    await prisma.dailyMetrics.upsert({
      where: { userId_date: { userId: user.id, date: d } },
      create: { userId: user.id, date: d, ...metrics },
      update: metrics,
    });
  }
  await generateReadings(user.id, dates);
  console.log(`Seeded ${dates.length} days for demo user. Visit http://localhost:3000/api/dev/login`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
