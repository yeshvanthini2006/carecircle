
import React, { useState } from 'react';
import { User, Role, HelperType, ServiceCategory } from '../types';
import { UserPlus, ChevronRight, ChevronLeft, Upload, Smartphone, Mail, Lock, User as UserIcon, FileText } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface SignupPageProps {
  onSignup: (user: User) => void;
  onGoToLogin: () => void;
  language: 'English' | 'Tamil';
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignup, onGoToLogin, language }) => {
  const [role, setRole] = useState<Role | null>(null);
  const [step, setStep] = useState(1);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    password: '',
    language: language,
    address: '',
    helperType: 'Student' as HelperType,
    categories: [] as ServiceCategory[],
    orgName: ''
  });
  const [errors, setErrors] = useState<string[]>([]);

  const t = TRANSLATIONS[language];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedDocs(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: string[] = [];
    if (formData.name.trim().length < 2) newErrors.push(language === 'English' ? 'Name is too short' : 'பெயர் மிகக் குறைவு');
    
    const ageNum = parseInt(formData.age);
    if (role === 'elder') {
      if (ageNum < 55 || ageNum > 89) newErrors.push(language === 'English' ? 'Elder age must be 55-89' : 'பெரியவர்களின் வயது 55-89 ஆக இருக்க வேண்டும்');
    } else {
      if (ageNum < 18 || ageNum > 35) newErrors.push(language === 'English' ? 'Helper age must be 18-35' : 'உதவியாளர் வயது 18-35 ஆக இருக்க வேண்டும்');
      if (uploadedDocs.length === 0) newErrors.push(language === 'English' ? 'Please upload at least one ID proof' : 'தயவுசெய்து அடையாளச் சான்றை பதிவேற்றவும்');
    }

    if (!/^\d{10}$/.test(formData.phone)) newErrors.push(language === 'English' ? 'Phone must be exactly 10 digits' : 'தொலைபேசி எண் 10 இலக்கங்களாக இருக்க வேண்டும்');
    if (formData.password.length < 6) newErrors.push(language === 'English' ? 'Password must be at least 6 characters' : 'கடவுச்சொல் குறைந்தது 6 எழுத்துக்களாக இருக்க வேண்டும்');
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      role: role!,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      age: parseInt(formData.age),
      language: language,
      avatar: formData.name.charAt(0).toUpperCase(),
      password: formData.password,
      ...(role === 'elder' ? { address: formData.address } : {
        helperType: formData.helperType,
        categories: formData.categories,
        verificationStatus: 'pending',
        orgName: formData.orgName,
        documents: uploadedDocs
      })
    };

    onSignup(newUser);
  };

  if (!role) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">{t.signup}</h1>
        <p className="text-xl text-gray-500 mb-12 font-medium">{t.selectLang}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button 
            onClick={() => setRole('elder')}
            className="group p-10 bg-white rounded-[3rem] shadow-xl border-2 border-transparent hover:border-emerald-500 hover:shadow-2xl transition-all text-left"
          >
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UserIcon size={32} />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-2">{t.elder}</h3>
            <p className="text-gray-500 font-medium">{language === 'English' ? "I am looking for support (Age 55-89)" : "எனக்கு உதவி தேவை (வயது 55-89)"}</p>
          </button>

          <button 
            onClick={() => setRole('helper')}
            className="group p-10 bg-white rounded-[3rem] shadow-xl border-2 border-transparent hover:border-blue-500 hover:shadow-2xl transition-all text-left"
          >
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UserPlus size={32} />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-2">{t.helper}</h3>
            <p className="text-gray-500 font-medium">{language === 'English' ? "I want to help others (Age 18-35)" : "நான் மற்றவர்களுக்கு உதவ விரும்புகிறேன் (வயது 18-35)"}</p>
          </button>
        </div>
        
        <button onClick={onGoToLogin} className="mt-12 text-gray-400 hover:text-emerald-600 font-black text-lg underline">{t.alreadyHaveAccount}</button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 animate-in slide-in-from-right-4 duration-300">
        <div className="mb-10 flex items-center justify-between">
          <button onClick={() => setRole(null)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 bg-gray-50 rounded-full">
            <ChevronLeft size={24} />
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-black tracking-tight">{t[role as keyof typeof t] || role} {t.signup}</h2>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Step {step} of 2</p>
          </div>
          <div className="w-10" />
        </div>

        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold">
            <ul className="list-disc pl-4 space-y-1">
              {errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}

        <form onSubmit={handleFinalSubmit} className="space-y-6">
          {step === 1 ? (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{t.name}</label>
                  <input 
                    type="text" required
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-bold"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{t.age}</label>
                  <input 
                    type="number" required
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-bold"
                    value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{t.phone}</label>
                  <input 
                    type="tel" required
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-bold"
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setStep(2)}
                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 active:scale-95"
              >
                {t.next} <ChevronRight size={18} />
              </button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{t.email}</label>
                  <input 
                    type="email" required
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-bold"
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{t.password}</label>
                  <input 
                    type="password" required
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-bold"
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>

                {role === 'elder' ? (
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{t.address}</label>
                    <textarea 
                      required
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-bold h-24 resize-none"
                      value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{language === 'English' ? 'Helper Type' : 'உதவியாளர் வகை'}</label>
                      <select 
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-bold"
                        value={formData.helperType} onChange={e => setFormData({...formData, helperType: e.target.value as HelperType})}
                      >
                        <option value="Student">{language === 'English' ? 'Student' : 'மாணவர்'}</option>
                        <option value="Part-Time">{language === 'English' ? 'Part-Time' : 'பகுதி நேர'}</option>
                        <option value="Volunteer">{language === 'English' ? 'Volunteer' : 'தன்னார்வலர்'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{language === 'English' ? 'College/Org' : 'கல்லூரி/நிறுவனம்'}</label>
                      <input 
                        type="text" required
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-bold"
                        value={formData.orgName} onChange={e => setFormData({...formData, orgName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{language === 'English' ? 'Upload ID Proof' : 'அடையாளச் சான்று பதிவேற்றம்'}</label>
                      <div className="relative group border-4 border-dashed border-gray-100 rounded-[2rem] p-6 text-center hover:border-emerald-500 transition-colors cursor-pointer bg-gray-50">
                        <Upload className="mx-auto mb-2 text-gray-400 group-hover:text-emerald-500" size={32} />
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block">{language === 'English' ? 'JPG/PDF ONLY' : 'JPG/PDF மட்டும்'}</span>
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileUpload} />
                        {uploadedDocs.length > 0 && (
                          <div className="mt-4 flex items-center justify-center gap-2 text-emerald-600 font-black text-xs">
                            <FileText size={16} /> {uploadedDocs.length} {language === 'English' ? 'File(s) attached' : 'கோப்புகள் இணைக்கப்பட்டுள்ளன'}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-4">
                <button 
                  type="button" onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 text-gray-500 py-5 rounded-2xl font-black hover:bg-gray-200 transition-all"
                >
                  {t.back}
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 active:scale-95"
                >
                  {t.signup}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
