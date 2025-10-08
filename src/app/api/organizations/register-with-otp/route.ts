import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// List of restricted email domains (personal email providers)
const RESTRICTED_DOMAINS = [
  // Gmail
  'gmail.com',
  // Yahoo Mail
  'yahoo.com', 'ymail.com', 'rocketmail.com',
  // Outlook
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  // iCloud Mail
  'icloud.com', 'me.com', 'mac.com',
  // AOL Mail
  'aol.com',
  // Zoho Mail
  'zoho.com',
  // GMX Mail
  'gmx.com', 'gmx.us',
  // ProtonMail
  'protonmail.com', 'pm.me',
  // Tutanota
  'tutanota.com', 'tutanota.de', 'tutamail.com',
  // Mail.com domains
  'mail.com', 'email.com', 'usa.com', 'myself.com', 'consultant.com', 'post.com',
  'europe.com', 'asia.com', 'dr.com', 'engineer.com', 'cheerful.com', 'accountant.com',
  'activist.com', 'allergist.com', 'alumni.com', 'arcticmail.com', 'artlover.com',
  'birdlover.com', 'brew-meister.com', 'cash4u.com', 'chemist.com', 'columnist.com',
  'comic.com', 'computer4u.com', 'counsellor.com', 'deliveryman.com', 'diplomats.com',
  'execs.com', 'fastservice.com', 'gardener.com', 'groupmail.com', 'homemail.com',
  'job4u.com', 'journalist.com', 'legislator.com', 'lobbyist.com', 'minister.com',
  'net-shopping.com', 'optician.com', 'pediatrician.com', 'planetmail.com', 'politician.com',
  'priest.com', 'publicist.com', 'qualityservice.com', 'realtyagent.com', 'registerednurses.com',
  'repairman.com', 'sociologist.com', 'solution4u.com'
]

// Function to validate email domain
function validateEmailDomain(email: string): { isValid: boolean; error?: string } {
  if (!email) {
    return { isValid: false, error: "Email is required" }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" }
  }

  const domain = email.split('@')[1]?.toLowerCase()
  
  if (!domain) {
    return { isValid: false, error: "Invalid email format" }
  }

  if (RESTRICTED_DOMAINS.includes(domain)) {
    return { 
      isValid: false, 
      error: "Personal email addresses are not allowed. Please use your organization email address." 
    }
  }

  return { isValid: true }
}

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
    const {
      email,
      password,
      name,
      organizationName,
      website,
      contactMail,
      phone,
      companyLocation,
      otp,
      isOtpVerified = false
    } = body

    console.log('Organization registration attempt:', { email, organizationName, isOtpVerified })

    // Normalize email for consistency
    const normalizedEmail = email.toLowerCase()

    // Get OTP storage and clean up expired ones
    const storage = getOTPStorage()
    cleanupExpiredOTPs()

    // If OTP is not pre-verified, validate it
    if (!isOtpVerified) {
      // Validate OTP verification first
      if (!storage.has(normalizedEmail)) {
        console.log('OTP verification failed: No OTP found for email:', normalizedEmail)
        return NextResponse.json({ 
          success: false, 
          error: 'Email verification required. Please request OTP first.' 
        }, { status: 400 })
      }

      const otpData = storage.get(normalizedEmail)
      console.log('OTP data found for email:', normalizedEmail)
      
      // Check if OTP is expired
      if (new Date() > new Date(otpData.expiresAt)) {
        storage.delete(normalizedEmail)
        console.log('OTP expired for email:', normalizedEmail)
        return NextResponse.json({ 
          success: false, 
          error: 'Verification code has expired. Please request a new code.' 
        }, { status: 400 })
      }

      // Verify OTP
      if (otpData.code !== otp) {
        console.log('Invalid OTP for email:', normalizedEmail, 'Expected:', otpData.code, 'Received:', otp)
        
        // Increment attempt counter
        otpData.attempts = (otpData.attempts || 0) + 1
        storage.set(normalizedEmail, otpData)
        
        // Check if too many attempts
        if (otpData.attempts >= 3) {
          storage.delete(normalizedEmail)
          console.log('Too many failed attempts for email:', normalizedEmail)
          return NextResponse.json({ 
            success: false, 
            error: 'Too many failed attempts. Please request a new verification code.' 
          }, { status: 400 })
        }
        
        return NextResponse.json({ 
          success: false, 
          error: `Invalid verification code. ${3 - otpData.attempts} attempts remaining.` 
        }, { status: 400 })
      }

      // Remove OTP after successful verification
      storage.delete(normalizedEmail)
      console.log('OTP verified and removed for email:', normalizedEmail)
    } else {
      console.log('OTP was pre-verified, skipping OTP validation for email:', normalizedEmail)
    }

    // Validate email domain
    const emailValidation = validateEmailDomain(normalizedEmail)
    if (!emailValidation.isValid) {
      return NextResponse.json({ 
        success: false, 
        error: emailValidation.error 
      }, { status: 400 })
    }

    // Validate required fields
    if (!normalizedEmail || !password || !organizationName || !contactMail || !companyLocation) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields: email, password, organizationName, contactMail, companyLocation' 
      }, { status: 400 })
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({ 
        success: false,
        error: 'Password must be at least 6 characters long' 
      }, { status: 400 })
    }

    // Validate contact email format
    const contactEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!contactEmailRegex.test(contactMail)) {
      return NextResponse.json({ 
        success: false,
        error: 'Please enter a valid contact email address' 
      }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (existingUser) {
      console.log('Email already exists:', normalizedEmail)
      return NextResponse.json({ 
        success: false,
        error: 'Email already exists' 
      }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user and organization profile in a transaction
    const result = await db.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          name: name || '',
          role: 'ORGANIZATION'
        }
      })

      // Create organization profile
      const organizationProfile = await prisma.organizationProfile.create({
        data: {
          userId: user.id,
          organizationName,
          website: website || '',
          contactMail,
          phone: phone || '',
          companyLocation,
          logo: '',
          verifiedStatus: 'PENDING',
          approved: false, // Not approved by default
          activeStatus: 'ACTIVE',
          ratings: 0
        },
        include: {
          user: true,
          trainings: {
            include: {
              category: true,
              freelancer: {
                include: {
                  user: true
                }
              }
            }
          },
          feedbacks: {
            include: {
              training: true,
              freelancer: {
                include: {
                  user: true
                }
              }
            }
          }
        }
      })

      return organizationProfile
    })

    console.log('Organization created successfully:', { 
      organizationId: result.id, 
      email: result.user.email 
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Organization registered successfully! Please wait for admin approval.',
      data: result 
    })

  } catch (error) {
    console.error('Error creating organization:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal Server Error' 
    }, { status: 500 })
  }
}