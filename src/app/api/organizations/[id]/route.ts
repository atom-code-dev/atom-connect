import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { VerificationStatus, ActiveStatus } from '@prisma/client'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const organization = await db.organizationProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true
          }
        },
        trainings: {
          include: {
            category: true,
            location: true,
            stack: true,
            feedbacks: true
          },
          orderBy: {
            createdAt: 'desc'
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
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    return NextResponse.json(organization)
  } catch (error) {
    console.error('Error fetching organization:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...updateData } = body

    const { id } = await params

    const organization = await db.organizationProfile.findUnique({
      where: { id }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    let updatedOrganization

    switch (action) {
      case 'approve':
        updatedOrganization = await db.organizationProfile.update({
          where: { id },
          data: { verifiedStatus: VerificationStatus.VERIFIED },
          include: {
            user: true,
            trainings: true,
            feedbacks: true
          }
        })
        break

      case 'reject':
        updatedOrganization = await db.organizationProfile.update({
          where: { id },
          data: { verifiedStatus: VerificationStatus.REJECTED },
          include: {
            user: true,
            trainings: true,
            feedbacks: true
          }
        })
        break

      case 'activate':
        updatedOrganization = await db.organizationProfile.update({
          where: { id },
          data: { activeStatus: ActiveStatus.ACTIVE },
          include: {
            user: true,
            trainings: true,
            feedbacks: true
          }
        })
        break

      case 'deactivate':
        updatedOrganization = await db.organizationProfile.update({
          where: { id },
          data: { activeStatus: ActiveStatus.INACTIVE },
          include: {
            user: true,
            trainings: true,
            feedbacks: true
          }
        })
        break

      case 'update':
        updatedOrganization = await db.organizationProfile.update({
          where: { id },
          data: {
            organizationName: updateData.organizationName || organization.organizationName,
            website: updateData.website || organization.website,
            contactMail: updateData.contactMail || organization.contactMail,
            phone: updateData.phone || organization.phone,
            companyLocation: updateData.companyLocation || organization.companyLocation,
            logo: updateData.logo || organization.logo
          },
          include: {
            user: true,
            trainings: true,
            feedbacks: true
          }
        })
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json(updatedOrganization)
  } catch (error) {
    console.error('Error updating organization:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const organization = await db.organizationProfile.findUnique({
      where: { id }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Delete the organization and associated user
    await db.organizationProfile.delete({
      where: { id }
    })

    // Also delete the user account
    await db.user.delete({
      where: { id: organization.userId }
    })

    return NextResponse.json({ message: 'Organization deleted successfully' })
  } catch (error) {
    console.error('Error deleting organization:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}