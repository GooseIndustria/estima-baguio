import React from 'react';

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50 overflow-hidden">
            {/* Background Subtle Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white opacity-50" />

            {/* Animated Content */}
            <div className="relative flex flex-col items-center space-y-8">
                {/* Logo with Pulse Animation */}
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                    <img
                        src="/favicon.svg"
                        alt="Estima Logo"
                        className="w-24 h-24 relative animate-in fade-in zoom-in duration-1000 ease-out"
                    />
                </div>

                {/* Brand Text */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black tracking-tighter text-slate-900 animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-300 fill-mode-both">
                        ESTIMA
                    </h1>
                    <p className="text-blue-700 font-bold text-sm tracking-widest uppercase animate-in slide-in-from-bottom-2 fade-in duration-1000 delay-500 fill-mode-both">
                        Baguio City Prices
                    </p>
                </div>

                {/* Loading Progress Indicator */}
                <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-4">
                    <div
                        className="h-full bg-blue-600 rounded-full animate-[loading-progress_2s_ease-in-out_infinite]"
                        style={{ width: '40%' }}
                    />
                </div>
            </div>

            {/* Footer Signature */}
            <div className="absolute bottom-8 text-[10px] text-slate-400 font-medium tracking-wide animate-in fade-in duration-1000 delay-700 fill-mode-both">
                DEVELOPED BY GOOSE INDUSTRIA
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes loading-progress {
          0% { transform: translateX(-100%); width: 20%; }
          50% { transform: translateX(100%); width: 60%; }
          100% { transform: translateX(300%); width: 20%; }
        }
      `}} />
        </div>
    );
}
