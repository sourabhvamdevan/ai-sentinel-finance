import { seedTransactions } from "@/actions/seeds";

export async function GET() {
  // Seeding is for local development only; never expose it in production.
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  const result = await seedTransactions();
  return Response.json(result);
}
