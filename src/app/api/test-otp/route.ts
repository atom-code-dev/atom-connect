import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_KEY)

// Generate a random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, testOnly = false } = body

    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email is required' 
      }, { status: 400 })
    }

    // Generate OTP
    const otp = generateOTP()
    
    // Store OTP in memory
    const otpData = {
      code: otp,
      email: email,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiration
      attempts: 0
    }

    // Initialize OTP storage if it doesn't exist
    if (!global.otpStorage) {
      global.otpStorage = new Map()
      console.log('OTP storage initialized')
    }
    
    // Clear any existing OTP for this email
    global.otpStorage.delete(email)
    
    // Store new OTP
    global.otpStorage.set(email, otpData)
    console.log('Test OTP stored for email:', email, 'Code:', otp)

    if (testOnly) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test OTP generated and stored (not sent)',
        otp: otp, // Only for testing
        expiresAt: otpData.expiresAt
      })
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Use Resend's default verified domain
      to: [email],
      subject: 'Test OTP - Atom Connect',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Test OTP</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">This is a test verification code</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Hello there,</h2>
            <p style="color: #666; line-height: 1.6;">
              This is a test OTP for debugging purposes. Your verification code is:
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 0;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              This code will expire in <strong>10 minutes</strong>.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 14px;">
              <p>This is a test email for debugging purposes.</p>
              <p>© 2024 Atom Connect. All rights reserved.</p>
            </div>
          </div>
        </div>
      `
    })

    if (error) {
      console.error('Resend error details:', error)
      console.error('Resend error message:', error.message)
      console.error('Resend error statusCode:', error.statusCode)
      
      // Check if it's a domain verification error
      if (error.message && error.message.includes('domain')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Email service configuration error. Please contact support.' 
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send verification email. Please try again.' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Test OTP sent successfully',
      data: {
        id: data.id,
        expiresAt: otpData.expiresAt
      }
    })

  } catch (error) {
    console.error('Error sending test OTP:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal Server Error' 
    }, { status: 500 })
  }
}