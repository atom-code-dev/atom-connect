import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

const bcrypt = require('bcryptjs')

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await db.user.findMany({
      include: {
        freelancerProfile: true,
        organizationProfile: true,
        adminProfile: true,
        maintainerProfile: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, password, name, phone, role } = body

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role,
      },
      include: {
        freelancerProfile: true,
        organizationProfile: true,
        adminProfile: true,
        maintainerProfile: true,
      }
    })

    // Create corresponding profile based on role
    switch (role) {
      case 'FREELANCER':
        await db.freelancerProfile.create({
          data: {
            userId: user.id,
            name: name || '',
            email,
            trainerType: 'BOTH',
            experience: '',
          }
        })
        break
      case 'ORGANIZATION':
        await db.organizationProfile.create({
          data: {
            userId: user.id,
            organizationName: name || '',
            contactMail: email,
            companyLocation: '',
          }
        })
        break
      case 'ADMIN':
        await db.adminProfile.create({
          data: {
            userId: user.id,
          }
        })
        break
      case 'MAINTAINER':
        await db.maintainerProfile.create({
          data: {
            userId: user.id,
          }
        })
        break
    }

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userIds, action } = body

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'Invalid user IDs' }, { status: 400 })
    }

    if (!['activate', 'deactivate', 'delete'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    switch (action) {
      case 'activate':
        // Activate freelancer profiles
        await db.freelancerProfile.updateMany({
          where: { userId: { in: userIds } },
          data: { availability: 'AVAILABLE' }
        })
        
        // Activate organization profiles
        await db.organizationProfile.updateMany({
          where: { userId: { in: userIds } },
          data: { activeStatus: 'ACTIVE' }
        })
        break

      case 'deactivate':
        // Deactivate freelancer profiles
        await db.freelancerProfile.updateMany({
          where: { userId: { in: userIds } },
          data: { availability: 'NOT_AVAILABLE' }
        })
        
        // Deactivate organization profiles
        await db.organizationProfile.updateMany({
          where: { userId: { in: userIds } },
          data: { activeStatus: 'INACTIVE' }
        })
        break

      case 'delete':
        // Delete profiles first (due to foreign key constraints)
        await db.freelancerProfile.deleteMany({
          where: { userId: { in: userIds } }
        })
        
        await db.organizationProfile.deleteMany({
          where: { userId: { in: userIds } }
        })
        
        await db.adminProfile.deleteMany({
          where: { userId: { in: userIds } }
        })
        
        await db.maintainerProfile.deleteMany({
          where: { userId: { in: userIds } }
        })
        
        // Delete users
        await db.user.deleteMany({
          where: { id: { in: userIds } }
        })
        break
    }

    return NextResponse.json({ success: true, message: `${action} action completed` })
  } catch (error) {
    console.error('Error performing bulk action:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}