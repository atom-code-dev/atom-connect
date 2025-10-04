import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

// GET single maintainer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const maintainer = await db.user.findUnique({
      where: {
        id: id,
        role: UserRole.MAINTAINER
      },
      include: {
        maintainerProfile: true
      }
    })

    if (!maintainer) {
      return NextResponse.json(
        { error: "Maintainer not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(maintainer)
  } catch (error) {
    console.error("Error fetching maintainer:", error)
    return NextResponse.json(
      { error: "Failed to fetch maintainer" },
      { status: 500 }
    )
  }
}

// PUT update maintainer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, status } = body

    const existingMaintainer = await db.user.findUnique({
      where: {
        id: id,
        role: UserRole.MAINTAINER
      }
    })

    if (!existingMaintainer) {
      return NextResponse.json(
        { error: "Maintainer not found" },
        { status: 404 }
      )
    }

    // Check if email is being changed and already exists
    if (email && email !== existingMaintainer.email) {
      const emailExists = await db.user.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        )
      }
    }

    const updatedMaintainer = await db.user.update({
      where: {
        id: id
      },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        // Note: status handling would need to be implemented based on your requirements
      }
    })

    return NextResponse.json(updatedMaintainer)
  } catch (error) {
    console.error("Error updating maintainer:", error)
    return NextResponse.json(
      { error: "Failed to update maintainer" },
      { status: 500 }
    )
  }
}

// DELETE maintainer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const maintainer = await db.user.findUnique({
      where: {
        id: id,
        role: UserRole.MAINTAINER
      }
    })

    if (!maintainer) {
      return NextResponse.json(
        { error: "Maintainer not found" },
        { status: 404 }
      )
    }

    // First delete maintainer profile
    await db.maintainerProfile.delete({
      where: {
        userId: id
      }
    })

    // Then delete user
    await db.user.delete({
      where: {
        id: id
      }
    })

    return NextResponse.json({
      message: "Maintainer deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting maintainer:", error)
    return NextResponse.json(
      { error: "Failed to delete maintainer" },
      { status: 500 }
    )
  }
}

// PATCH for status toggle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    const maintainer = await db.user.findUnique({
      where: {
        id: id,
        role: UserRole.MAINTAINER
      }
    })

    if (!maintainer) {
      return NextResponse.json(
        { error: "Maintainer not found" },
        { status: 404 }
      )
    }

    let updatedProfile

    switch (action) {
      case "activate":
        updatedProfile = await db.maintainerProfile.update({
          where: {
            userId: id
          },
          data: {
            status: "ACTIVE"
          },
          include: {
            user: true
          }
        })
        break

      case "deactivate":
        updatedProfile = await db.maintainerProfile.update({
          where: {
            userId: id
          },
          data: {
            status: "INACTIVE"
          },
          include: {
            user: true
          }
        })
        break

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }

    // Get the full maintainer data with stats
    const [reviewsCount, approvedTrainings, rejectedTrainings] = await Promise.all([
      db.trainingFeedback.count({
        where: {
          userId: id
        }
      }),
      db.training.count({
        where: {
          freelancer: {
            userId: id
          },
          isPublished: true
        }
      }),
      db.training.count({
        where: {
          freelancer: {
            userId: id
          },
          isActive: false
        }
      })
    ])

    const responseData = {
      ...updatedProfile.user,
      maintainerProfile: updatedProfile,
      reviewsCount,
      approvedTrainings,
      rejectedTrainings
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error toggling maintainer status:", error)
    return NextResponse.json(
      { error: "Failed to toggle maintainer status" },
      { status: 500 }
    )
  }
}