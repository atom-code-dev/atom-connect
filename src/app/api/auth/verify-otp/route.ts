import { NextRequest, NextResponse } from 'next/server'

// Improved OTP storage access
function getOTPStorage() {
  if (!global.otpStorage) {
    global.otpStorage = new Map()
    console.log('OTP storage initialized')
  }
  return global.otpStorage
}

// Clean expired OTPs
function cleanupExpiredOTPs() {
  const storage = getOTPStorage()
  const now = new Date()
  
  for (const [email, otpData] of storage.entries()) {
    if (now > new Date(otpData.expiresAt)) {
      storage.delete(email)
      console.log('Cleaned up expired OTP for:', email)
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp } = body

    console.log('OTP verification attempt:', { email, otp, otpLength: otp?.length, emailType: typeof email })

    if (!email || !otp) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and OTP are required' 
      }, { status: 400 })
    }

    // Normalize email for consistency
    const normalizedEmail = email.toLowerCase()
    console.log('Normalized email:', normalizedEmail)

    // Get OTP storage and clean up expired ones
    const storage = getOTPStorage()
    cleanupExpiredOTPs()

    // Debug: Log all stored OTPs
    console.log('All stored OTPs:', Array.from(storage.entries()))
    
    // Get OTP data
    const otpData = storage.get(normalizedEmail)
    console.log('OTP data found for email:', normalizedEmail, !!otpData)
    
    if (!otpData) {
      console.log('No OTP data found for email:', normalizedEmail)
      console.log('Available emails in storage:', Array.from(storage.keys()))
      return NextResponse.json({ 
        success: false, 
        error: 'No verification code found for this email. Please request a new code.' 
      }, { status: 400 })
    }

    console.log('OTP data:', { 
      email: otpData.email, 
      expiresAt: otpData.expiresAt, 
      attempts: otpData.attempts,
      currentTime: new Date().toISOString()
    })

    // Check if OTP is expired
    const now = new Date()
    const expiresAt = new Date(otpData.expiresAt)
    console.log('Expiration check:', { now, expiresAt, isExpired: now > expiresAt })
    
    if (now > expiresAt) {
      storage.delete(normalizedEmail)
      return NextResponse.json({ 
        success: false, 
        error: 'Verification code has expired. Please request a new code.' 
      }, { status: 400 })
    }

    // Check if too many attempts
    if (otpData.attempts >= 3) {
      storage.delete(normalizedEmail)
      return NextResponse.json({ 
        success: false, 
        error: 'Too many failed attempts. Please request a new code.' 
      }, { status: 400 })
    }

    // Verify OTP
    if (otpData.code !== otp) {
      // Increment attempts
      otpData.attempts = (otpData.attempts || 0) + 1
      storage.set(normalizedEmail, otpData)
      console.log('Invalid OTP attempt:', { 
        provided: otp, 
        expected: otpData.code, 
        attemptsLeft: 3 - otpData.attempts 
      })
      
      return NextResponse.json({ 
        success: false, 
        error: `Invalid verification code. ${3 - otpData.attempts} attempts remaining.` 
      }, { status: 400 })
    }

    // OTP is valid - remove it from storage
    storage.delete(normalizedEmail)
    console.log('OTP verified successfully for email:', normalizedEmail)

    return NextResponse.json({ 
      success: true, 
      message: 'Email verified successfully'
    })

  } catch (error) {
    console.error('Error verifying OTP:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal Server Error' 
    }, { status: 500 })
  }
}