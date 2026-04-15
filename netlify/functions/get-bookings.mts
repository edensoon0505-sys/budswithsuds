import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  const store = getStore({ name: "bookings", consistency: "strong" });
  const { blobs } = await store.list();

  const bookings = [];
  for (const blob of blobs) {
    const data = await store.get(blob.key, { type: "json" });
    if (data) {
      bookings.push(data);
    }
  }

  return Response.json(bookings);
};

export const config: Config = {
  path: "/api/bookings",
  method: "GET",
};
