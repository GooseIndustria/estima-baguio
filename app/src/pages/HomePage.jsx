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
        <div className="relative min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50 overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/30" />
                <img
                    src="/Background.png"
                    alt="Baguio City Background"
                    className="w-full h-full object-cover opacity-100"
                />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col min-h-screen p-6 md:p-8 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl pt-12 md:pt-24 justify-center">

                {/* Header/Hero Section */}
                <div className="text-center mb-12 space-y-6">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 mx-auto">
                        <img src="/favicon.svg" alt="Estima Logo" className="w-6 h-6" />
                        <span className="font-bold text-xl tracking-tight text-white">ESTIMA</span>
                        <Badge variant="secondary" className="bg-blue-600 text-white hover:bg-blue-700 border-none">BETA v1.1.0</Badge>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] drop-shadow-lg">
                        Build with Confidence <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
                            in Baguio City.
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-md">
                        The ultimate tool for accurate construction cost estimation.
                        Real local material prices, professional PDF exports, and streamlined project management.
                    </p>
                </div>

                {/* Action Stack (Mockup Implementation) */}
                <div className="w-full max-w-2xl mx-auto space-y-4">

                    {/* Card 1: Local Prices */}
                    <div className="group flex items-stretch bg-slate-800/90 hover:bg-slate-800 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 shadow-2xl transition-all hover:scale-[1.01]">
                        <div className="bg-blue-900/80 w-20 md:w-24 flex items-center justify-center shrink-0">
                            <ShoppingCart className="w-8 h-8 md:w-10 md:h-10 text-blue-100" strokeWidth={1.5} />
                        </div>
                        <div className="p-5 md:p-6 flex-1">
                            <h3 className="text-xl font-bold text-white mb-1">Local Hardware Prices</h3>
                            <p className="text-slate-300 text-sm md:text-base">Real-time prices from local hardware stores in Baguio City.</p>
                        </div>
                    </div>

                    {/* Card 2: PDF Export */}
                    <div className="group flex items-stretch bg-slate-800/90 hover:bg-slate-800 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 shadow-2xl transition-all hover:scale-[1.01]">
                        <div className="bg-blue-900/80 w-20 md:w-24 flex items-center justify-center shrink-0">
                            <FileText className="w-8 h-8 md:w-10 md:h-10 text-blue-100" strokeWidth={1.5} />
                        </div>
                        <div className="p-5 md:p-6 flex-1">
                            <h3 className="text-xl font-bold text-white mb-1">Download PDF of your Estimates</h3>
                            <p className="text-slate-300 text-sm md:text-base">Generate professional construction cost estimates instantly.</p>
                        </div>
                    </div>

                    {/* Card 3: Join Beta CTA */}
                    <div className="group flex items-stretch bg-slate-800/90 hover:bg-slate-800 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 shadow-2xl transition-all hover:scale-[1.01]">
                        <div className="bg-blue-900/80 w-20 md:w-24 flex items-center justify-center shrink-0">
                            <Award className="w-8 h-8 md:w-10 md:h-10 text-blue-100" strokeWidth={1.5} />
                        </div>
                        <div className="p-4 md:p-5 flex-1 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="text-center md:text-left">
                                <h3 className="text-xl font-bold text-white mb-1">Join BETA</h3>
                                <p className="text-slate-300 text-sm md:text-base">Help us refine the experience.</p>
                            </div>
                            <Button
                                onClick={handleJoin}
                                size="lg"
                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-6 rounded-lg text-lg shadow-lg hover:shadow-orange-600/20 transition-all w-full md:w-auto"
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
