import React, { useState } from 'react';
import { useNavigation, PAGES } from '../context/NavigationContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CheckCircle2, MessageSquare } from 'lucide-react';

export default function FeedbackPage() {
    const { navigateTo } = useNavigation();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        type: 'General Feedback',
        message: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.message.trim()) return;

        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Feedback submitted:', formData);
        setIsLoading(false);
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="container max-w-xl mx-auto px-4 py-12 text-center space-y-6">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold">Thank You!</h1>
                <p className="text-muted-foreground">
                    Your feedback has been received. We appreciate your help in making Estima better for everyone in Baguio!
                </p>
                <div className="pt-4">
                    <Button onClick={() => navigateTo(PAGES.HOME)} variant="outline">
                        Return to Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-xl mx-auto px-4 py-6 md:py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="space-y-4">
                <button
                    onClick={() => navigateTo(PAGES.HOME)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </button>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <MessageSquare className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Feedback</h1>
                        <p className="text-sm text-muted-foreground">Help us improve Estima Baguio</p>
                    </div>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="type">Feedback Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData({ ...formData, type: value })}
                        >
                            <SelectTrigger id="type">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="General Feedback">General Feedback</SelectItem>
                                <SelectItem value="Bug Report">Bug Report</SelectItem>
                                <SelectItem value="Price Update">Price Update</SelectItem>
                                <SelectItem value="Feature Request">Feature Request</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name (Optional)</Label>
                            <Input
                                id="name"
                                placeholder="Your name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email (Optional)</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            placeholder="What's on your mind? Tell us about a bug, a missing store, or a price that needs updating."
                            className="min-h-[150px] resize-none"
                            required
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base font-bold"
                    disabled={isLoading || !formData.message.trim()}
                >
                    {isLoading ? "Submitting..." : "Submit Feedback"}
                </Button>
            </form>

            <footer className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                    ESTIMA · BAGUIO CITY · 2026
                </p>
            </footer>
        </div>
    );
}
