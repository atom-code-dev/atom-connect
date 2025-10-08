import { NextResponse } from 'next/server'

export async function GET() {
  const nextAuthUrl = process.env.NEXTAUTH_URL || 'NOT_SET'
  const callbackUrl = `${nextAuthUrl}/api/auth/callback/linkedin`
  
  const envVars = {
    LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID ? '***' + process.env.LINKEDIN_CLIENT_ID.slice(-4) : 'NOT_SET',
    NEXT_PUBLIC_LINKEDIN_CLIENT_ID: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID ? '***' + process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID.slice(-4) : 'NOT_SET',
    LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET ? '***' + process.env.LINKEDIN_CLIENT_SECRET.slice(-4) : 'NOT_SET',
    NEXTAUTH_URL: nextAuthUrl,
    AUTH_SECRET: process.env.AUTH_SECRET ? 'SET' : 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
  }

  const config = {
    expectedCallbackUrl: callbackUrl,
    linkedinAppRedirectUris: [
      'https://www.atomconnect.in/api/auth/callback/linkedin',
      'https://atomconnect.in/api/auth/callback/linkedin',
    ],
    callbackUrlMatch: callbackUrl === 'https://www.atomconnect.in/api/auth/callback/linkedin' || 
                      callbackUrl === 'https://atomconnect.in/api/auth/callback/linkedin',
  }

  return NextResponse.json({
    environment: envVars,
    configuration: config,
    timestamp: new Date().toISOString(),
    message: 'LinkedIn OAuth configuration check'
  })
}