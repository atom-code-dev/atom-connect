import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!global.otpStorage) {
      return NextResponse.json({ 
        success: false, 
        message: 'OTP storage not initialized',
        storage: null 
      })
    }

    if (email) {
      const otpData = global.otpStorage.get(email)
      return NextResponse.json({ 
        success: true, 
        message: 'OTP data for email',
        email,
        otpData: otpData ? {
          code: otpData.code,
          email: otpData.email,
          expiresAt: otpData.expiresAt,
          attempts: otpData.attempts,
          isExpired: new Date() > new Date(otpData.expiresAt)
        } : null 
      })
    }

    // Return all OTP data (for debugging)
    const allOtpData = Array.from(global.otpStorage.entries()).map((entry: unknown) => {
      const [key, value] = entry as [string, any]
      return {
        email: key,
        code: value.code,
        expiresAt: value.expiresAt,
        attempts: value.attempts,
        isExpired: new Date() > new Date(value.expiresAt)
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'All OTP data',
      count: allOtpData.length,
      storage: allOtpData 
    })

  } catch (error) {
    console.error('Error debugging OTP:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal Server Error' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!global.otpStorage) {
      return NextResponse.json({ 
        success: false, 
        message: 'OTP storage not initialized' 
      })
    }

    if (email) {
      const deleted = global.otpStorage.delete(email)
      return NextResponse.json({ 
        success: true, 
        message: deleted ? 'OTP deleted successfully' : 'OTP not found',
        email 
      })
    }

    // Clear all OTP data
    global.otpStorage.clear()
    return NextResponse.json({ 
      success: true, 
      message: 'All OTP data cleared' 
    })

  } catch (error) {
    console.error('Error clearing OTP:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal Server Error' 
    }, { status: 500 })
  }
}