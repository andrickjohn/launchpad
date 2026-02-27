import { NextResponse } from 'next/server'
import { updateCampaign } from '@/lib/db/campaigns'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    const campaign = await updateCampaign(id, body)

    return NextResponse.json({ campaign }, { status: 200 })
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })
  }
}
