import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  const store = getStore({ name: "bookings", consistency: "strong" });
  const body = await req.json();

  if (body.action === "delete") {
    await store.delete(String(body.id));
    return Response.json({ success: true });
  }

  // Update booking status
  const existing = await store.get(String(body.id), { type: "json" }) as Record<string, unknown> | null;
  if (existing) {
    existing.status = body.status;
    await store.setJSON(String(body.id), existing);
  }

  return Response.json({ success: true });
};

export const config: Config = {
  path: "/api/bookings",
  method: "POST",
};
