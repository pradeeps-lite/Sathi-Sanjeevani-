import React from 'react';
import { ArrowRight } from 'lucide-react';
import logoMyGov from '../../assets/images/Logo Mygov.png';
import splashArt from '../../assets/images/sanjeevani_splash_art_1785328020468.jpg';

interface SplashScreenProps {
  onGetStarted: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onGetStarted }) => {
  return (
    <div className="flex-1 flex flex-col justify-between p-5 bg-[#FBF7EE] text-gray-800 animate-fadeIn">
      {/* 1. Official Government Header Banner with Attached Logos */}
      <div className="pt-2 flex flex-col items-center">
        {/* Ministry of Youth Affairs and Sports + My Bharat Logo Card */}
        <div className="w-full bg-white rounded-2xl p-3 shadow-2xs border border-[#E5DEC9] flex flex-col items-center">
          <img
            src={logoMyGov}
            alt="Ministry of Youth Affairs and Sports - My Bharat"
            className="w-full max-w-[340px] h-auto max-h-14 object-contain"
          />
          
          {/* Subtle Indian Tricolor Divider Strip */}
          <div className="w-full h-[2.5px] rounded-full mt-2.5 flex overflow-hidden">
            <div className="flex-1 bg-[#FF9933]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#138808]" />
          </div>
        </div>
      </div>

      {/* 2. Main Medical Visual & Title (Minimal Govt Style) */}
      <div className="my-auto py-4 flex flex-col items-center text-center">
        {/* Cleanly framed hero illustration */}
        <div className="relative rounded-2xl overflow-hidden shadow-xs border border-[#E5DEC9] w-full max-w-[340px] bg-white">
          <img
            src={splashArt}
            alt="Sanjeevani AI Rural Healthcare Companion"
            className="w-full h-48 object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Title in Clean Minimal Govt Style */}
        <div className="mt-4 flex flex-col items-center">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1E5638] font-['Plus_Jakarta_Sans',sans-serif]">
            Sanjeevani AI
          </h1>
          <p className="text-xs font-bold text-gray-700 mt-1">
            राष्ट्रीय ग्रामीण स्वास्थ्य साथी
          </p>
          <p className="text-[10px] text-gray-500 font-medium mt-0.5">
            AI-Powered Healthcare Companion for Rural India
          </p>
        </div>
      </div>

      {/* 3. Minimal Govt App "Get Started" Action Button */}
      <div className="pt-2 pb-1">
        <button
          onClick={onGetStarted}
          className="w-full py-3.5 bg-[#2E6B4F] hover:bg-[#23533E] active:scale-98 text-white font-black rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition tracking-wide"
        >
          <span>आरंभ करें • Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
