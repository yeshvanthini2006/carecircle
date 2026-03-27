
import React, { useState } from 'react';
import { User, CareRequest, RequestStatus } from '../types';
// Added History to lucide-react imports to resolve conflict with browser's window.History
import { ShieldCheck, Package, MapPin, Clock, CheckCircle2, Trophy, Download, Smartphone, Star, Phone, User as UserIcon, AlertCircle, MessageSquare, CheckCircle, Award, History } from 'lucide-react';
import { CATEGORY_STYLES, STATUS_STYLES, INITIAL_USERS } from '../constants';
import { generateCertificatePDF, CertTier } from '../utils/calculations';

interface HelperDashboardProps {
  language: 'English' | 'Tamil';
  user: User;
  allRequests: CareRequest[];
  onUpdateStatus: (id: string, status: RequestStatus) => void;
  onAcceptRequest: (id: string) => void;
}

const HelperDashboard: React.FC<HelperDashboardProps> = ({ language, user, allRequests, onUpdateStatus, onAcceptRequest }) => {
  const [activeTab, setActiveTab] = useState<'assigned' | 'discover' | 'history'>('assigned');
  
  const myAssigned = allRequests.filter(r => r.helperId === user.id && r.status !== 'completed' && r.status !== 'cancelled');
  const available = allRequests.filter(r => r.status === 'searching');
  const myHistory = allRequests.filter(r => r.helperId === user.id && r.status === 'completed');

  const hasActiveTask = myAssigned.length > 0;
  const totalEarnings = myHistory.reduce((acc, curr) => acc + curr.payment, 0);
  
  // Calculate Tier Logic
  const avgRating = myHistory.length > 0 ? myHistory.reduce((acc, curr) => acc + (curr.rating || 5), 0) / myHistory.length : 0;
  const eligibleForCert = (user.helperType === 'Student' || user.helperType === 'Volunteer') && myHistory.length >= 3;

  let currentTier: CertTier = 'Bronze';
  if (avgRating === 5) currentTier = 'Gold';
  else if (avgRating >= 4) currentTier = 'Silver';

  const handleNextStatus = (req: CareRequest) => {
    const sequence: RequestStatus[] = ['assigned', 'on_the_way', 'in_progress', 'completed'];
    const idx = sequence.indexOf(req.status);
    if (idx !== -1 && idx < sequence.length - 1) onUpdateStatus(req.id, sequence[idx + 1]);
  };

  const getStatusAction = (status: RequestStatus) => {
    switch(status) {
      case 'assigned': return 'On My Way';
      case 'on_the_way': return 'Start Service';
      case 'in_progress': return 'Mark Finished';
      default: return 'Next Step';
    }
  };

  const getElderDetails = (elderId: string) => {
    const users = JSON.parse(localStorage.getItem('cc_users') || '[]');
    return users.find((u: User) => u.id === elderId);
  };

  const handleDownloadCert = () => {
    const totalHours = myHistory.reduce((acc, curr) => acc + curr.hours, 0);
    generateCertificatePDF(user.name, user.orgName || 'CareCircle Volunteer', myHistory.length, avgRating, totalHours, currentTier);
  };

  if (user.verificationStatus === 'pending') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 text-center">
        <div className="w-40 h-40 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-10 border-8 border-white shadow-xl shadow-yellow-100">
          <ShieldCheck size={80} />
        </div>
        <h1 className="text-5xl font-black mb-4 text-gray-900 tracking-tight">Under Review</h1>
        <p className="text-gray-400 text-xl max-w-md mx-auto font-bold leading-relaxed">Our safety team is validating your documents. You'll be notified via email upon approval.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Achievement Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
          <div className="flex items-center gap-3 text-emerald-600 mb-4 font-black uppercase tracking-[0.2em] text-[10px]"><CheckCircle2 size={24} /> Tasks Done</div>
          <div className="text-5xl font-black text-gray-900 tracking-tighter">{myHistory.length}</div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
          <div className="flex items-center gap-3 text-blue-600 mb-4 font-black uppercase tracking-[0.2em] text-[10px]"><Smartphone size={24} /> Total Pay</div>
          <div className="text-5xl font-black text-gray-900 tracking-tighter">₹{totalEarnings}</div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
          <div className="flex items-center gap-3 text-purple-600 mb-4 font-black uppercase tracking-[0.2em] text-[10px]"><Award size={24} /> Skill Level</div>
          <div className={`text-2xl font-black tracking-tight ${myHistory.length >= 3 ? 'text-gray-900' : 'text-gray-300 italic'}`}>
            {myHistory.length >= 3 ? `${currentTier} Tier` : 'In Progress'}
          </div>
        </div>
        <div className={`${eligibleForCert ? 'bg-emerald-600' : 'bg-gray-900'} p-8 rounded-[2.5rem] shadow-2xl text-white flex flex-col justify-between`}>
          <div className="flex items-center gap-3 mb-4 opacity-80 font-black uppercase tracking-widest text-[10px]"><Trophy size={24} /> Internship Seal</div>
          {eligibleForCert ? (
            <button onClick={handleDownloadCert} className="flex items-center gap-2 font-black text-xl hover:scale-105 active:scale-95 transition-all">
              <Download size={28} /> Download {currentTier} Cert
            </button>
          ) : (
            <div className="text-sm font-bold opacity-80 leading-snug">
              Complete {3 - myHistory.length} more tasks with high ratings to unlock your certificate.
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-10 overflow-x-auto no-scrollbar pb-2">
        {[
          { id: 'assigned', label: `Active (${myAssigned.length})`, icon: Package },
          { id: 'discover', label: `Find Work`, icon: MapPin },
          { id: 'history', label: `Record`, icon: History }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={`px-10 py-4 rounded-2xl font-black flex items-center gap-3 transition-all ${
              activeTab === tab.id ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200' : 'bg-white text-gray-400 border border-gray-100'
            }`}
          >
            <tab.icon size={20} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'assigned' && (
        <div className="space-y-8">
          {myAssigned.length === 0 ? (
            <div className="py-40 text-center bg-white rounded-[3rem] border-4 border-dashed border-gray-100">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200"><Package size={48} /></div>
              <p className="text-2xl font-black text-gray-900 mb-2">No active tasks.</p>
              <button onClick={() => setActiveTab('discover')} className="text-emerald-600 font-black text-lg hover:underline">Browse available help requests &rarr;</button>
            </div>
          ) : (
            myAssigned.map(req => {
              const elder = getElderDetails(req.elderId);
              return (
                <div key={req.id} className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-2xl flex flex-col lg:flex-row gap-12 items-stretch animate-in slide-in-from-left-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-8">
                      <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${CATEGORY_STYLES[req.category]}`}>{req.category}</span>
                      <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_STYLES[req.status]}`}>{req.status.replace('_', ' ')}</span>
                    </div>
                    <h3 className="text-4xl font-black text-gray-900 mb-8 leading-tight">{req.description}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-gray-500 mb-12">
                      <div className="flex items-start gap-4"><MapPin className="text-emerald-500 mt-1" size={24} /> <div className="font-bold text-lg leading-tight"><div className="text-[10px] uppercase text-gray-400 mb-1">Pickup</div>{req.pickupAddress}</div></div>
                      <div className="flex items-start gap-4"><CheckCircle2 className="text-emerald-500 mt-1" size={24} /> <div className="font-bold text-lg leading-tight"><div className="text-[10px] uppercase text-gray-400 mb-1">Home Drop</div>{req.dropAddress}</div></div>
                      <div className="flex items-start gap-4"><Clock className="text-emerald-500 mt-1" size={24} /> <div className="font-bold text-lg leading-tight"><div className="text-[10px] uppercase text-gray-400 mb-1">Est. Duration</div>{req.hours} Hours Service</div></div>
                      <div className="flex items-start gap-4"><Award className="text-emerald-500 mt-1" size={24} /> <div className="font-bold text-lg leading-tight"><div className="text-[10px] uppercase text-gray-400 mb-1">Your Earnings</div>₹{req.payment}</div></div>
                    </div>
                    <button onClick={() => handleNextStatus(req)} className="w-full sm:w-auto px-16 py-6 bg-emerald-600 text-white rounded-3xl font-black text-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95">{getStatusAction(req.status)}</button>
                  </div>
                  <div className="w-full lg:w-96 bg-gray-50 rounded-[3rem] p-10 border border-gray-100 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-emerald-600 text-white rounded-3xl flex items-center justify-center text-4xl font-black shadow-2xl mb-6">{elder?.avatar}</div>
                    <div className="font-black text-3xl text-gray-900 mb-2">{elder?.name}</div>
                    <div className="text-emerald-600 font-black text-lg mb-8 flex items-center gap-2 uppercase tracking-widest"><Phone size={18} /> {elder?.phone}</div>
                    <div className="text-sm text-gray-400 font-black bg-white px-6 py-4 rounded-2xl border-2 border-gray-100 mb-8 w-full shadow-inner">{elder?.address}</div>
                    <a href={`tel:${elder?.phone}`} className="w-full py-5 bg-white text-emerald-600 rounded-2xl font-black text-xl border-4 border-emerald-50 shadow-sm hover:bg-emerald-50 transition-colors flex items-center justify-center gap-3"><Phone size={24} /> Call Elder</a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'discover' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {available.map(req => (
            <div key={req.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl hover:shadow-2xl transition-all flex flex-col animate-in zoom-in-95">
              <div className="flex justify-between items-start mb-6">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${CATEGORY_STYLES[req.category]}`}>{req.category}</span>
                <span className="text-3xl font-black text-emerald-600 tracking-tighter">₹{req.payment}</span>
              </div>
              <h4 className="font-black text-2xl text-gray-900 mb-6 leading-tight flex-1 line-clamp-3">{req.description}</h4>
              <div className="space-y-3 mb-8 text-gray-500">
                <div className="flex items-center gap-2 font-black text-sm"><MapPin size={18} className="text-emerald-500" /> {req.pickupAddress}</div>
                <div className="flex items-center gap-2 font-black text-sm"><Clock size={18} className="text-emerald-500" /> {req.hours} Est. Hours</div>
              </div>
              {hasActiveTask ? (
                <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4 text-amber-700">
                  <AlertCircle size={24} className="shrink-0" />
                  <p className="text-xs font-black leading-tight uppercase tracking-wider">Finish current task first.</p>
                </div>
              ) : (
                <button onClick={() => onAcceptRequest(req.id)} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100">Accept Request</button>
              )}
            </div>
          ))}
          {available.length === 0 && (
            <div className="col-span-full py-40 text-center text-gray-400 font-black italic text-2xl">Searching for new requests...</div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-xl">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em]">
              <tr>
                <th className="px-10 py-8">Date</th>
                <th className="px-10 py-8">Service</th>
                <th className="px-10 py-8">Earnings</th>
                <th className="px-10 py-8">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-black text-lg">
              {myHistory.map(req => (
                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-10 py-8 text-gray-400 font-bold">{new Date(req.timestamp).toLocaleDateString()}</td>
                  <td className="px-10 py-8 text-gray-900">{req.category}</td>
                  <td className="px-10 py-8 text-emerald-600 tracking-tighter">₹{req.payment}</td>
                  <td className="px-10 py-8">
                    {req.rating ? (
                      <div className="flex text-yellow-400 gap-1">
                        {[...Array(5)].map((_, i) => <Star key={i} size={20} fill={i < req.rating! ? 'currentColor' : 'none'} />)}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300 uppercase tracking-widest">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HelperDashboard;
