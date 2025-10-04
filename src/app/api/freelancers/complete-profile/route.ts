import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import * as bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "FREELANCER") {
      return NextResponse.json({ success: false, message: "Only freelancers can complete profile" }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      email,
      phone,
      location,
      bio,
      skills,
      experience,
      availability,
      hourlyRate,
      linkedinUrl,
      portfolioUrl,
    } = body

    // Validate required fields
    if (!name || !email || !location || !bio || !skills || !experience || !availability || !hourlyRate) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Update user and freelancer profile
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
        phone,
        freelancerProfile: {
          update: {
            name,
            email,
            phone,
            location,
            bio,
            skills,
            experience,
            availability,
            hourlyRate: parseInt(hourlyRate),
            linkedinUrl,
            portfolioUrl,
            profileCompleted: true,
          }
        }
      },
      include: {
        freelancerProfile: true
      }
    })

    return NextResponse.json({
      success: true,
      message: "Profile completed successfully",
      user: updatedUser
    })

  } catch (error) {
    console.error("Complete profile error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}