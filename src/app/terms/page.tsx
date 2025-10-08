import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Shield, DollarSign, Clock, AlertTriangle, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service - Atom Connect",
  description: "Terms of Service for Atom Connect platform connecting freelance trainers with organizations.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <FileText className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Last updated: October 8, 2025
          </p>
          <p className="text-lg text-muted-foreground mt-2">
            Welcome to Atom Connect. Please read these Terms of Service carefully before using our platform.
          </p>
        </div>

        <div className="space-y-8">
          {/* Agreement to Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") 
                and Atom Connect ("we," "us," or "our"). By accessing or using our platform, you agree to be bound by these Terms 
                and all applicable laws and regulations.
              </p>
              <p className="text-foreground">
                If you do not agree with these Terms, you may not access or use our services.
              </p>
            </CardContent>
          </Card>

          {/* Description of Service */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Description of Service
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                Atom Connect is a digital platform that connects freelance trainers and subject matter experts with 
                organizations seeking training services. Our platform facilitates:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Profile creation and management for freelance trainers</li>
                <li>• Training opportunity discovery and application</li>
                <li>• Communication between trainers and organizations</li>
                <li>• Booking and scheduling of training sessions</li>
                <li>• Payment processing and financial transactions</li>
                <li>• Rating and review systems</li>
                <li>• Dispute resolution services</li>
              </ul>
              <p className="text-foreground">
                We reserve the right to modify, suspend, or discontinue our service at any time without notice.
              </p>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Account Registration</h3>
                <p className="text-muted-foreground mb-3">
                  To use our platform, you must create an account and provide accurate, complete, and current information. 
                  You are responsible for maintaining the confidentiality of your account credentials.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Account Types</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold">Freelancer Accounts</h4>
                    <p className="text-muted-foreground text-sm">
                      For trainers and subject matter experts offering training services. Freelancers must provide 
                      accurate professional information, qualifications, and availability details.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Organization Accounts</h4>
                    <p className="text-muted-foreground text-sm">
                      For businesses and organizations seeking training services. Organizations must provide 
                      accurate business information and authorized representative details.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Administrator Accounts</h4>
                    <p className="text-muted-foreground text-sm">
                      For platform administrators managing system operations and user support.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Account Responsibilities</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Provide accurate and truthful information</li>
                  <li>• Maintain account security and confidentiality</li>
                  <li>• Promptly update account information</li>
                  <li>• Comply with all applicable laws and regulations</li>
                  <li>• Respect the rights and privacy of other users</li>
                  <li>• Use the platform only for legitimate business purposes</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* User Conduct */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                User Conduct
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Prohibited Activities</h3>
                <p className="text-muted-foreground mb-3">
                  You agree not to engage in any of the following prohibited activities:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Use the platform for any illegal or unauthorized purpose</li>
                  <li>• Impersonate any person or entity or falsely state your affiliation</li>
                  <li>• Harass, abuse, or harm other users</li>
                  <li>• Post false, misleading, or fraudulent information</li>
                  <li>• Upload or transmit viruses, malware, or malicious code</li>
                  <li>• Interfere with or disrupt the platform's functionality</li>
                  <li>• Collect or harvest user information without permission</li>
                  <li>• Spam or send unsolicited communications</li>
                  <li>• Reverse engineer or decompile our platform</li>
                  <li>• Violate any applicable laws or regulations</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Professional Standards</h3>
                <p className="text-muted-foreground mb-3">
                  All users must maintain professional standards when using our platform:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Communicate respectfully and professionally</li>
                  <li>• Honor commitments and agreements</li>
                  <li>• Provide accurate service descriptions and qualifications</li>
                  <li>• Deliver services as agreed upon</li>
                  <li>• Provide honest and constructive feedback</li>
                  <li>• Resolve disputes in good faith</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Services and Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Services and Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Service Fees</h3>
                <p className="text-muted-foreground mb-3">
                  Atom Connect charges fees for the use of our platform:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Platform commission on completed training engagements</li>
                  <li>• Subscription fees for premium features</li>
                  <li>• Payment processing fees</li>
                  <li>• Additional service fees as disclosed</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  All fees are clearly disclosed before you incur any charges. You authorize us to charge 
                  your selected payment method for all applicable fees.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Payment Terms</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Payments must be made in accordance with agreed terms</li>
                  <li>• Late payments may incur additional charges</li>
                  <li>• Refunds are subject to our refund policy</li>
                  <li>• We reserve the right to suspend services for non-payment</li>
                  <li>• All prices are exclusive of applicable taxes</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Dispute Resolution</h3>
                <p className="text-muted-foreground mb-3">
                  In case of disputes regarding services or payments:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Contact the other party directly to resolve the issue</li>
                  <li>• Document all communications and agreements</li>
                  <li>• Escalate to Atom Connect support if unresolved</li>
                  <li>• We will mediate disputes in good faith</li>
                  <li>• Final decisions will be made based on available evidence</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Our Rights</h3>
                <p className="text-muted-foreground">
                  Atom Connect retains all rights, title, and interest in and to our platform, including all 
                  intellectual property rights. This includes but is not limited to:
                </p>
                <ul className="space-y-2 text-muted-foreground mt-2">
                  <li>• Platform design, functionality, and features</li>
                  <li>• Text, graphics, logos, and images</li>
                  <li>• Software, algorithms, and code</li>
                  <li>• Trademarks, service marks, and trade names</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">User Content</h3>
                <p className="text-muted-foreground mb-3">
                  Users retain ownership of content they create and post on our platform. By posting content, 
                  you grant Atom Connect a worldwide, non-exclusive, royalty-free license to use, reproduce, 
                  modify, and display such content for the purpose of operating and improving our platform.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Prohibited Content</h3>
                <p className="text-muted-foreground">
                  You may not post content that infringes on others' intellectual property rights, including 
                  copyrighted material, trademarks, or proprietary information without proper authorization.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Privacy and Data Protection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy and Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                Your privacy is important to us. Our collection, use, and protection of your personal information 
                is governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
              <p className="text-foreground">
                By using our platform, you consent to the collection and use of your information as described 
                in our Privacy Policy, including the processing of your data for service provision, platform improvement, 
                and communication purposes.
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                To the maximum extent permitted by law, Atom Connect shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages, including but not limited to:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Loss of profits, revenue, or business opportunities</li>
                <li>• Loss of data or goodwill</li>
                <li>• Service interruptions or platform unavailability</li>
                <li>• Unauthorized access to your account or data</li>
                <li>• Actions or omissions of third-party users</li>
                <li>• Any other damages arising from your use of our platform</li>
              </ul>
              <p className="text-foreground">
                Our total liability for any claims related to these Terms shall not exceed the fees paid by you 
                to Atom Connect in the six months preceding the claim.
              </p>
            </CardContent>
          </Card>

          {/* Indemnification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Indemnification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                You agree to indemnify, defend, and hold harmless Atom Connect and its officers, directors, 
                employees, and affiliates from and against any claims, liabilities, damages, losses, and expenses, 
                including reasonable attorneys' fees, arising out of or in connection with:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Your use of or access to our platform</li>
                <li>• Your violation of these Terms</li>
                <li>• Your violation of any third-party rights</li>
                <li>• Your violation of applicable laws or regulations</li>
                <li>• Your User Content or activities</li>
              </ul>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Termination
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Termination by You</h3>
                <p className="text-muted-foreground">
                  You may terminate your account at any time by contacting our support team or through your 
                  account settings. Upon termination, your right to use our platform will cease immediately.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Termination by Us</h3>
                <p className="text-muted-foreground mb-3">
                  We may terminate or suspend your account immediately, without prior notice or liability, 
                  for any reason, including but not limited to:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Breach of these Terms</li>
                  <li>• Fraudulent or illegal activities</li>
                  <li>• Harm to other users or the platform</li>
                  <li>• Inactivity for extended periods</li>
                  <li>• Request from law enforcement or government authorities</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Effect of Termination</h3>
                <p className="text-muted-foreground">
                  Upon termination, all provisions of these Terms which by their nature should survive 
                  termination shall survive, including but not limited to ownership provisions, 
                  warranty disclaimers, indemnification, and limitations of liability.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Governing Law
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                These Terms shall be governed by and construed in accordance with the laws of India, 
                without regard to its conflict of law principles.
              </p>
              <p className="text-foreground">
                Any disputes arising out of or relating to these Terms shall be resolved through 
                arbitration in accordance with the Arbitration and Conciliation Act, 1996.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Changes to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                We reserve the right to modify these Terms at any time. We will provide notice of 
                material changes by posting the revised Terms on our platform and updating the "Last Updated" date.
              </p>
              <p className="text-foreground">
                Your continued use of our platform after any changes constitutes acceptance of the revised Terms. 
                If you do not agree to the changes, you must terminate your account and stop using our platform.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> legal@atomconnect.in</p>
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