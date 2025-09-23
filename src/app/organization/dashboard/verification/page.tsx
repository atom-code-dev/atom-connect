import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Clock, AlertCircle, Upload, FileText, Building, Star } from "lucide-react"

// Dummy data for organization verification
const verificationData = {
  status: "VERIFIED",
  submittedDate: "2024-01-15",
  reviewedDate: "2024-01-18",
  reviewer: "Alice Johnson",
  documents: [
    {
      name: "Business Registration",
      status: "APPROVED",
      uploadedDate: "2024-01-15",
      comments: "Valid business registration document",
    },
    {
      name: "Tax ID Certificate",
      status: "APPROVED",
      uploadedDate: "2024-01-15",
      comments: "Valid tax identification",
    },
    {
      name: "Address Proof",
      status: "APPROVED",
      uploadedDate: "2024-01-15",
      comments: "Address verified successfully",
    },
  ],
}

const organizationProfile = {
  organizationName: "TechCorp Solutions",
  website: "https://techcorp.com",
  contactMail: "contact@techcorp.com",
  phone: "+91-9876543210",
  companyLocation: "Bangalore, Karnataka",
  ratings: 4.5,
  totalTrainings: 12,
  completedTrainings: 8,
  activeTrainings: 4,
}

export default function OrganizationVerificationPage() {
  const getStatusIcon = (status) => {
    switch (status) {
      case "VERIFIED":
      case "APPROVED":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "VERIFIED":
      case "APPROVED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Verification Status</h1>
          <p className="text-muted-foreground">Manage your organization verification and documents</p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Documents
        </Button>
      </div>

      {/* Verification Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(verificationData.status)}
            Verification Status
          </CardTitle>
          <CardDescription>
            Current verification status of your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="mb-2">
                {getStatusIcon(verificationData.status)}
              </div>
              <Badge className={getStatusColor(verificationData.status)} variant="outline">
                {verificationData.status}
              </Badge>
            </div>
            <div>
              <h3 className="font-medium mb-1">Submitted Date</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(verificationData.submittedDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Reviewed Date</h3>
              <p className="text-sm text-muted-foreground">
                {verificationData.reviewedDate ? new Date(verificationData.reviewedDate).toLocaleDateString() : "Not reviewed yet"}
              </p>
            </div>
          </div>
          {verificationData.reviewer && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-medium mb-1">Reviewed By</h3>
              <p className="text-sm text-muted-foreground">{verificationData.reviewer}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Organization Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Organization Profile
          </CardTitle>
          <CardDescription>
            Your organization information and statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Organization Name</h3>
                <p className="text-sm text-muted-foreground">{organizationProfile.organizationName}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Website</h3>
                <a href={organizationProfile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                  {organizationProfile.website}
                </a>
              </div>
              <div>
                <h3 className="font-medium mb-1">Contact Email</h3>
                <p className="text-sm text-muted-foreground">{organizationProfile.contactMail}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Phone</h3>
                <p className="text-sm text-muted-foreground">{organizationProfile.phone}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Location</h3>
                <p className="text-sm text-muted-foreground">{organizationProfile.companyLocation}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{organizationProfile.totalTrainings}</div>
                    <div className="text-sm text-muted-foreground">Total Trainings</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{organizationProfile.completedTrainings}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </CardContent>
                </Card>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{organizationProfile.activeTrainings}</div>
                    <div className="text-sm text-muted-foreground">Active</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      <span className="text-2xl font-bold">{organizationProfile.ratings}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">Rating</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Verification Documents
          </CardTitle>
          <CardDescription>
            Required documents for organization verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {verificationData.documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(doc.status)}
                  <div>
                    <h3 className="font-medium">{doc.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Uploaded: {new Date(doc.uploadedDate).toLocaleDateString()}
                    </p>
                    {doc.comments && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {doc.comments}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(doc.status)}>
                    {doc.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    Replace
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Requirements and Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Requirements</CardTitle>
          <CardDescription>
            Documents and information needed for verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="documents">Required Documents</TabsTrigger>
              <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>
            <TabsContent value="documents" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Business Registration</h3>
                    <p className="text-sm text-muted-foreground">Certificate of incorporation or business registration</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Tax Identification</h3>
                    <p className="text-sm text-muted-foreground">Valid tax ID certificate or GST registration</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Address Proof</h3>
                    <p className="text-sm text-muted-foreground">Utility bill or lease agreement for business address</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Contact Information</h3>
                    <p className="text-sm text-muted-foreground">Valid email address and phone number</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="guidelines" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium">Document Requirements</h3>
                  <ul className="text-sm text-muted-foreground list-disc list-inside mt-1">
                    <li>All documents must be clear and readable</li>
                    <li>Documents should be in PDF, JPG, or PNG format</li>
                    <li>Maximum file size: 5MB per document</li>
                    <li>Documents must be current and valid</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium">Verification Process</h3>
                  <ul className="text-sm text-muted-foreground list-disc list-inside mt-1">
                    <li>Submit all required documents</li>
                    <li>Our team will review within 3-5 business days</li>
                    <li>You'll receive email notification upon completion</li>
                    <li>Additional information may be requested if needed</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="timeline" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Documents Submitted</h3>
                    <p className="text-sm text-muted-foreground">January 15, 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Under Review</h3>
                    <p className="text-sm text-muted-foreground">January 16-18, 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Verification Complete</h3>
                    <p className="text-sm text-muted-foreground">January 18, 2024</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}