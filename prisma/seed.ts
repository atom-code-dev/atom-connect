import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10),
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  const freelancerUser = await prisma.user.create({
    data: {
      email: 'freelancer@example.com',
      password: await bcrypt.hash('freelancer123', 10),
      name: 'John Doe',
      role: 'FREELANCER',
    },
  })

  const organizationUser = await prisma.user.create({
    data: {
      email: 'organization@example.com',
      password: await bcrypt.hash('organization123', 10),
      name: 'TechCorp Solutions',
      role: 'ORGANIZATION',
    },
  })

  const maintainerUser = await prisma.user.create({
    data: {
      email: 'maintainer@example.com',
      password: await bcrypt.hash('maintainer123', 10),
      name: 'Alice Johnson',
      role: 'MAINTAINER',
    },
  })

  // Create profiles
  await prisma.adminProfile.create({
    data: {
      userId: adminUser.id,
    },
  })

  const freelancerProfile = await prisma.freelancerProfile.create({
    data: {
      userId: freelancerUser.id,
      name: 'John Doe',
      email: 'freelancer@example.com',
      phone: '+1234567890',
      skills: JSON.stringify(['JavaScript', 'React', 'Node.js', 'TypeScript']),
      trainerType: 'BOTH',
      experience: '5+ years of experience in web development and training',
      linkedinProfile: 'https://linkedin.com/in/johndoe',
      activity: 'Full-stack developer and trainer specializing in modern web technologies',
      location: 'New York, NY',
      profileCompleted: true,
    },
  })

  const organizationProfile = await prisma.organizationProfile.create({
    data: {
      userId: organizationUser.id,
      organizationName: 'TechCorp Solutions',
      website: 'https://techcorp.com',
      contactMail: 'contact@techcorp.com',
      phone: '+1234567890',
      companyLocation: 'San Francisco, CA',
      ratings: 4.5,
    },
  })

  await prisma.maintainerProfile.create({
    data: {
      userId: maintainerUser.id,
    },
  })

  // Create training categories
  const softSkillsCategory = await prisma.trainingCategory.create({
    data: {
      name: 'Soft Skills',
      description: 'Communication, teamwork, and interpersonal skills',
    },
  })

  const fundamentalsCategory = await prisma.trainingCategory.create({
    data: {
      name: 'Fundamentals',
      description: 'Basic programming concepts and computer science fundamentals',
    },
  })

  const frameworksCategory = await prisma.trainingCategory.create({
    data: {
      name: 'Frameworks',
      description: 'Modern web frameworks and libraries',
    },
  })

  // Create training locations
  const nyLocation = await prisma.trainingLocation.create({
    data: {
      state: 'New York',
      district: 'Manhattan',
    },
  })

  const sfLocation = await prisma.trainingLocation.create({
    data: {
      state: 'California',
      district: 'San Francisco',
    },
  })

  // Create stacks
  const reactStack = await prisma.stack.create({
    data: {
      name: 'React',
      description: 'A JavaScript library for building user interfaces',
    },
  })

  const nodeStack = await prisma.stack.create({
    data: {
      name: 'Node.js',
      description: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine',
    },
  })

  // Create trainings
  await prisma.training.create({
    data: {
      title: 'React Advanced Training',
      description: 'Advanced React concepts including hooks, context, and performance optimization',
      skills: JSON.stringify(['React', 'JavaScript', 'TypeScript']),
      categoryId: frameworksCategory.id,
      type: 'CORPORATE',
      locationId: sfLocation.id,
      stackId: reactStack.id,
      companyName: 'TechCorp Solutions',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-02-05'),
      paymentTerm: 30,
      paymentAmount: 5000,
      isPublished: true,
      organizationId: organizationProfile.id,
      freelancerId: freelancerProfile.id,
    },
  })

  await prisma.training.create({
    data: {
      title: 'Soft Skills Workshop',
      description: 'Improve your communication and teamwork skills',
      skills: JSON.stringify(['Communication', 'Teamwork', 'Leadership']),
      categoryId: softSkillsCategory.id,
      type: 'CORPORATE',
      locationId: nyLocation.id,
      stackId: reactStack.id,
      companyName: 'TechCorp Solutions',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-03-02'),
      paymentTerm: 15,
      paymentAmount: 2000,
      isPublished: true,
      organizationId: organizationProfile.id,
    },
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })