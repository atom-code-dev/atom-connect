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
    const { email, organizationName } = body

    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email is required' 
      }, { status: 400 })
    }

    // Generate OTP
    const otp = generateOTP()
    
    // Store OTP in memory (in production, you'd want to use Redis or a database)
    // For now, we'll store it in a simple object with expiration
    const otpData = {
      code: otp,
      email: email,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiration
      attempts: 0
    }

    // Store in global object (temporary solution)
    if (!global.otpStorage) {
      global.otpStorage = new Map()
    }
    global.otpStorage.set(email, otpData)

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'noreply@yourdomain.com',
      to: [email],
      subject: 'Verify Your Email - Organization Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Email Verification</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Complete your organization registration</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Hello ${organizationName || 'there'},</h2>
            <p style="color: #666; line-height: 1.6;">
              Thank you for registering your organization. To complete your registration, please use the following verification code:
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 0;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              This code will expire in <strong>10 minutes</strong>. Please enter it on the registration page to complete your organization setup.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 14px;">
              <p>If you didn't request this verification, please ignore this email.</p>
              <p>© 2024 Your Company. All rights reserved.</p>
            </div>
          </div>
        </div>
      `
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send verification email' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Verification code sent successfully',
      data: {
        id: data.id,
        expiresAt: otpData.expiresAt
      }
    })

  } catch (error) {
    console.error('Error sending OTP:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal Server Error' 
    }, { status: 500 })
  }
}