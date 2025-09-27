"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel as FormFormFieldLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Key, Mail, CheckCircle, AlertCircle } from "lucide-react"

// Form schemas
const RequestResetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["ADMIN", "FREELANCER", "ORGANIZATION", "MAINTAINER"], {
    required_error: "Please select a role"
  })
})

const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type RequestResetForm = z.infer<typeof RequestResetSchema>
type ResetPasswordForm = z.infer<typeof ResetPasswordSchema>

interface ResetPasswordDialogProps {
  children: React.ReactNode
}

export function ResetPasswordDialog({ children }: ResetPasswordDialogProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"request" | "reset" | "success">("request")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

  const requestForm = useForm<RequestResetForm>({
    resolver: zodResolver(RequestResetSchema),
    defaultValues: {
      email: "",
      role: undefined
    }
  })

  const resetForm = useForm<ResetPasswordForm>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      token: "",
      newPassword: "",
      confirmPassword: ""
    }
  })

  const handleRequestReset = async (data: RequestResetForm) => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/auth/reset-password?action=request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message
        })
        // For demo purposes, show the token
        if (result.debugToken) {
          setTimeout(() => {
            alert(`For demo purposes, here is your reset token: ${result.debugToken}`)
            resetForm.setValue("token", result.debugToken)
            setStep("reset")
          }, 1000)
        }
      } else {
        setMessage({
          type: "error",
          text: result.message || "Failed to send reset email"
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

  const handleResetPassword = async (data: ResetPasswordForm) => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/auth/reset-password?action=reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        setStep("success")
      } else {
        setMessage({
          type: "error",
          text: result.message || "Failed to reset password"
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

  const handleClose = () => {
    setOpen(false)
    setStep("request")
    setMessage(null)
    requestForm.reset()
    resetForm.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Reset Password
          </DialogTitle>
          <DialogDescription>
            {step === "request" && "Enter your email and role to receive a password reset link."}
            {step === "reset" && "Enter your reset token and new password."}
            {step === "success" && "Your password has been reset successfully!"}
          </DialogDescription>
        </DialogHeader>

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

        {step === "request" && (
          <Form {...requestForm}>
            <form onSubmit={requestForm.handleSubmit(handleRequestReset)} className="space-y-4">
              <FormField
                control={requestForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormFormFieldLabel>Email Address</FormFormFieldLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Enter your email"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={requestForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormFormFieldLabel>Account Type</FormFormFieldLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your account type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="FREELANCER">Freelancer</SelectItem>
                        <SelectItem value="ORGANIZATION">Organization</SelectItem>
                        <SelectItem value="MAINTAINER">Maintainer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {step === "reset" && (
          <Form {...resetForm}>
            <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
              <FormField
                control={resetForm.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormFormFieldLabel>Reset Token</FormFormFieldLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter the reset token"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={resetForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormFormFieldLabel>New Password</FormFormFieldLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter new password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={resetForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormFormFieldLabel>Confirm Password</FormFormFieldLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setStep("request")}>
                  Back
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {step === "success" && (
          <div className="space-y-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Password Reset Successful!</span>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  Your password has been reset successfully. You can now log in with your new password.
                </p>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button onClick={handleClose}>
                Close
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}