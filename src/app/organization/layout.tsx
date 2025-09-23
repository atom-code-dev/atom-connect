import { ReactNode } from 'react'

export default function OrganizationLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r">
          <div className="p-6">
            <h2 className="text-2xl font-bold">Organization Panel</h2>
          </div>
          <nav className="mt-6">
            <div className="px-4 py-2">
              <a href="/organization" className="block px-4 py-2 text-sm hover:bg-accent rounded">
                Dashboard
              </a>
            </div>
            <div className="px-4 py-2">
              <a href="/organization/dashboard/trainings" className="block px-4 py-2 text-sm hover:bg-accent rounded">
                Trainings
              </a>
            </div>
            <div className="px-4 py-2">
              <a href="/organization/dashboard/freelancers" className="block px-4 py-2 text-sm hover:bg-accent rounded">
                Freelancers
              </a>
            </div>
            <div className="px-4 py-2">
              <a href="/organization/dashboard/verification" className="block px-4 py-2 text-sm hover:bg-accent rounded">
                Verification
              </a>
            </div>
          </nav>
        </div>
        
        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}