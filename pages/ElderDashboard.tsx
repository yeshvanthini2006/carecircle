
import React, { useState, useRef, useEffect } from 'react';
import { User, CareRequest, ServiceCategory, RequestStatus } from '../types';
import { PlusCircle, Clock, History, MapPin, Phone, MessageSquare, Mic, Camera, Star, X, CheckCircle2, User as UserIcon, AudioLines, Sparkles, Loader2, Square, CreditCard, CheckCircle, Navigation } from 'lucide-react';
import { calculatePayment } from '../utils/calculations';
import { CATEGORY_STYLES, STATUS_STYLES, INITIAL_USERS } from '../constants';
import { GoogleGenAI } from "@google/genai";

interface ElderDashboardProps {
  language: 'English' | 'Tamil';
  user: User;
  requests: CareRequest[];
  onCreateRequest: (req: CareRequest) => void;
  onCancelRequest: (id: string) => void;
  onCompletePayment: (id: string) => void;
  onPayRequest: (id: string) => void;
  onAddFeedback: (id: string, rating: number, feedback: string) => void;
}

const ElderDashboard: React.FC<ElderDashboardProps> = ({ 
  language, user, requests, onCreateRequest, onCancelRequest, onCompletePayment, onPayRequest, onAddFeedback 
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'my' | 'history'>('my');
  const [showFeedbackModal, setShowFeedbackModal] = useState<string | null>(null);
  const [showTrackerModal, setShowTrackerModal] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [category, setCategory] = useState<ServiceCategory>('Basic');
  const [description, setDescription] = useState('');
  const [distance, setDistance] = useState(1);
  const [hours, setHours] = useState(1);
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState(user.address || '');
  const [destination, setDestination] = useState(''); // Middle point (Shop)
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);

  // Sync addresses when category changes
  useEffect(() => {
    if (category === 'Technical' || category === 'Personal') {
      setPickup(user.address || '');
      setDrop(user.address || '');
    } else {
      setDrop(user.address || '');
      setPickup('');
    }
  }, [category, user.address]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const transcribeAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              { text: "Transcribe this help request for an elderly person. If in Tamil, translate to English." },
              { inlineData: { mimeType: 'audio/webm', data: base64Audio } }
            ]
          }
        });
        const transcription = response.text;
        if (transcription) setDescription(prev => prev ? `${prev}\n${transcription}` : transcription);
        setIsTranscribing(false);
      };
    } catch (error) {
      setIsTranscribing(false);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDescription = (category !== 'Basic') 
      ? `[Destination: ${destination}] ${description}`
      : description;

    const newReq: CareRequest = {
      id: `req-${Date.now()}`,
      elderId: user.id,
      helperId: null,
      category,
      description: finalDescription,
      distanceKm: distance,
      hours,
      pickupAddress: pickup,
      dropAddress: drop,
      status: 'searching',
      timestamp: new Date().toISOString(),
      payment: calculatePayment(category, distance),
      isPaid: false,
      photo: attachedPhoto || undefined
    };
    onCreateRequest(newReq);
    setActiveTab('my');
    resetForm();
  };

  const resetForm = () => {
    setDescription('');
    setDestination('');
    setDistance(1);
    setHours(1);
    setAttachedPhoto(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAttachedPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const getHelperDetails = (helperId: string | null) => {
    if (!helperId) return null;
    const users = JSON.parse(localStorage.getItem('cc_users') || '[]');
    return users.find((u: User) => u.id === helperId);
  };

  const RequestTimeline = ({ status }: { status: RequestStatus }) => {
    const stages: RequestStatus[] = ['searching', 'assigned', 'on_the_way', 'in_progress', 'completed'];
    const currentIdx = stages.indexOf(status);
    return (
      <div className="flex items-center justify-between w-full mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 -z-10" />
        {stages.map((stage, idx) => (
          <div key={stage} className="flex flex-col items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              idx <= currentIdx ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {idx < currentIdx ? <CheckCircle2 size={16} /> : idx + 1}
            </div>
            <span className={`text-[10px] font-bold uppercase ${idx <= currentIdx ? 'text-emerald-600' : 'text-gray-400'}`}>
              {stage.replace('_', ' ')}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Banner */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-500 rounded-[2.5rem] p-8 md:p-12 text-white mb-10 shadow-xl border border-emerald-400/20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h1 className="text-4xl font-extrabold mb-2 tracking-tight">Welcome, {user.name}</h1>
            <p className="text-emerald-50 text-lg opacity-90 font-medium">How can our community help you today?</p>
          </div>
          <button 
            onClick={() => setActiveTab('create')}
            className="px-8 py-4 bg-white text-emerald-600 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-xl shadow-emerald-900/10 active:scale-95 flex items-center gap-3"
          >
            <PlusCircle size={22} /> New Request
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'my', label: 'Tracking', icon: Clock },
          { id: 'history', label: 'Past Activity', icon: History }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-8 py-3 rounded-2xl font-bold flex items-center gap-3 transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-gray-400 hover:text-gray-600 border border-gray-100'
            }`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'create' && (
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-xl max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Post New Need</h2>
            <button onClick={() => setActiveTab('my')} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition-colors"><X size={20} /></button>
          </div>
          
          <form onSubmit={handleCreate} className="space-y-8">
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Select Category</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(['Basic', 'Technical', 'Personal'] as ServiceCategory[]).map(cat => (
                  <button 
                    key={cat} type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-5 px-4 rounded-3xl border-2 font-black transition-all flex flex-col items-center gap-1 ${
                      category === cat ? 'border-emerald-600 bg-emerald-50 text-emerald-600' : 'border-gray-50 bg-gray-50/50 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <span className="text-lg">{cat}</span>
                    <span className="text-[10px] opacity-60 uppercase">{cat === 'Basic' ? 'Errands' : cat === 'Technical' ? 'Gadgets' : 'Escort'}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Pickup Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                  <input 
                    type="text" required 
                    disabled={category !== 'Basic'}
                    value={pickup} onChange={e => setPickup(e.target.value)} 
                    placeholder={category === 'Basic' ? "Enter shop or location..." : "Auto-filled: Home"} 
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold ${category === 'Basic' ? 'bg-gray-50' : 'bg-emerald-50/50 text-emerald-700'}`} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Drop Address</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                  <input 
                    type="text" required disabled
                    value={drop} 
                    className="w-full pl-12 pr-4 py-4 bg-emerald-50/50 text-emerald-700 rounded-2xl outline-none font-bold" 
                  />
                </div>
              </div>
            </div>

            {(category === 'Technical' || category === 'Personal') && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Destination / Shop Point</label>
                <div className="relative">
                  <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                  <input 
                    type="text" required 
                    value={destination} onChange={e => setDestination(e.target.value)} 
                    placeholder="Where should the helper take you or the device?" 
                    className="w-full pl-12 pr-4 py-4 bg-blue-50/50 text-blue-700 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" 
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Distance (KM)</label>
                <input type="number" min="1" value={distance} onChange={e => setDistance(parseInt(e.target.value))} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-black text-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Est. Hours</label>
                <input type="number" min="1" value={hours} onChange={e => setHours(parseInt(e.target.value))} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-black text-xl" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Request Details</label>
                {!isRecording ? (
                  <button type="button" onClick={startRecording} disabled={isTranscribing} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black hover:bg-emerald-100 transition-colors"><Mic size={14} /> Record Voice</button>
                ) : (
                  <button type="button" onClick={stopRecording} className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-600 rounded-xl text-xs font-black animate-pulse"><Square size={14} fill="currentColor" /> Stop Recording</button>
                )}
              </div>

              <div className="relative">
                <textarea 
                  required value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Tell us exactly what you need help with..."
                  className="w-full px-6 py-6 bg-gray-50 border-none rounded-[2rem] min-h-[140px] outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-lg resize-none shadow-inner"
                />
                {isTranscribing && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] rounded-[2rem] flex flex-col items-center justify-center gap-3">
                    <Loader2 className="animate-spin text-emerald-600" size={32} />
                    <span className="text-emerald-700 font-black flex items-center gap-2"><Sparkles size={18} /> Transcribing with AI...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 bg-emerald-50/50 rounded-[2.5rem] flex flex-col sm:flex-row justify-between items-center gap-6 border border-emerald-100 shadow-sm">
              <div className="text-center sm:text-left">
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.2em] opacity-60">Calculated Service Fee</span>
                <div className="text-4xl font-black text-emerald-600">₹{calculatePayment(category, distance)}</div>
              </div>
              <button type="submit" className="w-full sm:w-auto px-12 py-5 bg-emerald-600 text-white rounded-2xl font-black text-xl hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-200">
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'my' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length === 0 ? (
            <div className="col-span-full py-40 text-center bg-white rounded-[3rem] border-4 border-dashed border-gray-100">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200"><Clock size={48} /></div>
              <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Everything is quiet.</h3>
              <p className="text-gray-400 font-bold text-lg">Need anything? Post a new request above.</p>
            </div>
          ) : (
            requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').map(req => {
              const helper = getHelperDetails(req.helperId);
              return (
                <div key={req.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl hover:shadow-2xl transition-all flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${CATEGORY_STYLES[req.category]}`}>{req.category}</span>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_STYLES[req.status]}`}>{req.status.replace('_', ' ')}</span>
                  </div>
                  <h3 className="font-black text-xl mb-6 text-gray-900 leading-tight flex-1 line-clamp-3">{req.description}</h3>
                  
                  {helper ? (
                    <div className="mb-8 p-5 bg-emerald-50/50 rounded-3xl border border-emerald-100 flex items-center gap-4">
                      <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">{helper.avatar}</div>
                      <div className="flex-1">
                        <div className="font-black text-gray-900">{helper.name}</div>
                        <div className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={12} /> Assigned Helper</div>
                      </div>
                      <a href={`tel:${helper.phone}`} className="p-3 bg-white text-emerald-600 rounded-xl shadow-sm border border-emerald-100 hover:scale-110 transition-transform"><Phone size={18} /></a>
                    </div>
                  ) : (
                    <div className="mb-8 p-6 bg-gray-50 rounded-3xl text-center border border-gray-100">
                      <Loader2 className="animate-spin text-emerald-500 mx-auto mb-2" size={24} />
                      <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Searching for helpers...</div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fare</span>
                      <span className="font-black text-emerald-600 text-2xl tracking-tighter">₹{req.payment}</span>
                    </div>
                    <button 
                      onClick={() => setShowTrackerModal(req.id)}
                      className="bg-gray-900 text-white px-6 py-4 rounded-2xl text-sm font-black shadow-xl shadow-gray-200 hover:bg-black active:scale-95 transition-all"
                    >
                      View Progress
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tracker Modal */}
      {showTrackerModal && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[110]">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-xl relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowTrackerModal(null)} className="absolute top-8 right-8 p-3 bg-gray-100 text-gray-400 hover:text-gray-900 rounded-full"><X size={20} /></button>
            <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Activity Status</h2>
            <p className="text-gray-500 font-bold mb-10">Real-time update on your service request</p>
            {(() => {
              const req = requests.find(r => r.id === showTrackerModal);
              if (!req) return null;
              const helper = getHelperDetails(req.helperId);
              return (
                <div className="space-y-8">
                  <RequestTimeline status={req.status} />
                  <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                    <div className="flex items-center gap-4 mb-8">
                      <div className={`p-5 rounded-3xl ${req.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {req.status === 'searching' ? <Clock className="animate-pulse" size={28} /> : <UserIcon size={28} />}
                      </div>
                      <div>
                        <div className="text-xl font-black text-gray-900 capitalize tracking-tight">{req.status.replace('_', ' ')}</div>
                        <div className="text-sm font-bold text-gray-400">{req.status === 'searching' ? 'We are notifying verified helpers in your area.' : 'The service is currently being handled.'}</div>
                      </div>
                    </div>
                    {helper ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black text-xl">{helper.avatar}</div>
                            <div><div className="font-black text-lg leading-none">{helper.name}</div><div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">✓ Verified Helper</div></div>
                          </div>
                          <a href={`tel:${helper.phone}`} className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-colors"><Phone size={20} /></a>
                        </div>
                        {req.status === 'completed' && !req.isPaid && (
                          <button onClick={() => onPayRequest(req.id)} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3">
                            <CreditCard size={24} /> Pay Request (₹{req.payment})
                          </button>
                        )}
                        {req.isPaid && (
                          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex items-center justify-center gap-4 text-emerald-700 font-black text-lg">
                            <CheckCircle size={32} /> Payment Confirmed
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-gray-400 font-bold italic bg-white/50 rounded-2xl border-2 border-dashed border-gray-100 tracking-wide">Assigning the best available helper...</div>
                    )}
                  </div>
                  <button onClick={() => setShowTrackerModal(null)} className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-xl hover:bg-black transition-all">Close Tracker</button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black">
              <tr>
                <th className="px-10 py-8">Service Date</th>
                <th className="px-10 py-8">Category & Details</th>
                <th className="px-10 py-8">Status</th>
                <th className="px-10 py-8 text-right">Fee / Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-bold">
              {requests.filter(r => r.status === 'completed' || r.status === 'cancelled').map(req => (
                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-10 py-8 text-gray-500">{new Date(req.timestamp).toLocaleDateString()}</td>
                  <td className="px-10 py-8">
                    <div className="text-gray-900 text-lg mb-1">{req.category}</div>
                    <div className="text-xs text-gray-400 line-clamp-1">{req.description}</div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_STYLES[req.status]}`}>{req.status}</span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="text-2xl font-black text-gray-900 mb-2">₹{req.payment}</div>
                    {req.status === 'completed' && !req.rating && (
                      <button onClick={() => setShowFeedbackModal(req.id)} className="text-emerald-600 font-black text-xs hover:underline uppercase tracking-widest">Rate Helper</button>
                    )}
                    {req.rating && (
                      <div className="flex justify-end text-yellow-400 gap-1">
                        {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < req.rating! ? 'currentColor' : 'none'} />)}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[110]">
          <div className="bg-white rounded-[3rem] p-12 w-full max-w-lg relative animate-in zoom-in-95 duration-200 shadow-2xl text-center">
            <button onClick={() => setShowFeedbackModal(null)} className="absolute top-8 right-8 p-3 text-gray-400 hover:text-gray-900 rounded-full transition-colors"><X size={20} /></button>
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6"><Star size={40} /></div>
            <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">How was it?</h2>
            <p className="text-gray-500 font-bold mb-10">Rate the service to help maintain high quality.</p>
            <div className="flex justify-center gap-4 mb-12">
              {[1, 2, 3, 4, 5].map(num => (
                <button key={num} onClick={() => setRating(num)} className={`transition-all hover:scale-125 ${rating >= num ? 'text-yellow-400' : 'text-gray-200'}`}>
                  <Star size={48} fill={rating >= num ? 'currentColor' : 'none'} strokeWidth={1.5} />
                </button>
              ))}
            </div>
            <textarea 
              value={feedback} onChange={e => setFeedback(e.target.value)}
              placeholder="Was the helper polite? Did they arrive on time?"
              className="w-full p-8 bg-gray-50 border-none rounded-[2rem] h-36 outline-none focus:ring-4 focus:ring-emerald-500/10 mb-10 font-bold shadow-inner resize-none"
            />
            <button 
              onClick={() => {
                if (showFeedbackModal) {
                  onAddFeedback(showFeedbackModal, rating, feedback);
                  setShowFeedbackModal(null);
                }
              }}
              className="w-full bg-emerald-600 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElderDashboard;
