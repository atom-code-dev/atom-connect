import { NextResponse } from 'next/server'

export async function GET() {
  const envVars = {
    LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID ? '***' + process.env.LINKEDIN_CLIENT_ID.slice(-4) : 'NOT_SET',
    NEXT_PUBLIC_LINKEDIN_CLIENT_ID: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID ? '***' + process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID.slice(-4) : 'NOT_SET',
    LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET ? '***' + process.env.LINKEDIN_CLIENT_SECRET.slice(-4) : 'NOT_SET',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT_SET',
    AUTH_SECRET: process.env.AUTH_SECRET ? 'SET' : 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
  }

  return NextResponse.json({
    environment: envVars,
    timestamp: new Date().toISOString(),
    message: 'LinkedIn OAuth configuration check'
  })
}