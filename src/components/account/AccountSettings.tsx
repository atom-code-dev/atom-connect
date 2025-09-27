"use client"

import React, { useState } from "react"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel as FormFormFieldLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ResetPasswordDialog } from "@/components/auth/ResetPasswordDialog"
import { 
  User, 
  Key, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Building, 
  Shield, 
  Settings,
  CheckCircle,
  AlertCircle,
  Upload,
  Link as LinkIcon,
  Save
} from "lucide-react"

// Base profile schema
const BaseProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
})

// Freelancer profile schema
const FreelancerProfileSchema = BaseProfileSchema.extend({
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  trainerType: z.enum(["UNIVERSITY", "CORPORATE", "BOTH"]),
  experience: z.string().min(1, "Experience description is required"),
  linkedinProfile: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  activity: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  availability: z.enum(["AVAILABLE", "IN_TRAINING", "NOT_AVAILABLE"]),
})

// Organization profile schema
const OrganizationProfileSchema = BaseProfileSchema.extend({
  organizationName: z.string().min(1, "Organization name is required"),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  contactMail: z.string().email("Invalid contact email"),
  companyLocation: z.string().min(1, "Company location is required"),
  activeStatus: z.enum(["ACTIVE", "INACTIVE"]),
})

// Admin/Maintainer profile schema
const AdminProfileSchema = BaseProfileSchema

type FreelancerProfileForm = z.infer<typeof FreelancerProfileSchema>
type OrganizationProfileForm = z.infer<typeof OrganizationProfileSchema>
type AdminProfileForm = z.infer<typeof AdminProfileSchema>

interface AccountSettingsProps {
  userRole: string
  initialData?: any
}

export function AccountSettings({ userRole, initialData }: AccountSettingsProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
  const [activeTab, setActiveTab] = useState("profile")

  // Determine which schema and form to use based on user role
  let schema, defaultValues

  switch (userRole) {
    case "FREELANCER":
      schema = FreelancerProfileSchema
      defaultValues = {
        name: initialData?.name || "",
        email: initialData?.email || "",
        phone: initialData?.phone || "",
        skills: initialData?.skills || [],
        trainerType: initialData?.trainerType || "BOTH",
        experience: initialData?.experience || "",
        linkedinProfile: initialData?.linkedinProfile || "",
        activity: initialData?.activity || "",
        location: initialData?.location || "",
        availability: initialData?.availability || "AVAILABLE",
      }
      break
    case "ORGANIZATION":
      schema = OrganizationProfileSchema
      defaultValues = {
        name: initialData?.name || "",
        email: initialData?.email || "",
        phone: initialData?.phone || "",
        organizationName: initialData?.organizationName || "",
        website: initialData?.website || "",
        contactMail: initialData?.contactMail || "",
        companyLocation: initialData?.companyLocation || "",
        activeStatus: initialData?.activeStatus || "ACTIVE",
      }
      break
    default: // ADMIN, MAINTAINER
      schema = AdminProfileSchema
      defaultValues = {
        name: initialData?.name || "",
        email: initialData?.email || "",
        phone: initialData?.phone || "",
      }
  }

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const onSubmit = async (data: any) => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/${userRole.toLowerCase()}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        setMessage({
          type: "success",
          text: "Profile updated successfully!"
        })
        // Update session if needed
        if (data.name || data.email) {
          // Force session update
          window.location.reload()
        }
      } else {
        setMessage({
          type: "error",
          text: result.message || "Failed to update profile"
        })
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An error occurred. Please try again."
      })
    } finally {
      setLoading(false)
    }
  }

  const renderProfileForm = () => {
    switch (userRole) {
      case "FREELANCER":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormFormFieldLabel>Full Name</FormFormFieldLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormFormFieldLabel>Email Address</FormFormFieldLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormFormFieldLabel>Phone Number</FormFormFieldLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormFormFieldLabel>Location</FormFormFieldLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trainerType"
                render={({ field }) => (
                  <FormItem>
                    <FormFormFieldLabel>Trainer Type</FormFormFieldLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select trainer type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="UNIVERSITY">University</SelectItem>
                        <SelectItem value="CORPORATE">Corporate</SelectItem>
                        <SelectItem value="BOTH">Both</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="availability"
                render={({ field }) => (
                  <FormItem>
                    <FormFormFieldLabel>Availability</FormFormFieldLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Available</SelectItem>
                        <SelectItem value="IN_TRAINING">In Training</SelectItem>
                        <SelectItem value="NOT_AVAILABLE">Not Available</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormFormFieldLabel>Skills (comma-separated)</FormFormFieldLabel>
                  <FormControl>
                    <Input 
                      placeholder="JavaScript, React, Node.js, TypeScript"
                      value={field.value.join(", ")}
                      onChange={(e) => field.onChange(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormFormFieldLabel>Experience Description</FormFormFieldLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your experience and expertise..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activity"
              render={({ field }) => (
                <FormItem>
                  <FormFormFieldLabel>Activity Description</FormFormFieldLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your current activities and interests..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkedinProfile"
              render={({ field }) => (
                <FormItem>
                  <FormFormFieldLabel>LinkedIn Profile</FormFormFieldLabel>
                  <FormControl>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        className="pl-10" 
                        placeholder="https://linkedin.com/in/yourprofile"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )

      case "ORGANIZATION":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <FormFormFieldLabel>Organization Name</FormFormFieldLabel>
                    <FormControl>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactMail"
                render={({ field }) => (
                  <FormItem>
                    <FormFormFieldLabel>Contact Email</FormFormFieldLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormFormFieldLabel>Phone Number</FormFormFieldLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormFormFieldLabel>Company Location</FormFormFieldLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormFormFieldLabel>Website</FormFormFieldLabel>
                    <FormControl>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                          className="pl-10" 
                          placeholder="https://yourcompany.com"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activeStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormFormFieldLabel>Active Status</FormFormFieldLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )

      default: // ADMIN, MAINTAINER
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormFormFieldLabel>Full Name</FormFormFieldLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormFormFieldLabel>Email Address</FormFormFieldLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input className="pl-10" {...field} />
                    </div>
                  </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormFormFieldLabel>Phone Number</FormFormFieldLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {userRole}
        </Badge>
      </div>

      {message && (
        <Alert className={message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
          {message.type === "error" ? (
            <AlertCircle className="h-4 w-4 text-red-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription className={message.type === "error" ? "text-red-800" : "text-green-800"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {renderProfileForm()}
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Key className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Password</h4>
                    <p className="text-sm text-muted-foreground">Last changed recently</p>
                  </div>
                </div>
                <ResetPasswordDialog>
                  <Button variant="outline">
                    Change Password
                  </Button>
                </ResetPasswordDialog>
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                </div>
                <Button variant="outline" disabled>
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize your account preferences and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Settings className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Manage email notification preferences</p>
                  </div>
                </div>
                <Button variant="outline" disabled>
                  Configure
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Briefcase className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Privacy Settings</h4>
                    <p className="text-sm text-muted-foreground">Control your privacy and data sharing</p>
                  </div>
                </div>
                <Button variant="outline" disabled>
                  Manage
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Upload className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Data Export</h4>
                    <p className="text-sm text-muted-foreground">Download your account data</p>
                  </div>
                </div>
                <Button variant="outline" disabled>
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}