/* eslint-disable @typescript-eslint/no-unused-vars */
// app/page.tsx
"use client"

import Link from 'next/link';
import { ArrowRight, CheckCircle, Target, TrendingUp, Users, Zap, Shield, Globe, BarChart3, Mail, Phone, MapPin } from 'lucide-react';

/**
 * The main landing page for Lorem by Lorem Ltd.
 * A modern, user-friendly SaaS platform for marketing businesses.
 * Features a beautiful hero section, feature highlights, and call-to-action.
 */

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
            {/* Navigation */}
            <nav className="relative z-10 px-6 py-4 lg:px-8">
                <div className="mx-auto max-w-7xl flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl blur opacity-20"></div>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            LOREM
                        </span>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">
                            Features
                        </Link>
                        <Link href="#pricing" className="text-gray-600 hover:text-purple-600 transition-colors">
                            Pricing
                        </Link>
                        <Link href="#contact" className="text-gray-600 hover:text-purple-600 transition-colors">
                            Contact
                        </Link>
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center space-x-4">
                        <Link href="/auth/login" className="text-gray-600 hover:text-purple-600 transition-colors">
                            Sign In
                        </Link>
                        <Link href="/auth/register" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative px-6 py-20 lg:px-8 lg:py-32">
                <div className="mx-auto max-w-7xl">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
                            Intelligent
                            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> Marketing </span>
                            Data Platform
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            LOREM connects marketing professionals with valuable data insights to drive business growth and strategic decision-making.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                            <Link href="/demo" className="group bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-1">
                                View Live Demo
                                <ArrowRight className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="#how-it-works" className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-purple-300 hover:text-purple-600 transition-all duration-300">
                                See How It Works
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600 mb-2">10,000+</div>
                                <div className="text-gray-600">Marketing professionals</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600 mb-2">500+</div>
                                <div className="text-gray-600">Data sources</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
                                <div className="text-gray-600">Customer satisfaction</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">How LOREM Works</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Our intelligent platform automatically discovers, analyzes, and presents valuable marketing data to help you make informed decisions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                                <Target className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-4">Discover Opportunities</h3>
                            <p className="text-gray-600">
                                Our AI-powered system continuously monitors data sources to identify relevant marketing opportunities and trends.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                                <BarChart3 className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-4">Analyze & Process</h3>
                            <p className="text-gray-600">
                                Advanced algorithms analyze and categorize data to provide actionable insights and recommendations.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                                <TrendingUp className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-4">Grow Your Business</h3>
                            <p className="text-gray-600">
                                Send professional proposals directly to prospects and win more marketing projects with data-driven insights.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-gray-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose Lorem?</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Built specifically for marketing professionals to streamline lead generation and strategic planning.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-4">Real-time Data</h3>
                            <p className="text-gray-600">
                                Get instant notifications about new opportunities and market trends as they happen.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-4">Secure & Reliable</h3>
                            <p className="text-gray-600">
                                Enterprise-grade security ensures your data and insights are always protected.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                                <Globe className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-4">Global Coverage</h3>
                            <p className="text-gray-600">
                                Access marketing data from multiple sources and regions to expand your reach.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-4">Team Collaboration</h3>
                            <p className="text-gray-600">
                                Share insights and collaborate with your team to maximize your marketing success.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-4">Advanced Analytics</h3>
                            <p className="text-gray-600">
                                Powerful analytics and reporting tools to track your performance and ROI.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-4">Smart Targeting</h3>
                            <p className="text-gray-600">
                                AI-powered targeting helps you focus on the most promising opportunities.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">What Our Customers Say</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Join hundreds of marketing professionals that have transformed their lead generation with Lorem.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-gray-50 p-8 rounded-2xl">
                            <div className="flex items-center mb-4">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                                                         <p className="text-gray-600 mb-4">
                                 &quot;Lorem has completely transformed how we find new projects. We&apos;re now the first to contact
                                 prospects and our conversion rate has increased by 300%.&quot;
                             </p>
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                    JS
                                </div>
                                <div className="ml-3">
                                    <div className="font-semibold">John Smith</div>
                                    <div className="text-sm text-base-content/60">Marketing Solutions Ltd</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-8 rounded-2xl">
                            <div className="flex items-center mb-4">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                                                         <p className="text-gray-600 mb-4">
                                 &quot;The data insights we get from Lorem have been invaluable. We&apos;ve increased our revenue
                                 in just 3 months using Lorem.&quot;
                             </p>
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                    MJ
                                </div>
                                <div className="ml-3">
                                    <div className="font-semibold">Maria Johnson</div>
                                    <div className="text-sm text-base-content/60">Digital Marketing Pro</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-8 rounded-2xl">
                            <div className="flex items-center mb-4">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                                                         <p className="text-gray-600 mb-4">
                                 &quot;Lorem&apos;s intelligent platform has revolutionized our marketing strategy. The ROI is incredible.&quot;
                             </p>
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                    DW
                                </div>
                                <div className="ml-3">
                                    <div className="font-semibold">David Wilson</div>
                                    <div className="text-sm text-base-content/60">Strategic Marketing Group</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-br from-purple-600 to-indigo-600">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to Transform Your Marketing?
                    </h2>
                    <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
                        Join hundreds of marketing professionals that are already winning more projects with Lorem.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/demo" className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            View Live Demo
                            <ArrowRight className="w-5 h-5 ml-2 inline" />
                        </Link>
                        <Link href="/auth/register" className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-purple-600 transition-all duration-300">
                            Start Free Trial
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-16">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <Target className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold">Lorem</span>
                            </div>
                            <p className="text-gray-400 mb-4">
                                Empowering marketing professionals to find and win more projects through intelligent data insights.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Product</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                                <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Company</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="#about" className="hover:text-white transition-colors">About</Link></li>
                                <li><Link href="#contact" className="hover:text-white transition-colors">Contact</Link></li>
                                <li><Link href="#careers" className="hover:text-white transition-colors">Careers</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Contact</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li className="flex items-center">
                                    <Mail className="w-4 h-4 mr-2" />
                                    info@lorem.com
                                </li>
                                <li className="flex items-center">
                                    <Phone className="w-4 h-4 mr-2" />
                                    +1 (555) 123-4567
                                </li>
                                <li className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    London, UK
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-12 pt-8 text-center">
                        <p>Copyright © {new Date().getFullYear()} - All right reserved by Lorem Ltd</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}