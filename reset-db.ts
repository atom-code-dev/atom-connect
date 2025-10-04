import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetDatabase() {
  console.log('🔄 Starting database reset...')
  
  try {
    // Step 1: Drop all tables and recreate the schema
    console.log('🗑️  Dropping all tables...')
    execSync('npx prisma migrate reset --force', { stdio: 'inherit' })
    
    // Step 2: Push the schema to ensure it's up to date
    console.log('📊 Pushing schema to database...')
    execSync('npx prisma db push', { stdio: 'inherit' })
    
    // Step 3: Generate Prisma client
    console.log('🔧 Generating Prisma client...')
    execSync('npx prisma generate', { stdio: 'inherit' })
    
    // Step 4: Run the seed script
    console.log('🌱 Seeding database with initial data...')
    execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' })
    
    console.log('✅ Database reset and seeded successfully!')
    
  } catch (error) {
    console.error('❌ Error resetting database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

resetDatabase()