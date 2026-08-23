import React, { useRef } from 'react';
import Modal from './Modal';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldAlert,
  ShieldCheck,
  HeartPulse,
  Printer,
  ExternalLink,
  Copy,
  PhoneCall,
  Activity,
  AlertTriangle,
  QrCode,
} from 'lucide-react';

const HealthPassportModal = ({ isOpen, onClose, patient, profile }) => {
  if (!patient) return null;

  const patientId = patient._id || patient.id;
  const host = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? '10.27.112.75'
    : window.location.hostname;
  const port = window.location.port ? `:${window.location.port}` : '';
  const emergencyUrl = `${window.location.protocol}//${host}${port}/emergency/${patientId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(emergencyUrl);
    alert('Emergency QR Link copied to clipboard!');
  };

  const handlePrintCard = () => {
    window.print();
  };

  const bloodGroup = profile?.bloodGroup || 'Unknown';
  const allergies = profile?.allergies || [];
  const emergencyContact = profile?.emergencyContact || { name: 'Hospital Emergency Desk', phone: '+1 (555) 010-9999', relationship: 'Hospital' };
  const cardId = `HMS-PT-${patientId.slice(-6).toUpperCase()}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Emergency QR Health Passport" maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* Instruction Alert */}
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-sky-900">
          <QrCode className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Life-Saving Digital Health ID Card</p>
            <p className="text-slate-600 mt-0.5">
              In any medical emergency or road accident, first responders or ER doctors can scan this QR code with their mobile phone to instantly retrieve blood group, life-threatening allergies, and emergency contacts.
            </p>
          </div>
        </div>

        {/* PRINTABLE WALLET-SIZE DIGITAL SMART HEALTH BADGE */}
        <div className="printable-health-card bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-sky-500/30 relative overflow-hidden">
          {/* Card Ambient Glow / Watermark */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-44 h-44 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Card Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-md shadow-sky-500/40">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight text-white flex items-center gap-1.5">
                  CareSync Health Passport
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    VERIFIED
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">Universal Emergency Medical Identifier</p>
              </div>
            </div>

            {/* Emergency Hotline */}
            <div className="text-right">
              <span className="text-[9px] uppercase tracking-wider text-rose-400 font-bold block">24/7 Trauma SOS</span>
              <span className="text-xs font-black text-white">+1 (555) 010-9999</span>
            </div>
          </div>

          {/* Card Main Body */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-5 relative z-10 items-center">
            {/* Left Col: Patient Bio */}
            <div className="sm:col-span-2 space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Patient Name</span>
                  <h2 className="text-lg font-black text-white tracking-tight">{patient.name}</h2>
                  <p className="text-xs text-sky-400 font-mono font-semibold">{cardId}</p>
                </div>

                {/* Blood Group Highlight Chip */}
                <div className="bg-gradient-to-b from-rose-600 to-rose-700 px-4 py-2 rounded-2xl text-center shadow-lg shadow-rose-600/30 border border-rose-400/40">
                  <span className="text-[9px] uppercase font-black text-rose-200 block tracking-widest">Blood Type</span>
                  <span className="text-xl font-black text-white tracking-wider">{bloodGroup}</span>
                </div>
              </div>

              {/* Age, Gender & Email */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-white/5 p-2.5 rounded-xl border border-white/5">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Age / Gender:</span>
                  <span className="font-bold text-slate-200">{profile?.age ? `${profile.age} Yrs` : 'N/A'} • {profile?.gender || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Emergency Contact:</span>
                  <span className="font-bold text-slate-200 truncate block">
                    {emergencyContact.name} ({emergencyContact.relationship || 'Kin'})
                  </span>
                  <span className="text-[11px] text-sky-400 font-mono font-bold block">{emergencyContact.phone}</span>
                </div>
              </div>

              {/* Critical Documented Allergies */}
              <div>
                <span className="text-[10px] uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1 mb-1">
                  <AlertTriangle className="w-3 h-3 text-rose-400" /> Critical Allergies:
                </span>
                {allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {allergies.map((allergy, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-500/40"
                      >
                        ⚠️ {allergy}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-emerald-400 font-medium">No Known Drug Allergies (NKDA)</span>
                )}
              </div>
            </div>

            {/* Right Col: High-Res QR Code */}
            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-xl text-center border-4 border-sky-400/30">
              <QRCodeSVG
                value={emergencyUrl}
                size={120}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230284c7'%3E%3Cpath d='M12 2L2 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm-1 6h2v3h3v2h-3v3h-2v-3H8v-2h3V8z'/%3E%3C/svg%3E",
                  x: undefined,
                  y: undefined,
                  height: 24,
                  width: 24,
                  excavate: true,
                }}
              />
              <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest mt-1.5">
                SCAN FOR SOS DATA
              </span>
            </div>
          </div>

          {/* Card Footer Bar */}
          <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
            <span>HIPAA-Compliant Emergency Public Card</span>
            <span className="font-mono text-sky-400">ID: {cardId}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              <Copy className="w-3.5 h-3.5" /> Copy SOS Link
            </button>
            <a
              href={`/emergency/${patientId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Preview Public Scan Page
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
            >
              Close
            </button>
            <button
              onClick={handlePrintCard}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md"
            >
              <Printer className="w-4 h-4" /> Print / Save ID Card
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default HealthPassportModal;
