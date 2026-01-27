import React from 'react';
import { useNavigation, PAGES } from '../context/NavigationContext';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";

const LegalLayout = ({ title, children, backAction }) => (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-8">
                {backAction && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={backAction}
                        className="rounded-full"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                )}
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
            </div>
            <div className="prose prose-slate max-w-none">
                {children}
            </div>
        </div>
    </div>
);

export function PrivacyPolicyPage() {
    const { navigateTo, PAGES } = useNavigation();

    return (
        <LegalLayout
            title="Privacy Policy"
            backAction={() => navigateTo(PAGES.HOME)}
        >
            <p><strong>Last Updated: January 27, 2026</strong></p>

            <h3>1. Introduction</h3>
            <p>Welcome to Estima ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice or our practices with regard to your personal information, please contact us.</p>

            <h3>2. Information We Collect</h3>
            <p>We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website, or otherwise when you contact us.</p>
            <p>The personal information that we collect depends on the context of your interactions with us and the website, the choices you make, and the products and features you use. The personal information we collect may include the following:</p>
            <ul>
                <li>Email addresses</li>
                <li>Passwords</li>
                <li>Social Media Login Data (Facebook)</li>
            </ul>

            <h3>3. How We Use Your Information</h3>
            <p>We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
            <ul>
                <li>To facilitate account creation and logon process.</li>
                <li>To send you marketing and promotional communications.</li>
                <li>To send administrative information to you.</li>
            </ul>

            <h3>4. Sharing Your Information</h3>
            <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.</p>

            <h3>5. Contact Us</h3>
            <p>If you have questions or comments about this policy, you may email us at support@estimabaguio.com.</p>
        </LegalLayout>
    );
}

export function DataDeletionPage() {
    const { navigateTo, PAGES } = useNavigation();

    return (
        <LegalLayout
            title="Data Deletion Instructions"
            backAction={() => navigateTo(PAGES.HOME)}
        >
            <p>According to Facebook Platform rules, we have to provide <strong>User Data Deletion Callback URL</strong> or <strong>Data Deletion Instructions URL</strong>. If you want to delete your activities for the Estima App, you can remove your information by following these steps:</p>

            <ol>
                <li>Go to your Facebook Account's Setting & Privacy. Click "Settings".</li>
                <li>Look for "Apps and Websites" and you will see all of the apps and websites you linked with your Facebook.</li>
                <li>Search and Click "Estima" in the search bar.</li>
                <li>Scroll and click "Remove".</li>
                <li>Congratulations, you have successfully removed your app activities.</li>
            </ol>

            <p>If you wish to permanently delete your account and all associated data from our systems, please follow these steps within the Estima application:</p>
            <ol>
                <li>Log in to your Estima account.</li>
                <li>Go to your "Profile" or "Account Settings" page.</li>
                <li>Click on the "Delete Account" button (if available) or contact our support team at support@estimabaguio.com to request full data deletion.</li>
            </ol>
        </LegalLayout>
    );
}
