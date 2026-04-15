import { getStore } from "@netlify/blobs";
import type { Context } from "@netlify/functions";

interface FormPayload {
  form_name: string;
  data: Record<string, string>;
  created_at: string;
}

export default async (req: Request, context: Context) => {
  const { payload } = (await req.json()) as { payload: FormPayload };

  if (payload.form_name !== "booking") {
    return new Response("OK");
  }

  const store = getStore({ name: "bookings", consistency: "strong" });
  const id = String(Date.now());

  const booking = {
    id,
    name: payload.data["client-name"] || "",
    phone: payload.data["client-phone"] || "",
    date: payload.data["booking-date"] || "",
    size: payload.data["package"] || "",
    addons: payload.data["addons"] ? payload.data["addons"].split(", ").filter(Boolean) : [],
    total: parseInt(payload.data["total"] || "0", 10),
    status: "pending",
    createdAt: payload.created_at,
  };

  await store.setJSON(id, booking);

  return new Response("OK");
};
