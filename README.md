# 🚀 Welcome to Z.ai Code Scaffold

A modern, production-ready web application scaffold powered by cutting-edge technologies, designed to accelerate your development with [Z.ai](https://chat.z.ai)'s AI-powered coding assistance.

## ✨ Technology Stack

This scaffold provides a robust foundation built with:

### 🎯 Core Framework
- **⚡ Next.js 15** - The React framework for production with App Router
- **📘 TypeScript 5** - Type-safe JavaScript for better developer experience
- **🎨 Tailwind CSS 4** - Utility-first CSS framework for rapid UI development

### 🧩 UI Components & Styling
- **🧩 shadcn/ui** - High-quality, accessible components built on Radix UI
- **🎯 Lucide React** - Beautiful & consistent icon library
- **🌈 Framer Motion** - Production-ready motion library for React
- **🎨 Next Themes** - Perfect dark mode in 2 lines of code

### 📋 Forms & Validation
- **🎣 React Hook Form** - Performant forms with easy validation
- **✅ Zod** - TypeScript-first schema validation

### 🔄 State Management & Data Fetching
- **🐻 Zustand** - Simple, scalable state management
- **🔄 TanStack Query** - Powerful data synchronization for React
- **🌐 Axios** - Promise-based HTTP client

### 🗄️ Database & Backend
- **🗄️ Prisma** - Next-generation Node.js and TypeScript ORM
- **🐘 PostgreSQL** - Production-ready relational database

## 🗄️ Database Setup (PostgreSQL)

This project uses PostgreSQL as the database. Follow these steps to set up your database:

### 1. Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### 2. Create Database and User
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE training_platform;

# Create user (replace with your preferred credentials)
CREATE USER postgres WITH PASSWORD 'password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE training_platform TO postgres;

# Exit psql
\q
```

### 4. Configure Environment Variables
Copy the example environment file and update with your database credentials:

```bash
cp .env.example .env
```

Update the `DATABASE_URL` in your `.env` file:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/training_platform"
```

#### LinkedIn OAuth Configuration (Optional)
For LinkedIn login functionality, add these additional environment variables:

```env
# LinkedIn OAuth (for freelancer login)
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
NEXTAUTH_URL=https://your-domain.com
```

**Important**: The `NEXTAUTH_URL` must match the exact URL where your application is hosted, including the protocol (http/https). This is required for OAuth callbacks to work properly.

For development on localhost:
```env
NEXTAUTH_URL=http://localhost:3000
```

For production deployment, use your actual domain:
```env
NEXTAUTH_URL=https://your-domain.com
```

### 5. Run Database Migrations
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Run seed data
npm run db:seed
```

### 6. Verify Database Connection
```bash
# Test the connection
npm run db:push
```

If successful, you should see no errors and the database schema will be created.

### 🎨 Advanced UI Features
- **📊 Recharts** - Redefined chart library built with React and D3
- **🖼️ Sharp** - High performance image processing

### 🌍 Internationalization & Utilities
- **📅 Date-fns** - Modern JavaScript date utility library

## 🎯 Why This Scaffold?

- **🏎️ Fast Development** - Pre-configured tooling and best practices
- **🎨 Beautiful UI** - Complete shadcn/ui component library with advanced interactions
- **🔒 Type Safety** - Full TypeScript configuration with Zod validation
- **📱 Responsive** - Mobile-first design principles with smooth animations
- **🗄️ Database Ready** - Prisma ORM configured for rapid backend development
- **📊 Data Visualization** - Charts and tables functionality
- **🚀 Production Ready** - Optimized build and deployment settings
- **🤖 AI-Friendly** - Structured codebase perfect for AI assistance

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see your application running.

## 🤖 Powered by Z.ai

This scaffold is optimized for use with [Z.ai](https://chat.z.ai) - your AI assistant for:

- **💻 Code Generation** - Generate components, pages, and features instantly
- **🎨 UI Development** - Create beautiful interfaces with AI assistance  
- **🔧 Bug Fixing** - Identify and resolve issues with intelligent suggestions
- **📝 Documentation** - Auto-generate comprehensive documentation
- **🚀 Optimization** - Performance improvements and best practices

Ready to build something amazing? Start chatting with Z.ai at [chat.z.ai](https://chat.z.ai) and experience the future of AI-powered development!

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable React components
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom React hooks
└── lib/                # Utility functions and configurations
```

## 📚 API Documentation

This section provides comprehensive documentation for all API endpoints available in the Atom Connect application.

### 🔐 Authentication APIs

#### NextAuth Authentication
**Base URL**: `/api/auth/[...nextauth]`

**Methods**: `GET`, `POST`

**Description**: Handles all authentication flows including credentials login, OAuth providers, and session management.

**Endpoints**:
- `/api/auth/signin` - Sign in page
- `/api/auth/signout` - Sign out
- `/api/auth/callback` - OAuth callback handler
- `/api/auth/session` - Get current session
- `/api/auth/csrf` - CSRF token for form protection

**Providers**:
- **Credentials**: Email/password authentication
- **LinkedIn**: OAuth authentication for freelancers only

**Example Request (Credentials Login)**:
```bash
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password",
    "role": "FREELANCER"
  }'
```

**Example Response (Success)**:
```json
{
  "user": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "FREELANCER",
    "isNewUser": false
  },
  "expires": "2024-12-31T23:59:59.999Z"
}
```

#### Reset Password
**Endpoint**: `POST /api/auth/reset-password`

**Description**: Allows authenticated users to reset their password (available for non-freelancer roles only).

**Request Body**:
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456",
  "confirmPassword": "newPassword456"
}
```

**Example Response**:
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### 👥 User Management APIs

#### Get All Users
**Endpoint**: `GET /api/users`

**Description**: Retrieve a list of all users (admin access required).

**Query Parameters**:
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `role` (optional): Filter by user role

**Example Response**:
```json
{
  "users": [
    {
      "id": "clx1234567890",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "FREELANCER",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "freelancerProfile": {
        "name": "John Doe",
        "skills": ["React", "Node.js"],
        "experienceLevel": "advanced"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

### 🏢 Organization APIs

#### Get Organizations
**Endpoint**: `GET /api/organizations`

**Description**: Retrieve a list of all organizations.

**Example Response**:
```json
{
  "organizations": [
    {
      "id": "clx1234567890",
      "organizationName": "Tech Corp",
      "website": "https://techcorp.com",
      "contactMail": "contact@techcorp.com",
      "verifiedStatus": "VERIFIED",
      "companyLocation": "Bangalore, India",
      "ratings": 4.5
    }
  ]
}
```

#### Register Organization
**Endpoint**: `POST /api/organizations/register`

**Description**: Register a new organization.

**Request Body**:
```json
{
  "organizationName": "Tech Corp",
  "website": "https://techcorp.com",
  "contactMail": "contact@techcorp.com",
  "phone": "+1234567890",
  "companyLocation": "Bangalore, India",
  "adminEmail": "admin@techcorp.com",
  "adminPassword": "password123"
}
```

**Example Response**:
```json
{
  "success": true,
  "message": "Organization registered successfully",
  "organization": {
    "id": "clx1234567890",
    "organizationName": "Tech Corp",
    "verifiedStatus": "PENDING"
  }
}
```

#### Get Organization by ID
**Endpoint**: `GET /api/organizations/[id]`

**Description**: Get organization details by ID.

**Example Response**:
```json
{
  "organization": {
    "id": "clx1234567890",
    "organizationName": "Tech Corp",
    "website": "https://techcorp.com",
    "contactMail": "contact@techcorp.com",
    "verifiedStatus": "VERIFIED",
    "companyLocation": "Bangalore, India",
    "ratings": 4.5,
    "trainings": [
      {
        "id": "clx0987654321",
        "title": "React.js Training",
        "startDate": "2024-02-01T00:00:00.000Z",
        "endDate": "2024-02-05T00:00:00.000Z"
      }
    ]
  }
}
```

### 🎓 Freelancer APIs

#### Get Freelancers
**Endpoint**: `GET /api/freelancers`

**Description**: Retrieve a list of all freelancers.

**Example Response**:
```json
{
  "freelancers": [
    {
      "id": "clx1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "skills": ["React", "Node.js", "TypeScript"],
      "experienceLevel": "advanced",
      "availability": "AVAILABLE",
      "location": "Bangalore, India",
      "hourlyRate": 5000,
      "profileCompleted": true
    }
  ]
}
```

#### Complete Freelancer Profile
**Endpoint**: `POST /api/freelancers/complete-profile`

**Description**: Complete freelancer profile for new LinkedIn users.

**Authentication**: Required (Freelancer only)

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "location": "Bangalore, India",
  "bio": "Experienced full-stack developer with 5+ years of experience",
  "skills": ["React", "Node.js", "TypeScript", "Python"],
  "experience": "5+ years in web development",
  "experienceLevel": "advanced",
  "availability": "full-time",
  "hourlyRate": "5000",
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "portfolioUrl": "https://johndoe.dev"
}
```

**Example Response**:
```json
{
  "success": true,
  "message": "Profile completed successfully",
  "user": {
    "id": "clx1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "FREELANCER",
    "freelancerProfile": {
      "name": "John Doe",
      "bio": "Experienced full-stack developer with 5+ years of experience",
      "skills": ["React", "Node.js", "TypeScript", "Python"],
      "experienceLevel": "advanced",
      "profileCompleted": true
    }
  }
}
```

### 👨‍🏫 Maintainer APIs

#### Get Maintainers
**Endpoint**: `GET /api/maintainers`

**Description**: Retrieve a list of all maintainers.

**Example Response**:
```json
{
  "maintainers": [
    {
      "id": "clx1234567890",
      "user": {
        "id": "clx1234567890",
        "email": "maintainer@example.com",
        "name": "Jane Smith",
        "role": "MAINTAINER"
      },
      "status": "ACTIVE"
    }
  ]
}
```

#### Get Maintainer by ID
**Endpoint**: `GET /api/maintainers/[id]`

**Description**: Get maintainer details by ID.

**Example Response**:
```json
{
  "maintainer": {
    "id": "clx1234567890",
    "user": {
      "id": "clx1234567890",
      "email": "maintainer@example.com",
      "name": "Jane Smith",
      "role": "MAINTAINER"
    },
    "status": "ACTIVE",
    "reviews": [
      {
        "id": "clx0987654321",
        "rating": 4.5,
        "comments": "Excellent maintainer service"
      }
    ]
  }
}
```

### 🎯 Training APIs

#### Get Trainings
**Endpoint**: `GET /api/trainings`

**Description**: Retrieve a list of all training postings.

**Query Parameters**:
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `category` (optional): Filter by training category
- `location` (optional): Filter by location
- `status` (optional): Filter by status (published/unpublished)

**Example Response**:
```json
{
  "trainings": [
    {
      "id": "clx1234567890",
      "title": "React.js Advanced Training",
      "description": "Advanced React.js concepts and best practices",
      "skills": ["React", "JavaScript", "TypeScript"],
      "category": {
        "id": "clx0987654321",
        "name": "FRAMEWORKS"
      },
      "type": "CORPORATE",
      "location": {
        "state": "Karnataka",
        "district": "Bangalore"
      },
      "stack": {
        "id": "clx1122334455",
        "name": "React"
      },
      "companyName": "Tech Corp",
      "startDate": "2024-02-01T00:00:00.000Z",
      "endDate": "2024-02-05T00:00:00.000Z",
      "mode": "OFFLINE",
      "contractType": "PER_DAY",
      "experienceMin": 3,
      "experienceMax": 5,
      "openings": 2,
      "paymentAmount": 50000,
      "isPublished": true,
      "organization": {
        "organizationName": "Tech Corp",
        "companyLocation": "Bangalore, India"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15
  }
}
```

### 📊 Training Category APIs

#### Get Training Categories
**Endpoint**: `GET /api/training-categories`

**Description**: Retrieve all training categories.

**Example Response**:
```json
{
  "categories": [
    {
      "id": "clx1234567890",
      "name": "SOFT_SKILLS",
      "description": "Soft skills and interpersonal training"
    },
    {
      "id": "clx0987654321",
      "name": "FUNDAMENTALS",
      "description": "Fundamental programming concepts"
    },
    {
      "id": "clx1122334455",
      "name": "FRAMEWORKS",
      "description": "Framework-specific training programs"
    }
  ]
}
```

#### Bulk Import Training Categories
**Endpoint**: `POST /api/training-categories/bulk-import`

**Description**: Import multiple training categories at once.

**Authentication**: Required (Admin only)

**Request Body**:
```json
{
  "categories": [
    {
      "name": "DEVOPS",
      "description": "DevOps and deployment training"
    },
    {
      "name": "DATA_SCIENCE",
      "description": "Data science and machine learning"
    }
  ]
}
```

**Example Response**:
```json
{
  "success": true,
  "message": "Categories imported successfully",
  "imported": 2,
  "failed": 0
}
```

### 🗺️ Training Location APIs

#### Get Training Locations
**Endpoint**: `GET /api/training-locations`

**Description**: Retrieve all training locations (states and districts).

**Query Parameters**:
- `state` (optional): Filter by state
- `active` (optional): Filter by active status (true/false)

**Example Response**:
```json
{
  "locations": [
    {
      "id": "clx1234567890",
      "state": "Karnataka",
      "district": "Bangalore",
      "isActive": true
    },
    {
      "id": "clx0987654321",
      "state": "Maharashtra",
      "district": "Mumbai",
      "isActive": true
    }
  ]
}
```

### 📚 Stack APIs

#### Get Stacks
**Endpoint**: `GET /api/stacks`

**Description**: Retrieve all technology stacks and frameworks.

**Example Response**:
```json
{
  "stacks": [
    {
      "id": "clx1234567890",
      "name": "React",
      "description": "JavaScript library for building user interfaces"
    },
    {
      "id": "clx0987654321",
      "name": "Node.js",
      "description": "JavaScript runtime built on Chrome's V8 engine"
    },
    {
      "id": "clx1122334455",
      "name": "Python",
      "description": "High-level programming language"
    }
  ]
}
```

### 📈 Admin Dashboard APIs

#### Get Dashboard Stats
**Endpoint**: `GET /api/admin/dashboard/stats`

**Description**: Get administrative dashboard statistics.

**Authentication**: Required (Admin only)

**Example Response**:
```json
{
  "stats": {
    "totalUsers": 150,
    "totalOrganizations": 25,
    "totalFreelancers": 100,
    "totalMaintainers": 10,
    "totalTrainings": 75,
    "publishedTrainings": 60,
    "pendingOrganizations": 5,
    "activeUsers": 120
  }
}
```

#### Get Admin Profile
**Endpoint**: `GET /api/admin/profile`

**Description**: Get current admin user profile.

**Authentication**: Required (Admin only)

**Example Response**:
```json
{
  "admin": {
    "id": "clx1234567890",
    "user": {
      "id": "clx1234567890",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "ADMIN"
    }
  }
}
```

### 🔍 Health Check API

#### Health Check
**Endpoint**: `GET /api/health`

**Description**: Basic health check endpoint to verify the API is running.

**Example Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "database": "connected"
}
```

### 📋 API Response Formats

#### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource was not found"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Validation Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      },
      {
        "field": "password",
        "message": "Password must be at least 6 characters"
      }
    ]
  }
}
```

### 🔑 Authentication Headers

Most API endpoints require authentication. Include the session token in your requests:

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Cookie: next-auth.session-token=your_session_token"
```

### 📊 Pagination

List endpoints support pagination with the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Example**:
```bash
curl -X GET "http://localhost:3000/api/users?page=2&limit=20"
```

### 🔍 Filtering and Search

Many endpoints support filtering and search functionality:

```bash
# Filter by role
curl -X GET "http://localhost:3000/api/users?role=FREELANCER"

# Search by name
curl -X GET "http://localhost:3000/api/trainings?search=react"

# Filter by location
curl -X GET "http://localhost:3000/api/training-locations?state=Karnataka"
```

### 🚨 Error Codes

| HTTP Status | Error Code | Description |
|-------------|-------------|-------------|
| 200 | OK | Request successful |
| 201 | CREATED | Resource created successfully |
| 400 | BAD_REQUEST | Invalid request parameters |
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 422 | VALIDATION_ERROR | Request validation failed |
| 500 | INTERNAL_ERROR | Server error |

### 🔄 Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Default limit**: 100 requests per minute per IP
- **Authenticated users**: 1000 requests per minute
- **Admin users**: No rate limiting

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```


## 🎨 Available Features & Components

This scaffold includes a comprehensive set of modern web development tools:

### 🧩 UI Components (shadcn/ui)
- **Layout**: Card, Separator
- **Forms**: Input, Textarea, Select
- **Feedback**: Alert, Toast (Sonner)
- **Navigation**: Pagination
- **Overlay**: Dialog, Sheet, Popover, Tooltip
- **Data Display**: Badge, Calendar

### 📊 Advanced Data Features
- **Tables**: Powerful data tables with sorting, filtering, pagination
- **Charts**: Beautiful visualizations with Recharts
- **Forms**: Type-safe forms with React Hook Form + Zod validation

### 🎨 Interactive Features
- **Animations**: Smooth micro-interactions with Framer Motion
- **Theme Switching**: Built-in dark/light mode support

### 🔐 Backend Integration
- **Database**: Type-safe database operations with Prisma
- **API Client**: HTTP requests with Axios
- **State Management**: Simple and scalable with Zustand

### 🌍 Production Features
- **Image Optimization**: Automatic image processing with Sharp
- **Type Safety**: End-to-end TypeScript with Zod validation

## 🤝 Get Started with Z.ai

1. **Clone this scaffold** to jumpstart your project
2. **Visit [chat.z.ai](https://chat.z.ai)** to access your AI coding assistant
3. **Start building** with intelligent code generation and assistance
4. **Deploy with confidence** using the production-ready setup

---

Built with ❤️ for the developer community. Supercharged by [Z.ai](https://chat.z.ai) 🚀
