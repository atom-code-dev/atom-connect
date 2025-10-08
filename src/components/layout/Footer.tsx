import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Github, 
  Mail, 
  Phone, 
  MapPin, 
  Users, 
  BookOpen, 
  Shield, 
  FileText,
  ExternalLink
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-bold text-lg">Atom Connect</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connecting skilled trainers with organizations for impactful training opportunities. 
              Building bridges between expertise and learning needs.
            </p>
            <div className="flex space-x-4">
              <Link 
                href="https://github.com/atom-code-dev/atom-connect" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link 
                href="mailto:contact@atomconnect.in" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="/freelancer" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  For Trainers
                </Link>
              </li>
              <li>
                <Link 
                  href="/organization" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  For Organizations
                </Link>
              </li>
              <li>
                <Link 
                  href="/maintainer" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  For Maintainers
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Support
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="/privacy" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  href="/status" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  System Status
                </Link>
              </li>
              <li>
                <Link 
                  href="mailto:support@atomconnect.in" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Contact
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  contact@atomconnect.in
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  +91 XXXXXXXXXX
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  Bangalore, India
                </span>
              </li>
            </ul>
            
            <div className="pt-2">
              <Link 
                href="/register-organization"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                Register Your Organization
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2025 Atom Connect. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link 
              href="/privacy" 
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <Link 
              href="/terms" 
              className="hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <Link 
              href="#" 
              className="hover:text-foreground transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>

        {/* Legal Notice */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Important Notice</p>
                <p>
                  Atom Connect is a platform that facilitates connections between freelance trainers and organizations. 
                  We are not an employer, staffing agency, or training provider. All users must comply with our 
                  Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </footer>
  );
}