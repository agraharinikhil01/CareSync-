import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Tesseract from 'tesseract.js';
import toast from 'react-hot-toast';
import {
  Upload,
  FileText,
  Sparkles,
  Scan,
  Pill,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Printer,
  Save,
  Tag,
  Stethoscope,
  RefreshCw,
  Info,
  Clock,
  User,
  Check,
  ChevronRight,
} from 'lucide-react';

const ClinicOCR = () => {
  const { user } = useAuth();
  const [imagePreview, setImagePreview] = useState(null);
  const [file, setFile] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [rawOcrText, setRawOcrText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [confidence, setConfidence] = useState(0);

  // For Doctors saving directly to EMR
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [savingToEmr, setSavingToEmr] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user?.role === 'DOCTOR' || user?.role === 'RECEPTIONIST') {
      fetchPatients();
    }
  }, [user?.role]);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      if (res.data.success) {
        setPatients(res.data.data);
      }
    } catch {
      console.log('Could not fetch patients for selector');
    }
  };

  const handleImageUpload = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, JPEG, PNG)');
      return;
    }

    if (uploadedFile.size > 12 * 1024 * 1024) {
      toast.error('Image size must be less than 12MB');
      return;
    }

    setFile(uploadedFile);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      setRawOcrText('');
      setAiResult(null);
      setConfidence(0);
    };
    reader.readAsDataURL(uploadedFile);
  };

  const runOcrAndAi = async () => {
    if (!imagePreview) {
      toast.error('Please upload a prescription image first');
      return;
    }

    try {
      setOcrLoading(true);
      setOcrProgress(5);

      // 1. Run Client-side Tesseract OCR
      const { data } = await Tesseract.recognize(imagePreview, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });

      const extractedText = data.text?.trim() || '';
      setRawOcrText(extractedText);

      // Compute word-level confidence
      const words = data.words || [];
      const totalConf = words.reduce((acc, w) => acc + (w.confidence || 0), 0);
      const avgConf = words.length ? Math.round(totalConf / words.length) : Math.round(data.confidence || 75);
      setConfidence(avgConf);

      setOcrLoading(false);

      // 2. Run Gemini Medical Intelligence via CareSync backend
      setAiLoading(true);
      toast.loading('Analyzing with Gemini Flash AI...', { id: 'ai-ocr' });

      const aiRes = await api.post('/ai/analyze-prescription', {
        rawOcrText: extractedText || 'Handwritten prescription',
        imageBase64: imagePreview.length < 500000 ? imagePreview : undefined,
      });

      if (aiRes.data.success && aiRes.data.data) {
        setAiResult(aiRes.data.data);
        toast.success('Prescription digitized successfully!', { id: 'ai-ocr' });
      } else {
        toast.error('AI extraction could not structure text, raw OCR preserved.', { id: 'ai-ocr' });
      }
    } catch (err) {
      console.error('OCR pipeline error:', err);
      toast.error(err.response?.data?.message || 'Processing failed. Please retry with a clearer photo.', { id: 'ai-ocr' });
    } finally {
      setOcrLoading(false);
      setAiLoading(false);
    }
  };

  const handleCopy = () => {
    if (!aiResult) return;
    const textToCopy = `PRESCRIBED MEDICINES:
${aiResult.medicines?.map((m) => `• ${m.name} | ${m.dosage} | ${m.frequency} | ${m.instructions || ''}`).join('\n')}

CLINICAL SUMMARY:
${aiResult.summary || ''}

PRECAUTIONS:
${aiResult.precautions?.join(', ') || ''}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Copied structured prescription to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToEmr = async () => {
    if (!selectedPatient) {
      toast.error('Please select a patient to link this prescription');
      return;
    }
    if (!aiResult?.medicines?.length) {
      toast.error('No medicines to save');
      return;
    }

    try {
      setSavingToEmr(true);
      const payload = {
        patient: selectedPatient,
        diagnosis: aiResult.tags?.join(', ') || 'Prescription Intake Digitized',
        symptoms: aiResult.summary || 'Digitized via ClinicOCR',
        advice: aiResult.precautions?.join('. ') || 'Follow medicine dosage properly.',
        medicines: aiResult.medicines.map((m) => ({
          name: m.name,
          dosage: m.dosage || 'As directed',
          frequency: m.frequency || 'Daily',
          duration: m.duration || '5 days',
          instructions: m.instructions || 'After meals',
        })),
      };

      const res = await api.post('/prescriptions', payload);
      if (res.data.success) {
        toast.success('Prescription officially saved into CareSync Patient EMR!');
      } else {
        toast.error(res.data.message || 'Failed to save to EMR');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving prescription');
    } finally {
      setSavingToEmr(false);
    }
  };

  const roleHeaders = {
    DOCTOR: {
      title: 'ClinicOCR — Physician Prescription Digitizer',
      subtitle: 'Instantly convert paper prescriptions into clean, verified digital EMR records.',
      badge: 'Physician Mode',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    RECEPTIONIST: {
      title: 'ClinicOCR — Front Desk Prescription Intake',
      subtitle: 'Digitize incoming patient paper prescriptions in seconds during reception registration.',
      badge: 'Front Desk Mode',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    PATIENT: {
      title: 'ClinicOCR — Prescription Decoder & Digital Record',
      subtitle: 'Upload your doctor’s prescription to decode difficult handwriting, view daily dosages, and keep a digital backup.',
      badge: 'Personal Health Archive',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  };

  const currentRoleInfo = roleHeaders[user?.role] || roleHeaders.DOCTOR;

  return (
    <DashboardLayout title="ClinicOCR">
      <div className="space-y-6">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-sky-600/15 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold tracking-wider uppercase backdrop-blur-xs border border-white/20">
                  {currentRoleInfo.badge}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-teal-200 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" /> Powered by Gemini Flash + Tesseract
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {currentRoleInfo.title}
              </h1>
              <p className="text-sky-100 text-sm sm:text-base mt-1.5 max-w-2xl">
                {currentRoleInfo.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
                <p className="text-xl font-black">{confidence ? `${confidence}%` : '--'}</p>
                <p className="text-[10px] text-sky-200 uppercase font-semibold">OCR Confidence</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Upload & Preview (Left) vs Structured AI Records (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Upload Box & OCR Raw View */}
          <div className="lg:col-span-5 space-y-5">
            {/* Upload Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-sky-600" />
                1. Upload Prescription Photo
              </h2>

              {!imagePreview ? (
                <label className="border-2 border-dashed border-slate-200 hover:border-sky-500 bg-slate-50/60 hover:bg-sky-50/40 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-sky-100/70 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
                    <Scan className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 group-hover:text-sky-700">
                    Click to select prescription image
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Supports JPG, JPEG, PNG (Max 12MB)</p>
                  <p className="text-[11px] font-medium text-teal-600 mt-3 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
                    Camera & mobile photos supported
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group max-h-72 flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Prescription Preview"
                      className="max-h-72 w-auto object-contain transition-transform duration-200"
                    />
                    <label className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl cursor-pointer backdrop-blur-xs transition-colors">
                      Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>

                  {/* Scan Trigger Button */}
                  <button
                    onClick={runOcrAndAi}
                    disabled={ocrLoading || aiLoading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {ocrLoading || aiLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{ocrLoading ? `Reading Handwriting (${ocrProgress}%)...` : 'AI Clinical Analysis...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Digitize with ClinicOCR</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Progress bar */}
              {ocrLoading && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>Optical Character Recognition (OCR)</span>
                    <span>{ocrProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-teal-500 rounded-full transition-all duration-300"
                      style={{ width: `${ocrProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Raw OCR Extracted Output */}
            {rawOcrText && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Raw Handwritten OCR
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      confidence >= 80
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : confidence >= 60
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {confidence}% accuracy
                  </span>
                </div>
                <div className="bg-slate-900 text-slate-200 rounded-xl p-3.5 text-xs font-mono max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
                  {rawOcrText}
                </div>
                <p className="text-[11px] text-slate-400">
                  Handwriting quirks and misspellings are automatically normalized by Gemini AI.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: Structured AI Output */}
          <div className="lg:col-span-7 space-y-5">
            {!aiResult && !aiLoading ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[380px]">
                <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mb-4">
                  <Stethoscope className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Ready for Document Digitization</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1">
                  Upload an image of a handwritten prescription on the left, then click{' '}
                  <span className="font-semibold text-sky-700">"Digitize with ClinicOCR"</span> to extract
                  medicines, dosages, and diagnostic advice.
                </p>
                <div className="grid grid-cols-3 gap-3 w-full max-w-md mt-6 pt-6 border-t border-slate-100">
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-700">Zero Guesswork</p>
                    <p className="text-[10px] text-slate-400">Uncertain names flagged</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-700">Dosage Schedules</p>
                    <p className="text-[10px] text-slate-400">Time & meal guidance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-700">EMR Ready</p>
                    <p className="text-[10px] text-slate-400">Save directly to chart</p>
                  </div>
                </div>
              </div>
            ) : aiLoading ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[380px] space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 animate-pulse">
                    <Sparkles className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-800">Medical AI Analysis in Progress</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Gemini Flash is verifying medical terminology, dosage frequencies, and checking for
                  potential drug interaction flags...
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Result Top Action Bar */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Prescription Digitized</h3>
                      <p className="text-[11px] text-slate-400">Verified by CareSync Medical AI</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </button>
                  </div>
                </div>

                {/* Tags and Category Badges */}
                {aiResult.tags?.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> Tags:
                    </span>
                    {aiResult.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Clinical Summary Card */}
                {aiResult.summary && (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-sky-600" />
                      Clinical Summary
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      {aiResult.summary}
                    </p>
                  </div>
                )}

                {/* Structured Medicines Table / Cards */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Pill className="w-4 h-4 text-sky-600" />
                      Extracted Medicines ({aiResult.medicines?.length || 0})
                    </h4>
                    <span className="text-[11px] text-slate-400">Review before prescribing</span>
                  </div>

                  <div className="space-y-3">
                    {aiResult.medicines?.map((med, idx) => {
                      const isUncertain = med.name?.toLowerCase().startsWith('possibly');
                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border transition-all ${
                            isUncertain
                              ? 'bg-amber-50/50 border-amber-200'
                              : 'bg-slate-50/60 border-slate-200/70 hover:border-sky-300'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                                  isUncertain ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'
                                }`}
                              >
                                {idx + 1}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                  {med.name}
                                  {isUncertain && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold">
                                      Verify Handwriting
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {med.instructions || 'As advised by doctor'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700">
                                Dose: {med.dosage || '1 unit'}
                              </span>
                              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-sky-700">
                                {med.frequency || 'Daily'}
                              </span>
                              {med.duration && (
                                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-teal-700 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {med.duration}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Important Findings / Allergy Warnings */}
                {aiResult.importantFindings?.length > 0 && (
                  <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-5 space-y-2">
                    <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Important Clinical Findings & Alerts
                    </h4>
                    <ul className="space-y-1">
                      {aiResult.importantFindings.map((finding, idx) => (
                        <li key={idx} className="text-xs font-semibold text-rose-700 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Doctor / Receptionist EMR Saver */}
                {(user?.role === 'DOCTOR' || user?.role === 'RECEPTIONIST') && (
                  <div className="bg-gradient-to-br from-sky-50 to-teal-50 rounded-2xl border border-sky-100 p-5 space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Save className="w-4 h-4 text-sky-600" />
                        Save Structured Record to CareSync EMR
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Link this scanned prescription directly to a registered patient's medical file.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <select
                        value={selectedPatient}
                        onChange={(e) => setSelectedPatient(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="">-- Select Patient from Directory --</option>
                        {patients.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.user?.name || p.name} (ID: {p.patientId || p._id.slice(-6)})
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={handleSaveToEmr}
                        disabled={savingToEmr || !selectedPatient}
                        className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                      >
                        {savingToEmr ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span>Save to Patient File</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClinicOCR;
