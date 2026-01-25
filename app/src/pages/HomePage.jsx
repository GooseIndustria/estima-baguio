import React from 'react';
import { useNavigation, PAGES } from '../context/NavigationContext';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { ArrowRight, HardHat, FileText, ShoppingCart, Award } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
    const { navigateTo } = useNavigation();
    const { isInstallable, promptInstall } = useInstallPrompt();

    const handleJoin = async () => {
        if (isInstallable) {
            await promptInstall();
        } else {
            navigateTo(PAGES.PROJECTS);
        }
    };

    return (
        <div className="relative h-[100dvh] flex flex-col font-sans text-slate-900 bg-slate-50 overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/Background.png"
                    alt="Baguio City Background"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col flex-1 p-4 md:p-6 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl w-full justify-start gap-4 md:gap-6 pt-6 md:pt-10">

                {/* Header/Hero Section */}
                <div className="text-center space-y-2 md:space-y-4 shrink-0">
                    <div className="inline-flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 mx-auto">
                        <img src="/favicon.svg" alt="Estima Logo" className="w-4 h-4" />
                        <span className="font-bold text-base tracking-tight text-white">ESTIMA</span>
                        <Badge variant="secondary" className="bg-blue-600/90 text-white hover:bg-blue-700 border-none px-1.5 py-0.5 text-[9px]">BETA v1.1.0</Badge>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                        Professional Estimates. <br className="hidden md:block" />
                        <span className="text-blue-700">
                            On Your Smartphone.
                        </span>
                    </h1>

                    {/* Description - Hidden on very small screens */}
                    <p className="hidden sm:block text-sm md:text-base text-slate-700 max-w-lg mx-auto leading-relaxed font-medium">
                        Baguio City Prices. Local materials at your fingertips.
                    </p>
                </div>

                {/* Action Stack */}
                <div className="w-full max-w-2xl mx-auto space-y-2 md:space-y-3 shrink-0">

                    {/* Card 1: Local Prices */}
                    <div className="group flex items-stretch bg-slate-800/90 backdrop-blur-md rounded-lg overflow-hidden border border-white/10 shadow-lg">
                        <div className="bg-blue-900/80 w-12 md:w-16 flex items-center justify-center shrink-0">
                            <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-blue-100" strokeWidth={1.5} />
                        </div>
                        <div className="p-2.5 md:p-3 flex-1">
                            <h3 className="text-sm md:text-base font-bold text-white">Local Hardware Prices</h3>
                            <p className="text-slate-300 text-[10px] md:text-xs">Real-time prices from local hardware stores.</p>
                        </div>
                    </div>

                    {/* Card 2: PDF Export */}
                    <div className="group flex items-stretch bg-slate-800/90 backdrop-blur-md rounded-lg overflow-hidden border border-white/10 shadow-lg">
                        <div className="bg-blue-900/80 w-12 md:w-16 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-100" strokeWidth={1.5} />
                        </div>
                        <div className="p-2.5 md:p-3 flex-1">
                            <h3 className="text-sm md:text-base font-bold text-white">Download PDF of your Estimates</h3>
                            <p className="text-slate-300 text-[10px] md:text-xs">Generate professional cost estimates instantly.</p>
                        </div>
                    </div>

                    {/* Card 3: Join Beta CTA */}
                    <div className="group flex items-stretch bg-slate-800/90 backdrop-blur-md rounded-lg overflow-hidden border border-white/10 shadow-lg">
                        <div className="bg-blue-900/80 w-12 md:w-16 flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5 md:w-6 md:h-6 text-blue-100" strokeWidth={1.5} />
                        </div>
                        <div className="p-2 md:p-3 flex-1 flex flex-row items-center justify-between gap-2 md:gap-4">
                            <div className="text-left">
                                <h3 className="text-sm md:text-base font-bold text-white">Join BETA</h3>
                                <p className="text-slate-300 text-[10px] md:text-xs">Help us refine the experience.</p>
                            </div>
                            <Button
                                onClick={handleJoin}
                                size="sm"
                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 md:px-6 py-1.5 md:py-2 rounded-md text-xs md:text-sm shadow-lg transition-all shrink-0"
                            >
                                Join Now
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
