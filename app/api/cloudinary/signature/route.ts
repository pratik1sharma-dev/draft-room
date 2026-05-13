import { createHash } from 'crypto'
import { NextResponse } from 'next/server'

export async function GET() {
  const timestamp = Math.round(Date.now() / 1000)
  const folder = 'avatars'

  const signature = createHash('sha1')
    .update(`folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`)
    .digest('hex')

  return NextResponse.json({
    timestamp,
    signature,
    folder,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  })
}
