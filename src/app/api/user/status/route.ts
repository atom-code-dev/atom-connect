import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizationProfile: true,
        freelancerProfile: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let statusData = {
      type: 'approved' as 'approved' | 'pending' | 'rejected' | 'disabled',
      role: user.role,
      message: 'Your account is active and approved.',
      details: '',
      rejectionReason: undefined as string | undefined
    }

    // Check organization status
    if (user.role === 'ORGANIZATION' && user.organizationProfile) {
      const orgProfile = user.organizationProfile
      
      if (orgProfile.activeStatus === 'INACTIVE') {
        statusData = {
          type: 'disabled' as const,
          role: user.role,
          message: 'Your organization account has been disabled by the administrator.',
          details: 'Please contact support for more information.',
          rejectionReason: undefined
        }
      } else if (!orgProfile.approved) {
        if (orgProfile.verifiedStatus === 'REJECTED') {
          statusData = {
            type: 'rejected' as const,
            role: user.role,
            message: 'Your organization registration has been rejected.',
            details: 'Please review the rejection reason and contact support if needed.',
            rejectionReason: orgProfile.rejectionReason || 'No specific reason provided.'
          }
        } else {
          statusData = {
            type: 'pending' as const,
            role: user.role,
            message: 'Your organization registration is pending approval.',
            details: 'Please wait for an administrator or maintainer to review and approve your registration.',
            rejectionReason: undefined
          }
        }
      } else {
        statusData = {
          type: 'approved' as const,
          role: user.role,
          message: 'Your organization has been approved! You can now post training opportunities.',
          details: 'Welcome to Atom Connect! You can now create and manage training postings.',
          rejectionReason: undefined
        }
      }
    }

    // Check freelancer status
    if (user.role === 'FREELANCER' && user.freelancerProfile) {
      const freelancerProfile = user.freelancerProfile
      
      if (freelancerProfile.activeStatus === 'INACTIVE') {
        statusData = {
          type: 'disabled' as const,
          role: user.role,
          message: 'Your freelancer account has been disabled by the administrator.',
          details: 'Please contact support for more information.',
          rejectionReason: undefined
        }
      } else {
        statusData = {
          type: 'approved' as const,
          role: user.role,
          message: 'Your freelancer account is active.',
          details: 'You can browse and apply for training opportunities.',
          rejectionReason: undefined
        }
      }
    }

    return NextResponse.json(statusData)

  } catch (error) {
    console.error('Error fetching user status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}