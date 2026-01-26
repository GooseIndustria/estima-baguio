import React from 'react';
import { useNavigation, PAGES } from '../context/NavigationContext';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { HardHat, FileText, ShoppingCart, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";

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
            <div className="relative z-10 flex flex-col flex-1 p-4 md:p-6 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl w-full justify-start gap-3 md:gap-5 pt-6 md:pt-10">

                {/* Header/Hero Section */}
                <div className="text-center space-y-4 md:space-y-6 shrink-0 mb-6 md:mb-8">
                    {/* Logo - Simple, no pill */}
                    <div className="inline-flex items-center gap-2 mx-auto">
                        <img src="/favicon.svg" alt="Estima Logo" className="w-7 h-7" />
                        <span className="font-bold text-xl tracking-tight text-slate-900">ESTIMA</span>
                    </div>

                    <h1 className="font-extrabold text-slate-900 tracking-tight leading-[1.1] whitespace-nowrap" style={{ fontSize: 'clamp(1.25rem, 7vw, 3rem)' }}>
                        Professional Estimation Tool <br />
                        <span className="text-blue-700">
                            On Your Smartphone
                        </span>
                    </h1>

                    <p className="hidden sm:block text-sm md:text-base text-slate-700 max-w-lg mx-auto leading-relaxed font-medium">
                        Baguio City Prices. Local materials at your fingertips.
                    </p>
                </div>

                {/* Feature Cards Stack */}
                <div className="w-full max-w-2xl mx-auto space-y-2 shrink-0">

                    {/* Card 1: Local Prices */}
                    <div className="group flex items-stretch bg-slate-800/70 backdrop-blur-md rounded-lg overflow-hidden border border-white/10 shadow-lg">
                        <div className="bg-blue-900/80 w-12 md:w-16 flex items-center justify-center shrink-0">
                            <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-blue-100" strokeWidth={1.5} />
                        </div>
                        <div className="p-2.5 md:p-3 flex-1 space-y-0">
                            <h3 className="text-sm md:text-base font-bold text-white mb-0">Baguio Hardware Prices</h3>
                            <p className="text-slate-300 text-[10px] md:text-xs mt-0">Latest price for over 80 items. More items added weekly.</p>
                        </div>
                    </div>

                    {/* Card 2: PDF Export */}
                    <div className="group flex items-stretch bg-slate-800/70 backdrop-blur-md rounded-lg overflow-hidden border border-white/10 shadow-lg">
                        <div className="bg-blue-900/80 w-12 md:w-16 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-100" strokeWidth={1.5} />
                        </div>
                        <div className="p-2.5 md:p-3 flex-1 space-y-0">
                            <h3 className="text-sm md:text-base font-bold text-white mb-0">Download PDF of your Estimates</h3>
                            <p className="text-slate-300 text-[10px] md:text-xs mt-0">Generate professional cost estimates instantly.</p>
                        </div>
                    </div>

                    {/* Card 3: Beta Testing Info */}
                    <button
                        onClick={() => navigateTo(PAGES.FEEDBACK)}
                        className="w-full text-left group flex items-stretch bg-slate-800/70 backdrop-blur-md rounded-lg overflow-hidden border border-white/10 shadow-lg hover:bg-slate-700/80 transition-all active:scale-[0.98]"
                    >
                        <div className="bg-blue-900/80 w-12 md:w-16 flex items-center justify-center shrink-0">
                            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-blue-100 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                        </div>
                        <div className="p-2.5 md:p-3 flex-1 space-y-0">
                            <h3 className="text-sm md:text-base font-bold text-white mb-0">Beta Testing</h3>
                            <p className="text-slate-300 text-[10px] md:text-xs mt-0">Help us refine prices and improve the experience.</p>
                        </div>
                    </button>

                </div>

                {/* CTA Button - Separate from cards */}
                <Button
                    onClick={handleJoin}
                    size="lg"
                    className="w-full max-w-2xl mx-auto bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 md:py-4 rounded-lg text-base md:text-lg shadow-xl transition-all shrink-0"
                >
                    Join Now
                </Button>

            </div>

            {/* Footer */}
            <div className="relative z-10 text-center py-3 text-[10px] text-slate-600 font-medium">
                v1.1.0 · Developed by Goose Industria
            </div>
        </div>
    );
}
