import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  Bed,
  HeartPulse,
  Siren,
  Navigation,
  Phone,
  Clock,
  ArrowRight,
  Activity,
} from 'lucide-react';

const HospitalCard = ({ hospital, isSelected, onSelect }) => {
  const generalAvail = hospital.capacitySummary?.general?.available || 0;
  const generalTotal = hospital.capacitySummary?.general?.total || 1;
  const icuAvail = hospital.capacitySummary?.icu?.available || 0;
  const emergency = hospital.emergencyAvailable;

  const generalPct = Math.round((generalAvail / generalTotal) * 100);

  // Status color logic
  let statusBadge = {
    bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    dot: 'bg-emerald-500',
    label: 'Good Availability',
  };

  if (!emergency && generalAvail === 0 && icuAvail === 0) {
    statusBadge = {
      bg: 'bg-rose-50 border-rose-200 text-rose-700',
      dot: 'bg-rose-600',
      label: 'Beds Full',
    };
  } else if (generalAvail <= 5 && icuAvail <= 1) {
    statusBadge = {
      bg: 'bg-amber-50 border-amber-200 text-amber-700',
      dot: 'bg-amber-500',
      label: 'Limited Capacity',
    };
  }

  const [lng, lat] = hospital.location?.coordinates || [77.209, 28.6139];

  return (
    <div
      onClick={() => onSelect && onSelect(hospital)}
      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-sky-50/40 border-sky-500 shadow-md ring-2 ring-sky-500/20'
          : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* Header: Name, Distance & Verified Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-sm font-bold text-slate-900 truncate hover:text-sky-600 transition-colors">
              {hospital.name}
            </h3>
            {hospital.verificationStatus === 'VERIFIED' && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 shrink-0">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {hospital.address}, {hospital.city}
          </p>
        </div>

        {/* Distance Badge */}
        {hospital.distanceKm !== null && hospital.distanceKm !== undefined && (
          <div className="text-right shrink-0">
            <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-lg">
              {hospital.distanceKm} km
            </span>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              ~{hospital.estTravelMinutes || 10} min
            </p>
          </div>
        )}
      </div>

      {/* Live Capacity Indicators */}
      <div className="grid grid-cols-3 gap-2 mt-3.5">
        {/* General Beds */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold">
            <span className="flex items-center gap-1">
              <Bed className="w-3 h-3 text-sky-600" /> General
            </span>
            <span>{generalPct}%</span>
          </div>
          <p className="text-sm font-extrabold text-slate-800 mt-1">
            {generalAvail} <span className="text-[10px] font-medium text-slate-400">/ {generalTotal}</span>
          </p>
        </div>

        {/* ICU Beds */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold">
            <span className="flex items-center gap-1">
              <HeartPulse className="w-3 h-3 text-rose-600" /> ICU
            </span>
          </div>
          <p className="text-sm font-extrabold text-slate-800 mt-1">
            {icuAvail} <span className="text-[10px] font-medium text-slate-400">Avail</span>
          </p>
        </div>

        {/* Emergency Status */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold">
            <span className="flex items-center gap-1">
              <Siren className="w-3 h-3 text-amber-600" /> Emergency
            </span>
          </div>
          <p
            className={`text-xs font-extrabold mt-1 truncate ${
              emergency ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {emergency ? 'Available' : 'Full / Closed'}
          </p>
        </div>
      </div>

      {/* Transparent Match Reasons */}
      {hospital.matchReasons && hospital.matchReasons.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mt-3">
          {hospital.matchReasons.slice(0, 3).map((reason, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium bg-slate-100/90 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200/60"
            >
              • {reason}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Freshness & Actions */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
          <span className={`w-2 h-2 rounded-full ${statusBadge.dot} animate-pulse`}></span>
          <span>Updated {hospital.freshness?.label || 'just now'}</span>
        </div>

        <div className="flex items-center gap-2">
          {hospital.phone && (
            <a
              href={`tel:${hospital.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors"
              title="Call Hospital"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          )}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors"
            title="Directions"
          >
            <Navigation className="w-3.5 h-3.5" />
          </a>
          <Link
            to={`/hospitals/${hospital._id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg transition-colors"
          >
            View <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HospitalCard;
