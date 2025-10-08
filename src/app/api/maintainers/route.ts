import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"

// GET all maintainers
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    const where: any = {
      role: UserRole.MAINTAINER
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ]
    }

    const maintainers = await db.user.findMany({
      where,
      include: {
        maintainerProfile: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Get additional stats for each maintainer
    const maintainersWithStats = await Promise.all(
      maintainers.map(async (maintainer) => {
        const [reviewsCount, approvedTrainings, rejectedTrainings] = await Promise.all([
          db.trainingFeedback.count({
            where: {
              userId: maintainer.id
            }
          }),
          db.training.count({
            where: {
              freelancer: {
                userId: maintainer.id
              },
              isPublished: true
            }
          }),
          db.training.count({
            where: {
              freelancer: {
                userId: maintainer.id
              },
              isActive: false
            }
          })
        ])

        return {
          ...maintainer,
          reviewsCount,
          approvedTrainings,
          rejectedTrainings
        }
      })
    )

    return NextResponse.json(maintainersWithStats)
  } catch (error) {
    console.error("Error fetching maintainers:", error)
    return NextResponse.json(
      { error: "Failed to fetch maintainers" },
      { status: 500 }
    )
  }
}

// POST create new maintainer
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with maintainer role
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: UserRole.MAINTAINER
      }
    })

    // Create maintainer profile
    await db.maintainerProfile.create({
      data: {
        userId: user.id
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error creating maintainer:", error)
    return NextResponse.json(
      { error: "Failed to create maintainer" },
      { status: 500 }
    )
  }
}

// PATCH bulk operations on maintainers
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { ids, action } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid maintainer IDs" },
        { status: 400 }
      )
    }

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case "activate":
        result = await db.maintainerProfile.updateMany({
          where: {
            userId: { in: ids }
          },
          data: {
            status: "ACTIVE"
          }
        })
        break

      case "deactivate":
        result = await db.maintainerProfile.updateMany({
          where: {
            userId: { in: ids }
          },
          data: {
            status: "INACTIVE"
          }
        })
        break

      case "delete":
        // First delete maintainer profiles
        await db.maintainerProfile.deleteMany({
          where: {
            userId: { in: ids }
          }
        })

        // Then delete users
        result = await db.user.deleteMany({
          where: {
            id: { in: ids },
            role: UserRole.MAINTAINER
          }
        })
        break

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }

    return NextResponse.json({
      message: `Successfully ${action}ed ${result.count} maintainers`,
      count: result.count
    })
  } catch (error) {
    console.error("Error performing bulk operation on maintainers:", error)
    return NextResponse.json(
      { error: "Failed to perform bulk operation" },
      { status: 500 }
    )
  }
}