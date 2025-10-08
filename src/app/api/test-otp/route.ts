import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@atomconnect.in'
const FROM_NAME = process.env.RESEND_FROM_NAME || 'Atom Connect'

// Generate a random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Improved OTP storage with better error handling
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
    const { email, testOnly = false } = body

    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email is required' 
      }, { status: 400 })
    }

    // Generate OTP
    const otp = generateOTP()
    
    // Store OTP with improved structure
    const otpData = {
      code: otp,
      email: email.toLowerCase(), // Normalize email
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiration
      attempts: 0,
      createdAt: new Date()
    }

    // Get storage and clean up expired OTPs
    const storage = getOTPStorage()
    cleanupExpiredOTPs()
    
    // Clear any existing OTP for this email
    storage.delete(email.toLowerCase())
    
    // Store new OTP
    storage.set(email.toLowerCase(), otpData)
    console.log('Test OTP stored for email:', email.toLowerCase(), 'Code:', otp)

    if (testOnly) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test OTP generated and stored (not sent)',
        otp: otp, // Only for testing
        expiresAt: otpData.expiresAt
      })
    }

    // Send email using Resend with improved template
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [email],
      subject: 'Test OTP - Atom Connect',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test OTP - Atom Connect</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%); color: white; padding: 40px 30px; text-align: center;">
              <div style="font-size: 28px; font-weight: 700; margin-bottom: 8px;">Atom Connect</div>
              <div style="font-size: 16px; opacity: 0.9;">Professional Training Platform</div>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h1 style="color: #1e293b; font-size: 24px; margin-top: 0; margin-bottom: 16px;">
                Test Verification Code
              </h1>
              
              <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Hello there,
              </p>
              
              <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                This is a test verification code for debugging purposes. Your test OTP is:
              </p>
              
              <!-- OTP Code Box -->
              <div style="background: #f1f5f9; border: 2px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin: 32px 0;">
                <div style="font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                  Test Verification Code
                </div>
                <div style="font-size: 36px; font-weight: 700; color: #1e40af; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${otp}
                </div>
              </div>
              
              <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="color: #92400e; font-size: 14px; line-height: 1.5; margin: 0;">
                  <strong>Important:</strong> This test code will expire in <strong>10 minutes</strong>.
                </p>
              </div>
              
              <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                This is a test email for debugging and testing purposes only.
              </p>
              
              <!-- Support Section -->
              <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 32px;">
                <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0;">
                  Need help? Contact our support team at 
                  <a href="mailto:support@atomconnect.in" style="color: #1e40af; text-decoration: none;">support@atomconnect.in</a>
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 30px; text-align: center;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">
                © 2024 Atom Connect. All rights reserved.
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                This is an automated test email. Please do not reply to this message.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('Resend error details:', error)
      console.error('Resend error message:', error.message)
      console.error('Resend error statusCode:', (error as any).statusCode)
      
      // Check if it's a domain verification error
      if (error.message && error.message.includes('domain')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Email service configuration error. Please contact support.' 
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send test verification email. Please try again.' 
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