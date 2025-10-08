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
      companyLocation
    } = body

    // Validate email domain first
    const emailValidation = validateEmailDomain(email)
    if (!emailValidation.isValid) {
      return NextResponse.json({ 
        success: false, 
        error: emailValidation.error 
      }, { status: 400 })
    }

    // Validate required fields
    if (!email || !password || !organizationName || !contactMail || !companyLocation) {
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
      where: { email }
    })

    if (existingUser) {
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
          email,
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

    return NextResponse.json({ 
      success: true, 
      message: 'Organization registered successfully. Please wait for admin approval.',
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