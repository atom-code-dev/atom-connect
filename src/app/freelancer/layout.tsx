import { ReactNode } from 'react'

export default function FreelancerLayout({
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
            <h2 className="text-2xl font-bold">Freelancer Panel</h2>
          </div>
          <nav className="mt-6">
            <div className="px-4 py-2">
              <a href="/freelancer" className="block px-4 py-2 text-sm hover:bg-accent rounded">
                Dashboard
              </a>
            </div>
            <div className="px-4 py-2">
              <a href="/freelancer/dashboard/trainings" className="block px-4 py-2 text-sm hover:bg-accent rounded">
                Trainings
              </a>
            </div>
            <div className="px-4 py-2">
              <a href="/freelancer/dashboard/availability" className="block px-4 py-2 text-sm hover:bg-accent rounded">
                Availability
              </a>
            </div>
            <div className="px-4 py-2">
              <a href="/freelancer/dashboard/feedback" className="block px-4 py-2 text-sm hover:bg-accent rounded">
                Feedback
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