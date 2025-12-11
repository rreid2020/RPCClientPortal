import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  // Get the Svix headers for verification
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error occurred -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new NextResponse('Error occurred', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'organization.created') {
    const { id, name } = evt.data

    // Create organization in database
    await db.organization.upsert({
      where: { clerk_org_id: id },
      update: {
        name: name || 'Unnamed Organization',
        updated_at: new Date(),
      },
      create: {
        clerk_org_id: id,
        name: name || 'Unnamed Organization',
        plan_tier: 'FREE',
      },
    })
  }

  if (eventType === 'organization.updated') {
    const { id, name } = evt.data

    // Update organization in database
    await db.organization.updateMany({
      where: { clerk_org_id: id },
      data: {
        name: name || 'Unnamed Organization',
        updated_at: new Date(),
      },
    })
  }

  if (eventType === 'organization.deleted') {
    const { id } = evt.data

    // Delete organization from database (cascade will handle related records)
    await db.organization.deleteMany({
      where: { clerk_org_id: id },
    })
  }

  if (eventType === 'user.created') {
    const { id } = evt.data

    // Create user profile in database
    await db.userProfile.upsert({
      where: { clerk_user_id: id },
      update: {},
      create: {
        clerk_user_id: id,
        is_firm_super_admin: false,
        is_firm_staff: false,
      },
    })
  }

  return new NextResponse('', { status: 200 })
}


