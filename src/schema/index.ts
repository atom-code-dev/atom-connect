import { z } from "zod"

// User roles enum
export const UserRoleEnum = z.enum(["FREELANCER", "ADMIN", "ORGANIZATION", "MAINTAINER"])

// Training categories enum
export const TrainingCategoryEnum = z.enum(["SOFT_SKILLS", "FUNDAMENTALS", "FRAMEWORKS"])

// Training types enum
export const TrainingTypeEnum = z.enum(["CORPORATE", "UNIVERSITY"])

// Training modes enum
export const TrainingModeEnum = z.enum(["ONLINE", "OFFLINE"])

// Contract types enum
export const ContractTypeEnum = z.enum(["PER_DAY", "MONTHLY"])

// TFA (Training Facility Availability) enum
export const TFAStatusEnum = z.enum(["AVAILABLE", "NOT_AVAILABLE"])

// Trainer preference enum
export const TrainerPreferenceEnum = z.enum(["LOCAL", "REGIONAL_NORTH", "REGIONAL_SOUTH", "ALL_REGIONS"])

// Trainer types enum
export const TrainerTypeEnum = z.enum(["UNIVERSITY", "CORPORATE", "BOTH"])

// Availability status enum
export const AvailabilityStatusEnum = z.enum(["AVAILABLE", "IN_TRAINING", "NOT_AVAILABLE"])

// Verification status enum
export const VerificationStatusEnum = z.enum(["PENDING", "VERIFIED", "REJECTED"])

// Active status enum
export const ActiveStatusEnum = z.enum(["ACTIVE", "INACTIVE"])

// Base user schema
export const UserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().optional(),
  role: UserRoleEnum,
})

// Login schema
export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

// Freelancer profile schema
export const FreelancerProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  trainerType: TrainerTypeEnum,
  experience: z.string().min(10, "Experience description must be at least 10 characters"),
  linkedinProfile: z.string().url("Invalid LinkedIn profile URL").optional(),
  cv: z.string().optional(),
  profilePicture: z.string().optional(),
  activity: z.string().optional(),
  availability: AvailabilityStatusEnum.default("AVAILABLE"),
  location: z.string().min(2, "Location must be at least 2 characters"),
})

// Organization profile schema
export const OrganizationProfileSchema = z.object({
  organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
  website: z.string().url("Invalid website URL").optional(),
  contactMail: z.string().email("Invalid contact email"),
  phone: z.string().optional(),
  verifiedStatus: VerificationStatusEnum.default("PENDING"),
  companyLocation: z.string().min(2, "Company location must be at least 2 characters"),
  activeStatus: ActiveStatusEnum.default("ACTIVE"),
  ratings: z.number().min(0).max(5).default(0),
  logo: z.string().optional(),
})

// Training category schema
export const TrainingCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  description: z.string().min(1, "Description is required"),
  isActive: z.boolean().default(true),
})

// Training location schema
export const TrainingLocationSchema = z.object({
  state: z.string().min(2, "State must be at least 2 characters"),
  district: z.string().min(2, "District must be at least 2 characters"),
  isActive: z.boolean().default(true),
})

// Stack schema
export const StackSchema = z.object({
  name: z.string().min(2, "Stack name must be at least 2 characters"),
  description: z.string().optional(),
})

// Training schema
export const TrainingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  categoryId: z.string().min(1, "Category is required"),
  type: TrainingTypeEnum,
  locationId: z.string().min(1, "Location is required"),
  stackId: z.string().min(1, "Stack is required"),
  mode: TrainingModeEnum.default("OFFLINE"),
  contractType: ContractTypeEnum.default("PER_DAY"),
  experienceMin: z.number().min(0).max(50).optional(),
  experienceMax: z.number().min(0).max(50).optional(),
  openings: z.number().min(1, "Number of openings must be at least 1").default(1),
  tfa: TFAStatusEnum.default("AVAILABLE"),
  trainerPreference: TrainerPreferenceEnum.default("ALL_REGIONS"),
  startDate: z.date(),
  endDate: z.date(),
  hasPayment: z.boolean().default(true),
  paymentTerm: z.number().min(1).optional(),
  paymentAmount: z.number().min(0).optional(),
  isPublished: z.boolean().default(false),
  isActive: z.boolean().default(true),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
}).refine((data) => {
  if (data.experienceMin && data.experienceMax) {
    return data.experienceMax >= data.experienceMin
  }
  return true
}, {
  message: "Maximum experience must be greater than or equal to minimum experience",
  path: ["experienceMax"],
}).refine((data) => {
  if (data.hasPayment) {
    return data.paymentTerm !== undefined && data.paymentAmount !== undefined
  }
  return true
}, {
  message: "Payment term and amount are required when payment is enabled",
  path: ["paymentTerm"],
})

// Training feedback schema
export const TrainingFeedbackSchema = z.object({
  organizationRating: z.number().min(1).max(5),
  institutionName: z.string().optional(),
  overallRating: z.number().min(1).max(5).optional(),
  foodAccommodation: z.number().min(1).max(5),
  travelExperience: z.number().min(1).max(5),
  paymentTermRating: z.number().min(1).max(5),
  comments: z.string().optional(),
})

// Export types
export type User = z.infer<typeof UserSchema>
export type Login = z.infer<typeof LoginSchema>
export type FreelancerProfile = z.infer<typeof FreelancerProfileSchema>
export type OrganizationProfile = z.infer<typeof OrganizationProfileSchema>
export type TrainingCategory = z.infer<typeof TrainingCategorySchema>
export type TrainingLocation = z.infer<typeof TrainingLocationSchema>
export type Stack = z.infer<typeof StackSchema>
export type Training = z.infer<typeof TrainingSchema>
export type TrainingFeedback = z.infer<typeof TrainingFeedbackSchema>

// Export enum types
export type UserRole = z.infer<typeof UserRoleEnum>
export type TrainingCategoryType = z.infer<typeof TrainingCategoryEnum>
export type TrainingType = z.infer<typeof TrainingTypeEnum>
export type TrainerType = z.infer<typeof TrainerTypeEnum>
export type AvailabilityStatus = z.infer<typeof AvailabilityStatusEnum>
export type VerificationStatus = z.infer<typeof VerificationStatusEnum>
export type ActiveStatus = z.infer<typeof ActiveStatusEnum>
export type TrainingMode = z.infer<typeof TrainingModeEnum>
export type ContractType = z.infer<typeof ContractTypeEnum>
export type TFAStatus = z.infer<typeof TFAStatusEnum>
export type TrainerPreference = z.infer<typeof TrainerPreferenceEnum>