import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp } = body

    if (!email || !otp) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and OTP are required' 
      }, { status: 400 })
    }

    // Check if OTP storage exists
    if (!global.otpStorage) {
      return NextResponse.json({ 
        success: false, 
        error: 'No verification code found. Please request a new code.' 
      }, { status: 400 })
    }

    // Get OTP data
    const otpData = global.otpStorage.get(email)
    
    if (!otpData) {
      return NextResponse.json({ 
        success: false, 
        error: 'No verification code found for this email. Please request a new code.' 
      }, { status: 400 })
    }

    // Check if OTP is expired
    if (new Date() > new Date(otpData.expiresAt)) {
      global.otpStorage.delete(email)
      return NextResponse.json({ 
        success: false, 
        error: 'Verification code has expired. Please request a new code.' 
      }, { status: 400 })
    }

    // Check if too many attempts
    if (otpData.attempts >= 3) {
      global.otpStorage.delete(email)
      return NextResponse.json({ 
        success: false, 
        error: 'Too many failed attempts. Please request a new code.' 
      }, { status: 400 })
    }

    // Verify OTP
    if (otpData.code !== otp) {
      // Increment attempts
      otpData.attempts += 1
      global.otpStorage.set(email, otpData)
      
      return NextResponse.json({ 
        success: false, 
        error: `Invalid verification code. ${3 - otpData.attempts} attempts remaining.` 
      }, { status: 400 })
    }

    // OTP is valid - remove it from storage
    global.otpStorage.delete(email)

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