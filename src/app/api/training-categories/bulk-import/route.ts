import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { TrainingCategorySchema } from '@/schema'
import * as z from 'zod'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { categories } = body

    if (!Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json({ error: 'Invalid categories data' }, { status: 400 })
    }

    let importedCount = 0
    let skippedCount = 0
    const errors = []

    for (const categoryData of categories) {
      try {
        // Validate category data using Zod schema
        const validatedData = TrainingCategorySchema.parse(categoryData)
        
        // Check if category already exists
        const existingCategory = await db.trainingCategory.findUnique({
          where: { name: validatedData.name }
        })

        if (existingCategory) {
          skippedCount++
          continue
        }

        // Create new category
        await db.trainingCategory.create({
          data: validatedData
        })

        importedCount++
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push(`Invalid data for category "${categoryData.name}": ${error.errors[0].message}`)
        } else {
          errors.push(`Failed to import category "${categoryData.name}": ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
        skippedCount++
      }
    }

    return NextResponse.json({
      success: true,
      importedCount,
      skippedCount,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Error bulk importing categories:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}