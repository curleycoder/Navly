import { NextResponse } from 'next/server'
import { recentDraws } from '@/lib/draws'

export const dynamic = 'force-static'

export function GET() {
  return NextResponse.json(recentDraws)
}
