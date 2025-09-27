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

    const where: any = {}

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive' as const
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive' as const
          }
        }
      ]
    }

    const stacks = await db.stack.findMany({
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
        name: 'asc'
      }
    })

    const stacksWithCount = stacks.map(stack => ({
      ...stack,
      trainingsCount: stack.trainings.length,
      activeTrainingsCount: stack.trainings.filter(t => t.isActive).length
    }))

    return NextResponse.json(stacksWithCount)
  } catch (error) {
    console.error('Error fetching stacks:', error)
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
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if stack with same name already exists
    const existingStack = await db.stack.findUnique({
      where: { name }
    })

    if (existingStack) {
      return NextResponse.json({ error: 'Stack with this name already exists' }, { status: 400 })
    }

    const stack = await db.stack.create({
      data: {
        name,
        description
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

    const stackWithCount = {
      ...stack,
      trainingsCount: stack.trainings.length,
      activeTrainingsCount: stack.trainings.filter(t => t.isActive).length
    }

    return NextResponse.json(stackWithCount, { status: 201 })
  } catch (error) {
    console.error('Error creating stack:', error)
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
    const { id, name, description } = body

    if (!id || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if stack exists
    const existingStack = await db.stack.findUnique({
      where: { id }
    })

    if (!existingStack) {
      return NextResponse.json({ error: 'Stack not found' }, { status: 404 })
    }

    // Check if another stack with same name exists
    const nameConflict = await db.stack.findFirst({
      where: {
        name,
        id: { not: id }
      }
    })

    if (nameConflict) {
      return NextResponse.json({ error: 'Stack with this name already exists' }, { status: 400 })
    }

    const stack = await db.stack.update({
      where: { id },
      data: {
        name,
        description
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

    const stackWithCount = {
      ...stack,
      trainingsCount: stack.trainings.length,
      activeTrainingsCount: stack.trainings.filter(t => t.isActive).length
    }

    return NextResponse.json(stackWithCount)
  } catch (error) {
    console.error('Error updating stack:', error)
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
    const { stackIds, action } = body

    if (!stackIds || !Array.isArray(stackIds) || stackIds.length === 0) {
      return NextResponse.json({ error: 'Invalid stack IDs' }, { status: 400 })
    }

    const validActions = ['delete']
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    switch (action) {
      case 'delete':
        // Check if stacks have associated trainings
        const stacksWithTrainings = await db.stack.findMany({
          where: { 
            id: { in: stackIds },
            trainings: { some: {} }
          }
        })

        if (stacksWithTrainings.length > 0) {
          return NextResponse.json({ 
            error: 'Cannot delete stacks with associated trainings. Please reassign or delete the trainings first.' 
          }, { status: 400 })
        }

        await db.stack.deleteMany({
          where: { id: { in: stackIds } }
        })
        break
    }

    return NextResponse.json({ success: true, message: `${action} action completed` })
  } catch (error) {
    console.error('Error performing bulk action on stacks:', error)
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
      return NextResponse.json({ error: 'Stack ID is required' }, { status: 400 })
    }

    // Check if stack exists and has associated trainings
    const stack = await db.stack.findUnique({
      where: { id },
      include: {
        trainings: true
      }
    })

    if (!stack) {
      return NextResponse.json({ error: 'Stack not found' }, { status: 404 })
    }

    if (stack.trainings.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete stack with associated trainings. Please reassign or delete the trainings first.' 
      }, { status: 400 })
    }

    await db.stack.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Stack deleted successfully' })
  } catch (error) {
    console.error('Error deleting stack:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}