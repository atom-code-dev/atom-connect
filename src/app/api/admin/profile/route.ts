import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import * as bcrypt from 'bcryptjs'
import { z } from 'zod'

// Profile update schema
const AdminProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        adminProfile: true
      }
    })

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const profileData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }

    return NextResponse.json({
      success: true,
      profile: profileData
    })

  } catch (error) {
    console.error('Error fetching admin profile:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = AdminProfileSchema.parse(body)

    // Check if email is already taken by another user
    if (validatedData.email !== session.user.email) {
      const existingUser = await db.user.findFirst({
        where: {
          email: validatedData.email,
          NOT: { id: session.user.id }
        }
      })

      if (existingUser) {
        return NextResponse.json({
          success: false,
          message: 'Email already taken'
        }, { status: 400 })
      }
    }

    // Update user profile
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
      },
      include: {
        adminProfile: true
      }
    })

    const profileData = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: profileData
    })

  } catch (error) {
    console.error('Error updating admin profile:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.issues
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}