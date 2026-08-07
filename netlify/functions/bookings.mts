import { getStore } from '@netlify/blobs'
import type { Config, Context } from '@netlify/functions'

export default async (req: Request, context: Context) => {
  const store = getStore({ name: 'bookings', consistency: 'strong' })
  const url = new URL(req.url)

  // GET - list all bookings
  if (req.method === 'GET') {
    const { blobs } = await store.list()
    const bookings = []
    for (const blob of blobs) {
      const data = await store.get(blob.key, { type: 'json' })
      if (data) bookings.push(data)
    }
    // Sort by date
    bookings.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    return Response.json(bookings)
  }

  // POST - create a booking
  if (req.method === 'POST') {
    const body = await req.json()
    const { name, phone, date, size, addons, total } = body

    if (!name || !phone || !date || !size || total === undefined) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const id = Date.now().toString()
    const booking = {
      id,
      name,
      phone,
      date,
      size,
      addons: addons || [],
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    await store.setJSON(`booking-${id}`, booking)
    return Response.json(booking, { status: 201 })
  }

  // PUT - update booking status
  if (req.method === 'PUT') {
    const body = await req.json()
    const { id, status } = body

    if (!id || !status) {
      return Response.json({ error: 'Missing id or status' }, { status: 400 })
    }

    const existing = await store.get(`booking-${id}`, { type: 'json' }) as any
    if (!existing) {
      return Response.json({ error: 'Booking not found' }, { status: 404 })
    }

    existing.status = status
    await store.setJSON(`booking-${id}`, existing)
    return Response.json(existing)
  }

  // DELETE - remove a booking
  if (req.method === 'DELETE') {
    const id = url.searchParams.get('id')
    if (!id) {
      return Response.json({ error: 'Missing id' }, { status: 400 })
    }

    await store.delete(`booking-${id}`)
    return Response.json({ success: true })
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 })
}

export const config: Config = {
  path: '/api/bookings',
}
