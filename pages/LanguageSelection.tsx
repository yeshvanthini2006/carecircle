
import React from 'react';
import { Globe, ArrowRight } from 'lucide-react';

interface LanguageSelectionProps {
  onSelect: (lang: 'English' | 'Tamil') => void;
}

const LanguageSelection: React.FC<LanguageSelectionProps> = ({ onSelect }) => {
  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center px-4 py-20 bg-gradient-to-b from-gray-50 to-emerald-50/30">
      <div className="max-w-4xl w-full text-center space-y-12">
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-white font-black text-4xl mx-auto shadow-2xl shadow-emerald-200 mb-8 rotate-3 hover:rotate-0 transition-transform cursor-pointer">
            C
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-tight">
            Welcome to <span className="text-emerald-600">CareCircle</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 font-medium max-w-2xl mx-auto">
            Connecting generations with compassion and verified care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <button 
            onClick={() => onSelect('English')}
            className="group relative p-10 bg-white rounded-[3rem] shadow-xl border-2 border-transparent hover:border-emerald-500 hover:shadow-2xl transition-all text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Globe size={120} />
            </div>
            <div className="relative z-10">
              <span className="text-emerald-600 font-black text-sm uppercase tracking-[0.2em] mb-4 block">English</span>
              <h3 className="text-4xl font-black text-gray-900 mb-2">Continue in English</h3>
              <p className="text-gray-500 font-medium text-lg mb-8">Access all features in English language.</p>
              <div className="flex items-center gap-2 font-black text-emerald-600 group-hover:gap-4 transition-all">
                Get Started <ArrowRight size={20} />
              </div>
            </div>
          </button>

          <button 
            onClick={() => onSelect('Tamil')}
            className="group relative p-10 bg-white rounded-[3rem] shadow-xl border-2 border-transparent hover:border-emerald-500 hover:shadow-2xl transition-all text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Globe size={120} />
            </div>
            <div className="relative z-10">
              <span className="text-emerald-600 font-black text-sm uppercase tracking-[0.2em] mb-4 block">தமிழ்</span>
              <h3 className="text-4xl font-black text-gray-900 mb-2">தமிழில் தொடரவும்</h3>
              <p className="text-gray-500 font-medium text-lg mb-8">அனைத்து வசதிகளையும் தமிழில் அணுகுங்கள்.</p>
              <div className="flex items-center gap-2 font-black text-emerald-600 group-hover:gap-4 transition-all">
                தொடங்குவோம் <ArrowRight size={20} />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelection;
