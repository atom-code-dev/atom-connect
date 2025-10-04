"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Building2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import Link from "next/link"

// List of restricted email domains (personal email providers)
const RESTRICTED_DOMAINS = [
  // Gmail
  'gmail.com',
  // Yahoo Mail
  'yahoo.com', 'ymail.com', 'rocketmail.com',
  // Outlook
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  // iCloud Mail
  'icloud.com', 'me.com', 'mac.com',
  // AOL Mail
  'aol.com',
  // Zoho Mail
  'zoho.com',
  // GMX Mail
  'gmx.com', 'gmx.us',
  // ProtonMail
  'protonmail.com', 'pm.me',
  // Tutanota
  'tutanota.com', 'tutanota.de', 'tutamail.com',
  // Mail.com domains
  'mail.com', 'email.com', 'usa.com', 'myself.com', 'consultant.com', 'post.com',
  'europe.com', 'asia.com', 'dr.com', 'engineer.com', 'cheerful.com', 'accountant.com',
  'activist.com', 'allergist.com', 'alumni.com', 'arcticmail.com', 'artlover.com',
  'birdlover.com', 'brew-meister.com', 'cash4u.com', 'chemist.com', 'columnist.com',
  'comic.com', 'computer4u.com', 'counsellor.com', 'deliveryman.com', 'diplomats.com',
  'execs.com', 'fastservice.com', 'gardener.com', 'groupmail.com', 'homemail.com',
  'job4u.com', 'journalist.com', 'legislator.com', 'lobbyist.com', 'minister.com',
  'net-shopping.com', 'optician.com', 'pediatrician.com', 'planetmail.com', 'politician.com',
  'priest.com', 'publicist.com', 'qualityservice.com', 'realtyagent.com', 'registerednurses.com',
  'repairman.com', 'sociologist.com', 'solution4u.com'
]

// Function to validate email domain
function validateEmailDomain(email: string): { isValid: boolean; error?: string } {
  if (!email) {
    return { isValid: false, error: "Email is required" }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" }
  }

  const domain = email.split('@')[1]?.toLowerCase()
  
  if (!domain) {
    return { isValid: false, error: "Invalid email format" }
  }

  if (RESTRICTED_DOMAINS.includes(domain)) {
    return { 
      isValid: false, 
      error: "Personal email addresses are not allowed. Please use your organization email address." 
    }
  }

  return { isValid: true }
}

export default function RegisterOrganizationPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  
  // Form fields
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    organizationName: "",
    website: "",
    contactMail: "",
    phone: "",
    companyLocation: ""
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: "" }))
    }

    // Special validation for email domain
    if (field === "email") {
      const validation = validateEmailDomain(value)
      if (!validation.isValid && value) {
        setFieldErrors(prev => ({ ...prev, email: validation.error || "Invalid email" }))
      }
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    // Email validation
    const emailValidation = validateEmailDomain(formData.email)
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error || "Invalid email"
    }

    // Required fields validation
    if (!formData.password) errors.password = "Password is required"
    if (!formData.confirmPassword) errors.confirmPassword = "Please confirm your password"
    if (!formData.organizationName) errors.organizationName = "Organization name is required"
    if (!formData.contactMail) errors.contactMail = "Contact email is required"
    if (!formData.companyLocation) errors.companyLocation = "Company location is required"

    // Password validation
    if (formData.password && formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    // Contact email validation
    if (formData.contactMail) {
      const contactEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!contactEmailRegex.test(formData.contactMail)) {
        errors.contactMail = "Please enter a valid contact email"
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/organizations/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        })

        const result = await response.json()

        if (result.success) {
          toast.success("Organization registered successfully! Please wait for admin approval.")
          router.push("/")
        } else {
          setError(result.error || "Registration failed")
          toast.error(result.error || "Registration failed")
        }
      } catch (err) {
        setError("An error occurred during registration")
        toast.error("An error occurred during registration")
      }
    })
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background flex items-center justify-center p-4"
    >
      {/* Theme toggle in top right corner */}
      <div className="absolute top-4 right-4 z-50">
        <div className="bg-background/80 backdrop-blur-sm border border-border rounded-full p-1 shadow-sm">
          <AnimatedThemeToggler className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors" />
        </div>
      </div>

      {/* Back to login button */}
      <div className="absolute top-4 left-4 z-50">
        <Link href="/">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Button>
        </Link>
      </div>
      
      <div className="w-full max-w-2xl">
        {/* Logo and Title */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Register Organization</h1>
          <p className="text-muted-foreground mt-2">Create your organization account</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Organization Registration</CardTitle>
              <CardDescription>
                Please fill in all the required information to register your organization.
                <br />
                <span className="text-sm text-orange-600 font-medium">
                  Note: Only organization email addresses are allowed (no personal email providers).
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">User Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Login Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="organization@company.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                        className={fieldErrors.email ? "border-red-500" : ""}
                      />
                      {fieldErrors.email && (
                        <p className="text-sm text-red-600">{fieldErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          required
                          className={fieldErrors.password ? "border-red-500" : ""}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {fieldErrors.password && (
                        <p className="text-sm text-red-600">{fieldErrors.password}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          required
                          className={fieldErrors.confirmPassword ? "border-red-500" : ""}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {fieldErrors.confirmPassword && (
                        <p className="text-sm text-red-600">{fieldErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Organization Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Organization Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organizationName">Organization Name *</Label>
                      <Input
                        id="organizationName"
                        type="text"
                        placeholder="Acme Corporation"
                        value={formData.organizationName}
                        onChange={(e) => handleInputChange("organizationName", e.target.value)}
                        required
                        className={fieldErrors.organizationName ? "border-red-500" : ""}
                      />
                      {fieldErrors.organizationName && (
                        <p className="text-sm text-red-600">{fieldErrors.organizationName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://company.com"
                        value={formData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactMail">Contact Email *</Label>
                      <Input
                        id="contactMail"
                        type="email"
                        placeholder="contact@company.com"
                        value={formData.contactMail}
                        onChange={(e) => handleInputChange("contactMail", e.target.value)}
                        required
                        className={fieldErrors.contactMail ? "border-red-500" : ""}
                      />
                      {fieldErrors.contactMail && (
                        <p className="text-sm text-red-600">{fieldErrors.contactMail}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyLocation">Company Location *</Label>
                    <Input
                      id="companyLocation"
                      type="text"
                      placeholder="123 Business St, City, Country"
                      value={formData.companyLocation}
                      onChange={(e) => handleInputChange("companyLocation", e.target.value)}
                      required
                      className={fieldErrors.companyLocation ? "border-red-500" : ""}
                    />
                    {fieldErrors.companyLocation && (
                      <p className="text-sm text-red-600">{fieldErrors.companyLocation}</p>
                    )}
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-destructive text-sm bg-destructive/10 p-3 rounded-md border border-destructive/20"
                  >
                    {error}
                  </motion.div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isPending}
                >
                  {isPending ? "Registering..." : "Register Organization"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-6 text-center text-sm text-muted-foreground"
        >
          <p>
            Already have an account?{" "}
            <Link href="/" className="text-primary hover:underline">
              Sign in here
            </Link>
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}