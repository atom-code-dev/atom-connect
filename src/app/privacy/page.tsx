import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Lock, Database, Globe, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - Atom Connect",
  description: "Learn how Atom Connect protects your privacy and handles your social data access.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Last updated: October 8, 2025
          </p>
          <p className="text-lg text-muted-foreground mt-2">
            Atom Connect is committed to protecting your privacy and ensuring the security of your personal information.
          </p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                Atom Connect ("we," "us," or "our") operates a platform that connects freelance trainers with organizations seeking training services. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service, 
                including when you access our platform through social media authentication.
              </p>
              <p className="text-foreground">
                By using Atom Connect, you agree to the collection and use of information in accordance with this policy.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Full name and profile information</li>
                  <li>• Email address and contact details</li>
                  <li>• Professional profile and bio</li>
                  <li>• Skills, experience, and qualifications</li>
                  <li>• Location and availability information</li>
                  <li>• Hourly rates and service preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Social Media Authentication Data</h3>
                <p className="text-muted-foreground mb-3">
                  When you choose to sign up or log in using LinkedIn or other social media platforms, we collect:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Your LinkedIn profile information (name, email, profile picture)</li>
                  <li>• Professional headline and current position</li>
                  <li>• Educational background and work experience</li>
                  <li>• Skills and endorsements (if publicly available)</li>
                  <li>• Authentication tokens for session management</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Automatically Collected Information</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• IP address and device information</li>
                  <li>• Browser type and operating system</li>
                  <li>• Pages visited and time spent on our platform</li>
                  <li>• Referring websites and search terms</li>
                  <li>• Interaction data with our features and services</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                We use the information we collect for the following purposes:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Service Provision</h4>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>• Create and manage your account</li>
                    <li>• Connect you with training opportunities</li>
                    <li>• Facilitate communication between trainers and organizations</li>
                    <li>• Process bookings and payments</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Platform Improvement</h4>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>• Analyze usage patterns and improve user experience</li>
                    <li>• Develop new features and services</li>
                    <li>• Conduct research and analytics</li>
                    <li>• Ensure platform security and integrity</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Data Access and Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Social Data Access and Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">LinkedIn Integration</h3>
                <p className="text-muted-foreground mb-3">
                  Our integration with LinkedIn allows you to:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Quickly create an account using your LinkedIn profile</li>
                  <li>• Import your professional information to save time</li>
                  <li>• Verify your professional identity and credentials</li>
                  <li>• Enhance your profile visibility to potential clients</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Data We Access from LinkedIn</h3>
                <p className="text-muted-foreground mb-3">
                  With your explicit consent, we access the following information from your LinkedIn profile:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Basic profile information (name, headline, profile picture)</li>
                  <li>• Email address for account creation and communication</li>
                  <li>• Work experience and education history</li>
                  <li>• Skills and endorsements (if publicly shared)</li>
                  <li>• Professional summary and bio information</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">How We Protect Your Social Data</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• We only access data that you explicitly authorize</li>
                  <li>• Your social data is encrypted and stored securely</li>
                  <li>• We never post to your social media accounts without permission</li>
                  <li>• You can revoke social media access at any time</li>
                  <li>• We comply with all relevant data protection regulations</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing and Disclosure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Data Sharing and Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
                except in the following circumstances:
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">Service Providers</h4>
                  <p className="text-muted-foreground text-sm">
                    We may share information with third-party service providers who perform services on our behalf, 
                    such as payment processing, data analysis, and customer support.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Business Transfers</h4>
                  <p className="text-muted-foreground text-sm">
                    In the event of a merger, acquisition, or sale of all or part of our assets, 
                    your information may be transferred as part of the transaction.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Legal Requirements</h4>
                  <p className="text-muted-foreground text-sm">
                    We may disclose your information if required by law or in good faith belief that 
                    such action is necessary to comply with legal obligations or protect our rights.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. These include:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• SSL/TLS encryption for data transmission</li>
                <li>• Secure storage of sensitive information</li>
                <li>• Regular security assessments and updates</li>
                <li>• Access controls and authentication mechanisms</li>
                <li>• Employee training on data protection practices</li>
                <li>• Incident response and breach notification procedures</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                You have the following rights regarding your personal information:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Access and Control</h4>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>• Access your personal information</li>
                    <li>• Update or correct your data</li>
                    <li>• Delete your account and data</li>
                    <li>• Export your information</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Privacy Choices</h4>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>• Opt-out of marketing communications</li>
                    <li>• Revoke social media permissions</li>
                    <li>• Control profile visibility</li>
                    <li>• Manage cookie preferences</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* International Data Transfers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                International Data Transfers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                Atom Connect operates globally and may transfer your information to countries other than your country of residence. 
                We ensure that such transfers comply with applicable data protection laws and maintain adequate safeguards 
                for your personal information.
              </p>
            </CardContent>
          </Card>

          {/* Changes to This Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Changes to This Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                We may update this Privacy Policy from time to time. The updated version will be indicated by a revised "Last Updated" date 
                and the updated version will be effective as soon as it is accessible. We encourage you to review this Privacy Policy 
                frequently for any changes.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> privacy@atomconnect.in</p>
                <p><strong>Address:</strong> Atom Connect Team</p>
                <p>We will respond to your inquiry within 30 days of receipt.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}