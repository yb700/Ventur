/* eslint-disable @typescript-eslint/no-unused-vars */
// app/(portal)/onboarding/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import {
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    MapPin,
    Building2,
    Mail,
    Phone,
    User as UserIcon,
    Target,
    Folder,
    Send,
    CreditCard
} from 'lucide-react';

type Profile = {
    full_name: string;
    company_name: string;
    address: string;
    email: string;
    phone: string;
};

export default function OnboardingPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<Profile>({
        full_name: '',
        company_name: '',
        address: '',
        email: '',
        phone: ''
    });

    const steps = [
        {
            id: 1,
            title: 'Welcome to Planning Tracker',
            description: 'Let\'s get you set up in just a few steps',
            icon: Target
        },
        {
            id: 2,
            title: 'Your Information',
            description: 'Tell us about yourself and your organization',
            icon: UserIcon
        },
        {
            id: 3,
            title: 'Your Location',
            description: 'Help us show you relevant planning applications',
            icon: MapPin
        },
        {
            id: 4,
            title: 'Ready to Go!',
            description: 'You\'re all set up and ready to start',
            icon: CheckCircle
        }
    ];

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) {
                router.push('/auth/login');
                return;
            }
            setUser(currentUser);

            // Pre-fill email if available
            if (currentUser.email) {
                setProfile(prev => ({ ...prev, email: currentUser.email || '' }));
            }
        };
        checkUser();
    }, [router]);

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;

        setLoading(true);
        try {
            console.log('Saving profile for user:', user.id);

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: profile.full_name,
                    company_name: profile.company_name,
                    address: profile.address,
                    email: profile.email,
                    onboarding_complete: false,
                    updated_at: new Date().toISOString()
                });

            if (error) {
                console.error('Error saving profile:', error);
                throw error;
            }

            console.log('Profile saved successfully');

            // Create initial bucket
            const { error: bucketError } = await supabase
                .from('buckets')
                .insert({
                    user_id: user.id,
                    title: 'My Applications',
                });

            if (bucketError) {
                console.error('Error creating bucket:', bucketError);
                throw bucketError;
            }

            console.log('Bucket created successfully');

            // Initialize balance
            const { error: balanceError } = await supabase
                .from('user_balances')
                .insert({
                    user_id: user.id,
                    balance: 0
                });

            if (balanceError) {
                console.error('Error creating balance:', balanceError);
                throw balanceError;
            }

            console.log('Balance initialized successfully');

            handleNext();
        } catch (error) {
            console.error('Error in handleSaveProfile:', error);
            // You might want to show an error message to the user here
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        if (!user) return;

        try {
            console.log('Marking onboarding as complete for user:', user.id);

            // Mark onboarding as complete
            const { error } = await supabase
                .from('profiles')
                .update({
                    onboarding_complete: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) {
                console.error('Error marking onboarding complete:', error);
                throw error;
            }

            console.log('Onboarding marked as complete successfully');
            router.push('/portal/dashboard');
        } catch (error) {
            console.error('Error completing onboarding:', error);
            // Continue with redirect even if there's an error
        }

        router.push('/portal/dashboard');
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Target className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold">Welcome to Planning Tracker!</h2>
                        <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                            You&apos;re about to join hundreds of professionals who use Planning Tracker to monitor
                            local planning applications and make their voices heard in community decisions.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Folder className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">Save Applications</h3>
                                <p className="text-sm text-base-content/60">Organize relevant planning applications in your personal bucket</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Send className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">Send Letters</h3>
                                <p className="text-sm text-base-content/60">Send professional objection letters with just a few clicks</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CreditCard className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">Track Spending</h3>
                                <p className="text-sm text-base-content/60">Monitor your letter costs and top up your balance anytime</p>
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold mb-2">Your Information</h2>
                            <p className="text-base-content/70">
                                This information will be used in your letter templates and for account management.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Full Name *</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="John Smith"
                                    className="input input-bordered"
                                    value={profile.full_name}
                                    onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Company Name</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Your Company Ltd"
                                    className="input input-bordered"
                                    value={profile.company_name}
                                    onChange={(e) => setProfile(prev => ({ ...prev, company_name: e.target.value }))}
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Email Address *</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="john@example.com"
                                    className="input input-bordered"
                                    value={profile.email}
                                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Phone Number</span>
                                </label>
                                <input
                                    type="tel"
                                    placeholder="+44 20 7123 4567"
                                    className="input input-bordered"
                                    value={profile.phone}
                                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                                />
                            </div>

                            <div className="form-control md:col-span-2">
                                <label className="label">
                                    <span className="label-text">Address</span>
                                </label>
                                <textarea
                                    placeholder="123 Main Street, London, SW1A 1AA"
                                    className="textarea textarea-bordered h-20"
                                    value={profile.address}
                                    onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MapPin className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold">Your Location</h2>
                        <p className="text-base-content/70 max-w-2xl mx-auto">
                            We&apos;ll use your location to show you the most relevant planning applications
                            in your area. You can always change this later in settings.
                        </p>

                        <div className="bg-base-200 rounded-lg p-6 max-w-md mx-auto">
                            <div className="flex items-center gap-3 mb-4">
                                <MapPin className="w-5 h-5 text-primary" />
                                <span className="font-medium">Current Location</span>
                            </div>
                            <p className="text-sm text-base-content/60 mb-4">
                                {profile.address || 'No address provided'}
                            </p>
                            <button className="btn btn-primary btn-sm">
                                Update Location
                            </button>
                        </div>

                        <div className="alert alert-info max-w-md mx-auto">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">
                                We&apos;ll automatically detect your location and show nearby planning applications
                            </span>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-success" />
                        </div>
                        <h2 className="text-2xl font-bold">You&apos;re All Set!</h2>
                        <p className="text-base-content/70 max-w-2xl mx-auto">
                            Your account has been created successfully. You can now start monitoring
                            planning applications and sending letters.
                        </p>

                        <div className="bg-base-200 rounded-lg p-6 max-w-md mx-auto">
                            <h3 className="font-semibold mb-4">What&apos;s Next?</h3>
                            <div className="space-y-3 text-left">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold text-primary">1</span>
                                    </div>
                                    <span className="text-sm">Browse planning applications</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold text-primary">2</span>
                                    </div>
                                    <span className="text-sm">Save interesting applications to your bucket</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold text-primary">3</span>
                                    </div>
                                    <span className="text-sm">Create letter templates and send letters</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (!user) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-base-content/60">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= step.id
                                    ? 'bg-primary text-primary-content'
                                    : 'bg-base-300 text-base-content/60'
                                    }`}>
                                    {currentStep > step.id ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : (
                                        <step.icon className="w-5 h-5" />
                                    )}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-16 h-1 mx-2 ${currentStep > step.id ? 'bg-primary' : 'bg-base-300'
                                        }`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="text-center">
                        <h1 className="text-lg font-semibold">{steps[currentStep - 1].title}</h1>
                        <p className="text-sm text-base-content/60">{steps[currentStep - 1].description}</p>
                    </div>
                </div>

                {/* Content Card */}
                <div className="card bg-base-100 shadow-lg border border-base-300">
                    <div className="card-body">
                        {renderStepContent()}

                        {/* Navigation */}
                        <div className="flex justify-between mt-8">
                            <button
                                className="btn btn-ghost"
                                onClick={handleBack}
                                disabled={currentStep === 1}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </button>

                            <div className="flex gap-2">
                                {currentStep === 2 && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleSaveProfile}
                                        disabled={loading || !profile.full_name || !profile.email}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="loading loading-spinner loading-sm"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                Save & Continue
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </button>
                                )}

                                {currentStep === 4 && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleComplete}
                                    >
                                        Get Started
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </button>
                                )}

                                {currentStep !== 2 && currentStep !== 4 && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleNext}
                                    >
                                        Continue
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
