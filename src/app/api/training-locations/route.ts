import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('isActive')

    const where: any = {}

    if (search) {
      where.OR = [
        {
          state: {
            contains: search,
            mode: 'insensitive' as const
          }
        },
        {
          district: {
            contains: search,
            mode: 'insensitive' as const
          }
        }
      ]
    }

    if (isActive !== null && isActive !== '') {
      where.isActive = isActive === 'true'
    }

    const locations = await db.trainingLocation.findMany({
      where,
      include: {
        trainings: {
          select: {
            id: true,
            title: true,
            isActive: true
          }
        }
      },
      orderBy: {
        state: 'asc'
      }
    })

    const locationsWithCount = locations.map(location => ({
      ...location,
      trainingsCount: location.trainings.length,
      activeTrainingsCount: location.trainings.filter(t => t.isActive).length
    }))

    return NextResponse.json(locationsWithCount)
  } catch (error) {
    console.error('Error fetching training locations:', error)
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
    const { state, district, isActive = true } = body

    if (!state || !district) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if location with same state and district already exists
    const existingLocation = await db.trainingLocation.findFirst({
      where: {
        state,
        district
      }
    })

    if (existingLocation) {
      return NextResponse.json({ error: 'Location with this state and district already exists' }, { status: 400 })
    }

    const location = await db.trainingLocation.create({
      data: {
        state,
        district,
        isActive
      },
      include: {
        trainings: {
          select: {
            id: true,
            title: true,
            isActive: true
          }
        }
      }
    })

    const locationWithCount = {
      ...location,
      trainingsCount: location.trainings.length,
      activeTrainingsCount: location.trainings.filter(t => t.isActive).length
    }

    return NextResponse.json(locationWithCount, { status: 201 })
  } catch (error) {
    console.error('Error creating training location:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, state, district, isActive } = body

    if (!id || !state || !district) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if location exists
    const existingLocation = await db.trainingLocation.findUnique({
      where: { id }
    })

    if (!existingLocation) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    // Check if another location with same state and district exists
    const locationConflict = await db.trainingLocation.findFirst({
      where: {
        state,
        district,
        id: { not: id }
      }
    })

    if (locationConflict) {
      return NextResponse.json({ error: 'Location with this state and district already exists' }, { status: 400 })
    }

    const location = await db.trainingLocation.update({
      where: { id },
      data: {
        state,
        district,
        isActive
      },
      include: {
        trainings: {
          select: {
            id: true,
            title: true,
            isActive: true
          }
        }
      }
    })

    const locationWithCount = {
      ...location,
      trainingsCount: location.trainings.length,
      activeTrainingsCount: location.trainings.filter(t => t.isActive).length
    }

    return NextResponse.json(locationWithCount)
  } catch (error) {
    console.error('Error updating training location:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Location ID is required' }, { status: 400 })
    }

    // Check if location exists and has associated trainings
    const location = await db.trainingLocation.findUnique({
      where: { id },
      include: {
        trainings: true
      }
    })

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    if (location.trainings.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete location with associated trainings. Please reassign or delete the trainings first.' 
      }, { status: 400 })
    }

    await db.trainingLocation.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Location deleted successfully' })
  } catch (error) {
    console.error('Error deleting training location:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}