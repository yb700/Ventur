/* eslint-disable @typescript-eslint/no-unused-vars */
// app/page.tsx
"use client"

import Link from 'next/link';
import {
  Target,
  PenSquare,
  Send,
  CheckCircle,
  Users,
  TrendingUp,
  Shield,
  Building2,
  MapPin,
  Clock,
  Zap,
  ArrowRight,
  Star,
  Award,
  Globe,
  Phone,
  Mail,
  Linkedin,
  Twitter,
  Facebook,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

/**
 * The main landing page for Ventur by VenturSolutions.
 * A modern, user-friendly SaaS platform for construction businesses.
 */
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Modern Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                VENTUR
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">
                Pricing
              </Link>
              <Link href="#contact" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">
                Contact
              </Link>
              <Link href="/auth/login" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">
                Login
              </Link>
              <Link href="/auth/register" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
                Start Free Trial
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                <Link href="#features" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">
                  Features
                </Link>
                <Link href="#pricing" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">
                  Pricing
                </Link>
                <Link href="#contact" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">
                  Contact
                </Link>
                <Link href="/auth/login" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">
                  Login
                </Link>
                <Link href="/auth/register" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium text-center">
                  Start Free Trial
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="pt-16 lg:pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Spotlights */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-40 right-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-8">
                🚀 Intelligent Planning Monitoring
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                Find Your Next
                <span className="block bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Construction Project
                </span>
              </h1>

              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
                VENTUR connects construction businesses with property owners who have submitted planning applications.
                Get early access to new projects and win more business with our comprehensive platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <Link href="/auth/register" className="group bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-1">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="#how-it-works" className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-purple-300 hover:text-purple-600 transition-all duration-300">
                  See How It Works
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>500+ construction businesses</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>99.9% uptime guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span>GDPR compliant</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">50+</div>
                <div className="text-sm text-gray-600">UK Councils Monitored</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">10k+</div>
                <div className="text-sm text-gray-600">Planning Applications</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">£2M+</div>
                <div className="text-sm text-gray-600">Projects Won</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">95%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 lg:mb-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">How VENTUR Works</h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Our intelligent platform monitors planning applications and connects you with potential clients
                before your competitors even know about them.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {/* Step 1 */}
              <div className="group relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-purple-200">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                    1
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <Target className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Monitor Applications</h3>
                    <p className="text-gray-600 leading-relaxed">
                      We automatically track planning applications from 50+ UK councils in real-time,
                      filtering for projects that match your business criteria.
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Real-time updates</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="group relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-purple-200">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                    2
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <PenSquare className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Generate Leads</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Our AI identifies high-quality leads and provides you with detailed contact information
                      and project specifications.
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>AI-powered filtering</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="group relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-purple-200">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                    3
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <Send className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Win Projects</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Send professional proposals directly to property owners and win more construction projects
                      with our automated outreach system.
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Automated outreach</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-base-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose Ventur?</h2>
              <p className="text-xl text-base-content/70 max-w-3xl mx-auto">
                Built specifically for construction businesses to streamline lead generation and project acquisition.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="card bg-base-100 shadow-lg card-hover border border-base-300">
                <div className="card-body">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="card-title text-lg mb-2">Lightning Fast</h3>
                  <p className="text-base-content/70">
                    Get notified of new planning applications within minutes, not days.
                    Be the first to reach potential clients.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg card-hover border border-base-300">
                <div className="card-body">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="card-title text-lg mb-2">Precision Targeting</h3>
                  <p className="text-base-content/70">
                    Filter applications by location, project type, value, and more to find
                    the perfect opportunities for your business.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg card-hover border border-base-300">
                <div className="card-body">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="card-title text-lg mb-2">Professional Templates</h3>
                  <p className="text-base-content/70">
                    Send polished, professional proposals with our customizable letter templates
                    that convert prospects into clients.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg card-hover border border-base-300">
                <div className="card-body">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="card-title text-lg mb-2">Local Focus</h3>
                  <p className="text-base-content/70">
                    Focus on your local area or expand to new territories.
                    We cover all major UK councils and planning authorities.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg card-hover border border-base-300">
                <div className="card-body">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="card-title text-lg mb-2">Save Time</h3>
                  <p className="text-base-content/70">
                    Automate your lead generation process. No more manual searching through
                    council websites or cold calling.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg card-hover border border-base-300">
                <div className="card-body">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="card-title text-lg mb-2">Grow Revenue</h3>
                  <p className="text-base-content/70">
                    Our users report an average 40% increase in project wins and
                    60% reduction in lead generation time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-base-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">What Our Clients Say</h2>
              <p className="text-xl text-base-content/70 max-w-3xl mx-auto">
                Join hundreds of construction businesses that have transformed their lead generation with Ventur.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card bg-base-200 border border-base-300">
                <div className="card-body">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-base-content/70 mb-4">
                    &quot;Ventur has completely transformed how we find new projects. We&apos;re now the first to contact
                    potential clients, and our win rate has increased by 50%.&quot;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold">JS</span>
                    </div>
                    <div>
                      <div className="font-semibold">John Smith</div>
                      <div className="text-sm text-base-content/60">Smith Construction Ltd</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-200 border border-base-300">
                <div className="card-body">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-base-content/70 mb-4">
                    &quot;The automated lead generation saves us hours every week. We&apos;ve won £500k worth of projects
                    in just 3 months using Ventur.&quot;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold">MJ</span>
                    </div>
                    <div>
                      <div className="font-semibold">Maria Johnson</div>
                      <div className="text-sm text-base-content/60">Johnson Builders</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-200 border border-base-300">
                <div className="card-body">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-base-content/70 mb-4">
                    &quot;Professional templates and automated outreach have made us look like a much larger company.
                    Our clients are impressed with our proactive approach.&quot;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold">DW</span>
                    </div>
                    <div>
                      <div className="font-semibold">David Wilson</div>
                      <div className="text-sm text-base-content/60">Wilson Developments</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-base-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-xl text-base-content/70 max-w-3xl mx-auto">
                Start generating leads today with our flexible pricing plans. No hidden fees, no long-term contracts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="card bg-base-100 shadow-lg border border-base-300">
                <div className="card-body text-center">
                  <h3 className="card-title text-xl mb-2">Starter</h3>
                  <div className="text-4xl font-bold text-primary mb-2">£49</div>
                  <div className="text-base-content/60 mb-6">per month</div>
                  <ul className="space-y-3 mb-8 text-left">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>50 leads per month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>5 council areas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>Basic templates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>Email support</span>
                    </li>
                  </ul>
                  <Link href="/auth/register" className="btn btn-outline w-full">
                    Start Free Trial
                  </Link>
                </div>
              </div>

              <div className="card bg-primary text-primary-content shadow-lg border border-primary relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="badge badge-secondary">Most Popular</div>
                </div>
                <div className="card-body text-center">
                  <h3 className="card-title text-xl mb-2">Professional</h3>
                  <div className="text-4xl font-bold mb-2">£99</div>
                  <div className="opacity-80 mb-6">per month</div>
                  <ul className="space-y-3 mb-8 text-left">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>200 leads per month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>All UK councils</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Premium templates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Advanced filtering</span>
                    </li>
                  </ul>
                  <Link href="/auth/register" className="btn btn-secondary w-full">
                    Start Free Trial
                  </Link>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg border border-base-300">
                <div className="card-body text-center">
                  <h3 className="card-title text-xl mb-2">Enterprise</h3>
                  <div className="text-4xl font-bold text-primary mb-2">£199</div>
                  <div className="text-base-content/60 mb-6">per month</div>
                  <ul className="space-y-3 mb-8 text-left">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>Unlimited leads</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>All features</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>Custom templates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>Dedicated support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>API access</span>
                    </li>
                  </ul>
                  <Link href="/auth/register" className="btn btn-outline w-full">
                    Start Free Trial
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-secondary text-primary-content">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Lead Generation?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              Join hundreds of construction businesses that are already winning more projects with Ventur.
              Start your free trial today and see the difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/register" className="btn btn-secondary btn-lg text-lg px-8">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link href="#contact" className="btn btn-outline btn-lg text-lg px-8 btn-outline-primary-content">
                Schedule Demo
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-base-200 text-base-content">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Ventur</span>
          </div>
          <p className="text-base-content/70 max-w-md">
            Empowering construction businesses to find and win more projects through intelligent lead generation.
          </p>
          <div className="flex gap-4 mt-4">
            <a href="#" className="link link-hover">Privacy Policy</a>
            <a href="#" className="link link-hover">Terms of Service</a>
            <a href="#" className="link link-hover">Support</a>
            <a href="#" className="link link-hover">API Documentation</a>
          </div>
        </div>
        <div>
          <div className="grid grid-flow-col gap-4">
            <a href="#" className="link link-hover">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="link link-hover">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="link link-hover">
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>
        <div>
          <p>Copyright © {new Date().getFullYear()} - All right reserved by VenturSolutions</p>
        </div>
      </footer>
    </div>
  );
}