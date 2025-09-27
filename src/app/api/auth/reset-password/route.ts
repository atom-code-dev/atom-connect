import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as bcrypt from 'bcryptjs'
import { z } from 'zod'

// Reset password request schema
const ResetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'FREELANCER', 'ORGANIZATION', 'MAINTAINER'])
})

// Update password schema
const UpdatePasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'request') {
      // Handle password reset request
      const validatedData = ResetPasswordSchema.parse(body)
      
      // Find user by email and role
      const user = await db.user.findFirst({
        where: {
          email: validatedData.email,
          role: validatedData.role
        }
      })

      if (!user) {
        // Return success even if user doesn't exist to prevent email enumeration
        return NextResponse.json({
          message: 'If an account with this email exists, you will receive a password reset link.',
          success: true
        })
      }

      // Generate a simple reset token (in production, use a more secure method)
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

      // Store the reset token in the user's profile (we'll use a simple approach)
      // In a real application, you might want a separate table for reset tokens
      await db.user.update({
        where: { id: user.id },
        data: {
          // Store the reset token in the name field temporarily (for demo purposes)
          // In production, you should add proper fields to the User model
          name: `${user.name || ''}|${resetToken}|${resetTokenExpiry.getTime()}`
        }
      })

      // In a real application, you would send an email with the reset link
      // For demo purposes, we'll return the token directly
      console.log(`Reset token for ${user.email}: ${resetToken}`)

      return NextResponse.json({
        message: 'If an account with this email exists, you will receive a password reset link.',
        success: true,
        // For demo purposes only - remove in production
        debugToken: resetToken
      })

    } else if (action === 'reset') {
      // Handle password reset
      const validatedData = UpdatePasswordSchema.parse(body)

      // Find user by reset token
      const users = await db.user.findMany()
      let targetUser = null

      for (const user of users) {
        const nameParts = (user.name || '').split('|')
        if (nameParts.length === 3 && nameParts[1] === validatedData.token) {
          const expiryTime = parseInt(nameParts[2])
          if (expiryTime > Date.now()) {
            targetUser = user
            break
          }
        }
      }

      if (!targetUser) {
        return NextResponse.json({
          message: 'Invalid or expired reset token',
          success: false
        }, { status: 400 })
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10)

      // Update user password and clear reset token
      const originalName = (targetUser.name || '').split('|')[0]
      await db.user.update({
        where: { id: targetUser.id },
        data: {
          password: hashedPassword,
          name: originalName || targetUser.name
        }
      })

      return NextResponse.json({
        message: 'Password has been reset successfully',
        success: true
      })

    } else {
      return NextResponse.json({
        message: 'Invalid action',
        success: false
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Password reset error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        message: 'Validation error',
        errors: error.errors,
        success: false
      }, { status: 400 })
    }

    return NextResponse.json({
      message: 'Internal server error',
      success: false
    }, { status: 500 })
  }
}