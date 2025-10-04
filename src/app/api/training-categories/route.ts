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

    if (isActive !== null && isActive !== '') {
      where.isActive = isActive === 'true'
    }

    const categories = await db.trainingCategory.findMany({
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
        createdAt: 'desc'
      }
    })

    const categoriesWithCount = categories.map(category => ({
      ...category,
      trainingsCount: category.trainings.length,
      activeTrainingsCount: category.trainings.filter(t => t.isActive).length
    }))

    return NextResponse.json(categoriesWithCount)
  } catch (error) {
    console.error('Error fetching training categories:', error)
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
    const { name, description, isActive = true } = body

    if (!name || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if category with same name already exists
    const existingCategory = await db.trainingCategory.findUnique({
      where: { name }
    })

    if (existingCategory) {
      return NextResponse.json({ error: 'Category with this name already exists' }, { status: 400 })
    }

    const category = await db.trainingCategory.create({
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

    const categoryWithCount = {
      ...category,
      trainingsCount: category.trainings.length,
      activeTrainingsCount: category.trainings.filter(t => t.isActive).length
    }

    return NextResponse.json(categoryWithCount, { status: 201 })
  } catch (error) {
    console.error('Error creating training category:', error)
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
    const { id, name, description, isActive } = body

    if (!id || !name || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if category exists
    const existingCategory = await db.trainingCategory.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check if another category with same name exists
    const nameConflict = await db.trainingCategory.findFirst({
      where: {
        name,
        id: { not: id }
      }
    })

    if (nameConflict) {
      return NextResponse.json({ error: 'Category with this name already exists' }, { status: 400 })
    }

    const category = await db.trainingCategory.update({
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

    const categoryWithCount = {
      ...category,
      trainingsCount: category.trainings.length,
      activeTrainingsCount: category.trainings.filter(t => t.isActive).length
    }

    return NextResponse.json(categoryWithCount)
  } catch (error) {
    console.error('Error updating training category:', error)
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
    const { categoryIds, action } = body

    if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return NextResponse.json({ error: 'Invalid category IDs' }, { status: 400 })
    }

    const validActions = ['delete']
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    switch (action) {
      case 'delete':
        // Check if categories have associated trainings
        const categoriesWithTrainings = await db.trainingCategory.findMany({
          where: { 
            id: { in: categoryIds },
            trainings: { some: {} }
          }
        })

        if (categoriesWithTrainings.length > 0) {
          return NextResponse.json({ 
            error: 'Cannot delete categories with associated trainings. Please reassign or delete the trainings first.' 
          }, { status: 400 })
        }

        await db.trainingCategory.deleteMany({
          where: { id: { in: categoryIds } }
        })
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: `${action} action completed` })
  } catch (error) {
    console.error('Error performing bulk action on training categories:', error)
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
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    // Check if category exists and has associated trainings
    const category = await db.trainingCategory.findUnique({
      where: { id },
      include: {
        trainings: true
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (category.trainings.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete category with associated trainings. Please reassign or delete the trainings first.' 
      }, { status: 400 })
    }

    await db.trainingCategory.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting training category:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}