import { z } from "zod"
import { 
  UserSchema, 
  FreelancerProfileSchema, 
  OrganizationProfileSchema,
  TrainingSchema,
  TrainingFeedbackSchema 
} from "./index"

// Registration form schema (combines user and profile)
export const FreelancerRegistrationSchema = z.object({
  user: UserSchema.extend({
    role: z.literal("FREELANCER"),
  }),
  profile: FreelancerProfileSchema,
})

export const OrganizationRegistrationSchema = z.object({
  user: UserSchema.extend({
    role: z.literal("ORGANIZATION"),
  }),
  profile: OrganizationProfileSchema,
})

// Training creation form schema
export const CreateTrainingSchema = TrainingSchema

// Training update form schema
export const UpdateTrainingSchema = TrainingSchema.partial()

// Profile update forms
export const UpdateFreelancerProfileSchema = FreelancerProfileSchema.partial()
export const UpdateOrganizationProfileSchema = OrganizationProfileSchema.partial()

// Search and filter schemas
export const TrainingSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  type: z.string().optional(),
  location: z.string().optional(),
  stack: z.string().optional(),
  minPayment: z.number().optional(),
  maxPayment: z.number().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
})

export const FreelancerSearchSchema = z.object({
  query: z.string().optional(),
  skills: z.array(z.string()).optional(),
  location: z.string().optional(),
  trainerType: z.string().optional(),
  availability: z.string().optional(),
  minExperience: z.number().optional(),
})

// Export types
export type FreelancerRegistration = z.infer<typeof FreelancerRegistrationSchema>
export type OrganizationRegistration = z.infer<typeof OrganizationRegistrationSchema>
export type CreateTraining = z.infer<typeof CreateTrainingSchema>
export type UpdateTraining = z.infer<typeof UpdateTrainingSchema>
export type UpdateFreelancerProfile = z.infer<typeof UpdateFreelancerProfileSchema>
export type UpdateOrganizationProfile = z.infer<typeof UpdateOrganizationProfileSchema>
export type TrainingSearch = z.infer<typeof TrainingSearchSchema>
export type FreelancerSearch = z.infer<typeof FreelancerSearchSchema>