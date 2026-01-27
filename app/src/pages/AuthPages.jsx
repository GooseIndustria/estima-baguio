import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation, PAGES } from '../context/NavigationContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, User, ArrowLeft, LogOut, Eye, EyeOff, CheckCircle2, Facebook } from 'lucide-react';

// Common Layout Component
const AuthLayout = ({ title, subtitle, children, backAction }) => (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 bg-slate-50 animate-in fade-in duration-500">
        <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="relative">
                {backAction && (
                    <button
                        onClick={backAction}
                        className="absolute -left-2 -top-2 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                )}
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
                    {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
                </div>
            </div>
            {children}
        </div>
    </div>
);

export function LoginPage() {
    const { signIn, signInWithFacebook } = useAuth();
    const { navigateTo } = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error } = await signIn(email, password);
            if (error) throw error;
            navigateTo(PAGES.PROJECTS);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to access your estimates"
            backAction={() => navigateTo(PAGES.HOME)}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <Alert variant="destructive" className="bg-red-50 text-red-600 border-red-200 p-3 text-sm">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                            id="email"
                            type="email"
                            className="pl-9"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            className="pl-9 pr-10"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}
                </Button>

                {/* Facebook Login - Disabled for now due to business verification requirements
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-slate-500">Or continue with</span>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => signInWithFacebook()}
                    disabled={loading}
                >
                    <Facebook className="mr-2 h-4 w-4 text-[#1877F2]" />
                    Facebook
                </Button>
                */}
            </form>
            <div className="text-center text-sm space-y-2 text-slate-500">
                <p>
                    Don't have an account?{' '}
                    <button onClick={() => navigateTo('register')} className="font-semibold text-blue-600 hover:underline">
                        Sign up
                    </button>
                </p>
                <p>
                    <button onClick={() => navigateTo('forgot-password')} className="text-xs hover:underline">
                        Forgot password?
                    </button>
                </p>
            </div>
        </AuthLayout>
    );
}

export function RegisterPage() {
    const { signUp, signInWithFacebook } = useAuth();
    const { navigateTo } = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError("Passwords usually match, unlike these two.");
        }
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await signUp(email, password);
            if (error) throw error;

            // If email confirmation is disabled, we get a session immediately
            if (data?.session) {
                navigateTo(PAGES.PROJECTS);
            } else {
                // Otherwise show the check inbox screen
                setIsSuccess(true);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <AuthLayout
                title="Check your inbox"
                subtitle="We've sent you a confirmation link"
                backAction={() => navigateTo('login')}
            >
                <div className="flex flex-col items-center justify-center space-y-6 py-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="text-center space-y-2 text-slate-600">
                        <p>We've sent an email to <span className="font-semibold text-slate-900">{email}</span>.</p>
                        <p className="text-sm">Please click the link in that email to activate your account.</p>
                    </div>
                    <Button
                        onClick={() => navigateTo('login')}
                        variant="outline"
                        className="w-full"
                    >
                        Back to Sign In
                    </Button>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Create an account"
            subtitle="Start estimating professionally today"
            backAction={() => navigateTo('login')}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <Alert variant="destructive" className="bg-red-50 text-red-600 border-red-200 p-3 text-sm">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pr-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                        <Input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pr-10"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Account'}
                </Button>

                {/* Facebook Login - Disabled for now due to business verification requirements
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-slate-500">Or continue with</span>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => signInWithFacebook()}
                    disabled={loading}
                >
                    <Facebook className="mr-2 h-4 w-4 text-[#1877F2]" />
                    Facebook
                </Button>
                */}
            </form>
            <div className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <button onClick={() => navigateTo('login')} className="font-semibold text-blue-600 hover:underline">
                    Sign in
                </button>
            </div>
        </AuthLayout>
    );
}

export function ForgotPasswordPage() {
    const { resetPassword } = useAuth();
    const { navigateTo } = useNavigation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const { error } = await resetPassword(email);
            if (error) throw error;
            setMessage('Check your email for the password reset link.');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Reset Password"
            subtitle="We'll send you a link to reset it"
            backAction={() => navigateTo('login')}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {message && (
                    <Alert className="bg-green-50 text-green-600 border-green-200 p-3 text-sm">
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                )}
                {error && (
                    <Alert variant="destructive" className="bg-red-50 text-red-600 border-red-200 p-3 text-sm">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Reset Link'}
                </Button>
            </form>
        </AuthLayout>
    );
}

export function ResetPasswordPage() {
    const { updatePassword } = useAuth();
    const { navigateTo, PAGES } = useNavigation();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError("Passwords must match.");
        }
        setLoading(true);
        setError(null);
        try {
            const { error } = await updatePassword(password);
            if (error) throw error;
            setMessage('Password updated successfully! Redirecting to projects...');
            setTimeout(() => navigateTo(PAGES.PROJECTS), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Set New Password"
            subtitle="Enter your new password below"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {message && (
                    <Alert className="bg-green-50 text-green-600 border-green-200 p-3 text-sm">
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                )}
                {error && (
                    <Alert variant="destructive" className="bg-red-50 text-red-600 border-red-200 p-3 text-sm">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Update Password'}
                </Button>
            </form>
        </AuthLayout>
    );
}

export function ProfilePage() {
    const { user, signOut } = useAuth();
    const { navigateTo, PAGES } = useNavigation();

    const handleSignOut = async () => {
        await signOut();
        navigateTo(PAGES.HOME);
    };

    if (!user) return null;

    return (
        <AuthLayout title="Account Settings" backAction={() => navigateTo(PAGES.PROJECTS)}>
            <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg border">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Signed in as</p>
                        <p className="font-semibold text-slate-900 truncate max-w-[200px]">{user.email}</p>
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <Button
                        variant="destructive"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={handleSignOut}
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </Button>
                </div>
            </div>
        </AuthLayout>
    );
}
