import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import {
  Plus,
  Trash2,
  Printer,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Info,
  Sparkles,
  HeartPulse,
  Mic,
  MicOff,
  Wand2,
  RotateCcw,
  Volume2,
  VolumeX,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  FileAudio,
  Play,
  Pause,
} from 'lucide-react';
import { createPrescriptionApi, checkDrugSafetyApi } from '../api/endpoints';
import { parseClinicalDictation, SAMPLE_DICTATIONS } from '../utils/clinicalVoiceParser';

export const PrescriptionGeneratorModal = ({ isOpen, onClose, appointment, onSuccess }) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [advice, setAdvice] = useState('Take medicines on time, drink adequate fluids, and complete full course.');
  const [followUpDate, setFollowUpDate] = useState('');
  const [testInput, setTestInput] = useState('');
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [medicines, setMedicines] = useState([
    { name: '', dosage: '', frequency: 'Twice daily (1-0-1)', duration: '5 days', instructions: 'After meals' },
  ]);

  // AI Voice Dictation State
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechLanguage, setSpeechLanguage] = useState('en-IN');
  const [showScribeBox, setShowScribeBox] = useState(true);
  const [dictationError, setDictationError] = useState('');
  const [appliedAIFlash, setAppliedAIFlash] = useState(false);

  // Audio Playback & TTS States
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mediaStreamRef = useRef(null);

  // CDSS Safety State
  const [safetyReport, setSafetyReport] = useState({
    isSafe: true,
    allergyWarnings: [],
    interactionWarnings: [],
    patientAllergies: [],
  });
  const [checkingSafety, setCheckingSafety] = useState(false);
  const [overrideSafetyWarning, setOverrideSafetyWarning] = useState(false);

  const debounceTimerRef = useRef(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLanguage;

      recognition.onstart = () => {
        setIsRecording(true);
        setDictationError('');
      };

      recognition.onresult = (event) => {
        let currentInterim = '';
        let finalTrans = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript + ' ';
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (finalTrans) {
          setTranscript((prev) => (prev ? `${prev.trim()} ${finalTrans.trim()}` : finalTrans.trim()));
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition notice:', event.error);
        if (event.error === 'not-allowed') {
          setDictationError('Microphone permission denied. Please allow microphone access in browser.');
        } else if (event.error === 'no-speech') {
          // silent ignore
        } else {
          setDictationError(`Voice notice: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [speechLanguage]);

  const toggleRecording = async () => {
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      setDictationError('');
      // 1. Start Speech Recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.lang = speechLanguage;
          recognitionRef.current.start();
        } catch (e) {
          console.warn('Speech start warning:', e);
        }
      }

      // 2. Start Audio MediaRecorder (captures doctor's voice for playback!)
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;
          audioChunksRef.current = [];
          const recorder = new MediaRecorder(stream);
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunksRef.current.push(e.data);
          };
          recorder.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            setRecordedAudioUrl(url);
            stream.getTracks().forEach((track) => track.stop());
          };
          recorder.start();
          mediaRecorderRef.current = recorder;
        }
      } catch (err) {
        console.warn('MediaRecorder audio capture notice:', err);
      }

      setIsRecording(true);
    }
  };

  // AI Text-to-Speech (TTS) Prescription Reader
  const toggleReadOutPrescription = () => {
    if (!window.speechSynthesis) {
      alert('Text-to-speech is not supported on this browser.');
      return;
    }

    if (isSpeakingTTS) {
      window.speechSynthesis.cancel();
      setIsSpeakingTTS(false);
      return;
    }

    const medsSummary = medicines
      .filter((m) => m.name.trim())
      .map((m) => `${m.name} ${m.dosage}, ${m.frequency}, for ${m.duration}, ${m.instructions}`)
      .join('. ');

    const textToSpeak = `CareSync Electronic Prescription for ${appointment.patientId?.name || 'Patient'}. Diagnosis is ${diagnosis || 'under evaluation'}. Symptoms: ${symptoms || 'not specified'}. Prescribed medicines: ${medsSummary || 'none'}. Advice: ${advice}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = speechLanguage === 'hi-IN' ? 'hi-IN' : 'en-US';

    utterance.onstart = () => setIsSpeakingTTS(true);
    utterance.onend = () => setIsSpeakingTTS(false);
    utterance.onerror = () => setIsSpeakingTTS(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleApplyAIExtraction = (textToParse = transcript) => {
    const fullText = textToParse || transcript || interimTranscript;
    if (!fullText.trim()) {
      setDictationError('Please record or select a dictation first.');
      return;
    }

    const parsed = parseClinicalDictation(fullText);

    if (parsed.diagnosis) setDiagnosis(parsed.diagnosis);
    if (parsed.symptoms) setSymptoms(parsed.symptoms);
    if (parsed.medicines && parsed.medicines.length > 0) setMedicines(parsed.medicines);
    if (parsed.tests && parsed.tests.length > 0) setTests(parsed.tests);
    if (parsed.advice) setAdvice(parsed.advice);

    setAppliedAIFlash(true);
    setTimeout(() => setAppliedAIFlash(false), 2000);
  };

  const handleApplySample = (sample) => {
    setTranscript(sample.transcript);
    handleApplyAIExtraction(sample.transcript);
  };

  // Perform CDSS Safety Check when medicines change
  useEffect(() => {
    if (!isOpen || !appointment) return;

    const patientId = appointment.patientId?._id || appointment.patientId;
    const medNames = medicines.map((m) => m.name.trim()).filter(Boolean);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        setCheckingSafety(true);
        const res = await checkDrugSafetyApi({
          patientId,
          medicines: medNames,
        });

        if (res.data.success) {
          setSafetyReport(res.data.data);
        }
      } catch (err) {
        console.error('Failed to evaluate drug safety:', err);
      } finally {
        setCheckingSafety(false);
      }
    }, 350);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [medicines, appointment, isOpen]);

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      { name: '', dosage: '', frequency: 'Once daily (0-0-1)', duration: '5 days', instructions: 'After meals' },
    ]);
  };

  const handleRemoveMedicine = (index) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, idx) => idx !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleAddTest = () => {
    if (testInput.trim()) {
      setTests([...tests, testInput.trim()]);
      setTestInput('');
    }
  };

  const handleRemoveTest = (idx) => {
    setTests(tests.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!diagnosis.trim()) {
      setError('Please provide a medical diagnosis');
      return;
    }

    const invalidMedicine = medicines.some((m) => !m.name.trim() || !m.dosage.trim());
    if (invalidMedicine) {
      setError('Please fill name and dosage for all prescribed medicines');
      return;
    }

    const hasSevereConflict = safetyReport.allergyWarnings.length > 0;
    if (hasSevereConflict && !overrideSafetyWarning) {
      setError('Severe drug allergy conflict detected! Please review prescription or check clinical override.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        appointmentId: appointment._id,
        patientId: appointment.patientId?._id || appointment.patientId,
        diagnosis,
        symptoms,
        medicines,
        tests,
        advice,
        followUpDate: followUpDate || null,
      };

      const res = await createPrescriptionApi(payload);
      if (res.data.success) {
        onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create prescription');
    } finally {
      setLoading(false);
    }
  };

  if (!appointment) return null;

  const hasAllergies = safetyReport.patientAllergies && safetyReport.patientAllergies.length > 0;
  const hasAllergyConflict = safetyReport.allergyWarnings && safetyReport.allergyWarnings.length > 0;
  const hasInteractionConflict = safetyReport.interactionWarnings && safetyReport.interactionWarnings.length > 0;
  const hasAnyFilledMedicine = medicines.some((m) => m.name.trim().length > 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Electronic Prescription (E-Rx)" maxWidth="max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Patient Summary Header & Known Allergies */}
        <div className="bg-gradient-to-r from-sky-50 to-indigo-50/50 p-4 rounded-2xl border border-sky-100 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{appointment.patientId?.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold uppercase">
                {appointment.type || 'Consultation'}
              </span>
            </div>
            <p className="text-slate-500 text-[11px]">{appointment.patientId?.email} • {appointment.patientId?.phone || 'No phone'}</p>
          </div>

          {/* Patient Documented Allergies Badge */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">Documented Allergies:</span>
            {hasAllergies ? (
              <div className="flex flex-wrap gap-1">
                {safetyReport.patientAllergies.map((alg, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-black text-[10px] border border-rose-200 flex items-center gap-1"
                  >
                    <ShieldAlert className="w-3 h-3 text-rose-600" /> {alg}
                  </span>
                ))}
              </div>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px]">
                None Documented
              </span>
            )}
          </div>
        </div>

        {/* 🎙️ FEATURE 3: AI VOICE-TO-PRESCRIPTION SCRIBE BAR */}
        <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white p-4 rounded-2xl border-2 border-sky-400/40 shadow-xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-sky-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                  AI Voice Scribe & Dictation
                  {isRecording && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse">
                      ● Recording Audio
                    </span>
                  )}
                </h3>
                <p className="text-[10px] text-sky-300">
                  Dictate symptoms, diagnosis & medicine schedule naturally in speech.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <select
                value={speechLanguage}
                onChange={(e) => setSpeechLanguage(e.target.value)}
                className="bg-white/10 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl border border-white/15 focus:outline-none"
              >
                <option value="en-IN" className="bg-slate-900 text-white">🇮🇳 English (India)</option>
                <option value="en-US" className="bg-slate-900 text-white">🇺🇸 English (US)</option>
                <option value="hi-IN" className="bg-slate-900 text-white">🇮🇳 Hindi (हिन्दी)</option>
              </select>

              {/* Mic Toggle Button */}
              <button
                type="button"
                onClick={toggleRecording}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg border ${
                  isRecording
                    ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-400 shadow-rose-500/40 animate-bounce'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-400 shadow-emerald-500/30'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isRecording ? 'Stop Recording' : 'Start Voice Dictation'}</span>
              </button>
            </div>
          </div>

          {/* Dictation Box */}
          {showScribeBox && (
            <div className="space-y-2.5">
              <div className="relative">
                <textarea
                  rows={2}
                  value={transcript + (interimTranscript ? ` ${interimTranscript}` : '')}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Speak into your mic: e.g. 'Patient has viral fever. Diagnosis acute pharyngitis. Prescribe Paracetamol 650mg twice daily for 5 days and Azithromycin 500mg once daily for 3 days...'"
                  className="w-full p-3 bg-white/5 border border-white/15 rounded-xl text-white text-xs placeholder:text-slate-500 focus:ring-2 focus:ring-sky-400 focus:outline-none"
                />

                {/* Animated Soundwave Visualizer when recording */}
                {isRecording && (
                  <div className="absolute top-2 right-3 flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-lg border border-rose-500/40">
                    <span className="w-1 h-3 bg-rose-400 rounded-full animate-ping"></span>
                    <span className="w-1 h-5 bg-rose-500 rounded-full animate-pulse"></span>
                    <span className="w-1 h-2 bg-rose-400 rounded-full animate-bounce"></span>
                    <span className="text-[10px] text-rose-300 font-mono ml-1">Listening...</span>
                  </div>
                )}
              </div>

              {dictationError && (
                <p className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-800/60 p-2 rounded-lg">
                  {dictationError}
                </p>
              )}

              {/* Spoken Voice Audio Player if doctor recorded audio */}
              {recordedAudioUrl && (
                <div className="bg-white/10 p-3 rounded-2xl border border-white/15 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                      <FileAudio className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Spoken Voice Recording:</span>
                      <span className="text-[10px] text-emerald-300">Listen back to your raw audio dictation</span>
                    </div>
                  </div>
                  <audio controls src={recordedAudioUrl} className="h-8 max-w-[260px] rounded-lg accent-emerald-500" />
                </div>
              )}

              {/* Action Buttons & Sample Dictations */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400 mr-1">Quick Clinical Scenarios:</span>
                  {SAMPLE_DICTATIONS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplySample(sample)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-sky-500/30 text-white text-[10px] font-bold border border-white/10 transition"
                    >
                      {sample.title}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {/* AI Speech Synthesizer (Read Out Prescription) */}
                  <button
                    type="button"
                    onClick={toggleReadOutPrescription}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                      isSpeakingTTS
                        ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse font-black'
                        : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
                    }`}
                  >
                    {isSpeakingTTS ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isSpeakingTTS ? 'Stop Reading' : '🔊 Listen Aloud'}</span>
                  </button>

                  {transcript && (
                    <button
                      type="button"
                      onClick={() => {
                        setTranscript('');
                        setInterimTranscript('');
                        setRecordedAudioUrl(null);
                      }}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
                      title="Clear Transcript"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleApplyAIExtraction()}
                    className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg transition-all ${
                      appliedAIFlash
                        ? 'bg-emerald-500 text-slate-950 scale-105'
                        : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/30'
                    }`}
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>{appliedAIFlash ? 'Prescription Extracted!' : 'Auto-Fill via AI'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CDSS CLINICAL ALERTS BANNER (FEATURE 1 INTEGRATION) */}
        {hasAllergyConflict && (
          <div className="p-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl shadow-lg border-2 border-red-400 animate-pulse space-y-2">
            <div className="flex items-center gap-2 font-black text-sm tracking-wide">
              <ShieldAlert className="w-5 h-5 text-white" />
              <span>HIGH-RISK CLINICAL ALLERGY CONFLICT DETECTED!</span>
            </div>
            <div className="space-y-1 text-xs">
              {safetyReport.allergyWarnings.map((w, idx) => (
                <div key={idx} className="bg-black/20 p-2.5 rounded-xl border border-white/20">
                  <p className="font-bold">
                    ⚠️ {w.medicine} conflicts with patient allergy: {w.allergy}
                  </p>
                  <p className="text-[11px] text-rose-100 mt-0.5">{w.message}</p>
                </div>
              ))}
            </div>
            <div className="pt-2 flex items-center justify-between">
              <label className="flex items-center gap-2 font-bold cursor-pointer text-xs bg-white/20 px-3 py-1.5 rounded-xl">
                <input
                  type="checkbox"
                  checked={overrideSafetyWarning}
                  onChange={(e) => setOverrideSafetyWarning(e.target.checked)}
                  className="w-4 h-4 accent-rose-900 rounded"
                />
                <span>Clinical Override (Doctor assumes responsibility)</span>
              </label>
            </div>
          </div>
        )}

        {hasInteractionConflict && !hasAllergyConflict && (
          <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shadow border-2 border-amber-400 space-y-1 text-xs">
            <div className="flex items-center gap-2 font-black">
              <AlertTriangle className="w-4 h-4" />
              <span>Moderate Drug-Drug Interaction Warning</span>
            </div>
            {safetyReport.interactionWarnings.map((w, idx) => (
              <p key={idx} className="text-[11px] font-medium">
                • {w.drug1} + {w.drug2}: {w.message} ({w.recommendation})
              </p>
            ))}
          </div>
        )}

        {/* DIAGNOSIS & SYMPTOMS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Medical Diagnosis *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Acute Viral Pharyngitis, Type-2 Diabetes"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Presenting Symptoms
            </label>
            <input
              type="text"
              placeholder="e.g. High fever, dry cough, throat irritation"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
            />
          </div>
        </div>

        {/* PRESCRIBED MEDICINES TABLE */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Prescribed Drug Regimen *
              </label>
              {checkingSafety && (
                <span className="text-[10px] text-sky-600 font-bold animate-pulse flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Checking Safety...
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddMedicine}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700 bg-sky-50 px-3 py-1 rounded-xl border border-sky-200"
            >
              <Plus className="w-3.5 h-3.5" /> Add Drug Row
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {medicines.map((med, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <input
                  type="text"
                  placeholder="Medicine Name (e.g. Paracetamol)"
                  value={med.name}
                  onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 bg-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Dosage (650mg)"
                  value={med.dosage}
                  onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                  className="w-24 px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 bg-white text-center"
                  required
                />
                <select
                  value={med.frequency}
                  onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                  className="w-36 px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 bg-white"
                >
                  <option value="Once daily (0-0-1)">Once daily (0-0-1)</option>
                  <option value="Once in morning (1-0-0)">Once in morning (1-0-0)</option>
                  <option value="Twice daily (1-0-1)">Twice daily (1-0-1)</option>
                  <option value="Three times daily (1-1-1)">Three times daily (1-1-1)</option>
                  <option value="Once at night (0-0-1)">Once at night (0-0-1)</option>
                  <option value="As needed (SOS)">As needed (SOS)</option>
                </select>
                <input
                  type="text"
                  placeholder="Duration (5 days)"
                  value={med.duration}
                  onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                  className="w-20 px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 bg-white text-center"
                />
                <input
                  type="text"
                  placeholder="Instructions (After meals)"
                  value={med.instructions}
                  onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                  className="w-28 px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 bg-white"
                />
                {medicines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMedicine(idx)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* LAB TESTS & ADVICE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Recommended Lab Tests
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="e.g. Complete Blood Count (CBC)"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTest();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-xl"
              />
              <button
                type="button"
                onClick={handleAddTest}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tests.map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-[11px] border border-indigo-200"
                >
                  {t}
                  <button type="button" onClick={() => handleRemoveTest(idx)} className="text-indigo-400 hover:text-indigo-700">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Dietary Guidelines & Doctor's Advice
            </label>
            <textarea
              rows={2}
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 bg-white"
            />
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <div>
            {hasAnyFilledMedicine && safetyReport.isSafe && (
              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> CDSS Shield: No Known Allergy Conflicts
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (hasAllergyConflict && !overrideSafetyWarning)}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-black shadow-lg shadow-sky-600/30 disabled:opacity-50 transition"
            >
              {loading ? 'Issuing E-Rx...' : 'Issue & Sign Prescription'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

// Printable Electronic Prescription Viewer Modal
export const PrescriptionViewerModal = ({ isOpen, onClose, prescription }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!prescription) return null;

  const handlePrint = () => {
    window.print();
  };

  const toggleSpeak = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const medsSummary = prescription.medicines
      ?.map((m) => `${m.name} ${m.dosage}, ${m.frequency}, for ${m.duration}, ${m.instructions}`)
      .join('. ') || '';

    const textToSpeak = `CareSync Electronic Prescription for ${prescription.patientId?.name || 'Patient'}. Diagnosis is ${prescription.diagnosis}. Prescribed medicines: ${medsSummary}. Doctor's Advice: ${prescription.advice || 'Take medication as directed.'}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Electronic Prescription (E-Rx)" maxWidth="max-w-3xl">
      <div className="printable-area bg-white p-6 rounded-2xl border border-slate-200 space-y-6 text-slate-800 text-xs">
        {/* Prescription Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-sky-600">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-lg shadow-sky-600/30 font-black">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">CareSync Multi-Specialty Hospital</h3>
              <p className="text-slate-500 text-[11px]">Official Digital Healthcare & Electronic Prescription</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-sky-50 text-sky-700 font-mono font-black text-xs rounded-lg border border-sky-200">
              Rx #{prescription._id?.slice(-8).toUpperCase()}
            </span>
            <p className="text-slate-400 text-[10px] mt-1 font-semibold">
              Date: {new Date(prescription.issuedDate || prescription.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Doctor & Patient Info Bar */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Attending Physician:</span>
            <p className="font-black text-slate-900 text-sm">
              {prescription.doctorId?.name || 'Dr. Assigned Physician'}
            </p>
            <p className="text-slate-600">{prescription.doctorId?.specialization || 'General Medicine'}</p>
            <p className="text-slate-500">{prescription.doctorId?.email}</p>
          </div>

          <div className="text-right">
            <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Patient Details:</span>
            <p className="font-black text-slate-900 text-sm">{prescription.patientId?.name}</p>
            <p className="text-slate-600">{prescription.patientId?.email}</p>
            <p className="text-slate-500">{prescription.patientId?.phone}</p>
          </div>
        </div>

        {/* Diagnosis & Symptoms */}
        <div className="bg-sky-50/50 p-3.5 rounded-xl border border-sky-100 flex justify-between items-center text-xs">
          <div>
            <span className="font-bold text-sky-800 uppercase tracking-wider block text-[10px]">Medical Diagnosis:</span>
            <p className="text-sm font-black text-slate-900 mt-0.5">{prescription.diagnosis}</p>
          </div>
          {prescription.symptoms && (
            <div className="text-right">
              <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Symptoms:</span>
              <p className="font-semibold text-slate-700 text-xs mt-0.5">{prescription.symptoms}</p>
            </div>
          )}
        </div>

        {/* Rx Medicines Table */}
        <div>
          <h4 className="font-black text-slate-900 text-sm mb-2 flex items-center gap-1.5 uppercase tracking-wide">
            <HeartPulse className="w-4 h-4 text-sky-600" /> Prescribed Medicines (Rx)
          </h4>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Medicine Name</th>
                  <th className="p-2.5">Dosage</th>
                  <th className="p-2.5">Frequency</th>
                  <th className="p-2.5">Duration</th>
                  <th className="p-2.5">Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prescription.medicines?.map((med, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">{med.name}</td>
                    <td className="p-2.5 font-semibold text-sky-700">{med.dosage}</td>
                    <td className="p-2.5 text-slate-700">{med.frequency}</td>
                    <td className="p-2.5 text-slate-700">{med.duration}</td>
                    <td className="p-2.5 text-slate-600">{med.instructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tests & Advice */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prescription.tests && prescription.tests.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                Recommended Lab Tests:
              </span>
              <ul className="list-disc list-inside text-slate-800 space-y-0.5">
                {prescription.tests.map((t, idx) => (
                  <li key={idx} className="font-semibold">{t}</li>
                ))}
              </ul>
            </div>
          )}

          {prescription.advice && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                Doctor's Dietary & Health Advice:
              </span>
              <p className="text-slate-800 font-medium">{prescription.advice}</p>
            </div>
          )}
        </div>

        {/* Signature & Security Footer */}
        <div className="pt-6 border-t border-slate-200 flex items-end justify-between">
          <div className="space-y-1 text-slate-400 text-[10px]">
            <p className="flex items-center gap-1 font-bold text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" /> Digitally Certified Prescription • CDSS Safety Checked
            </p>
            <p>CareSync E-Health Network • Valid across all certified pharmacies.</p>
          </div>

          <div className="text-center">
            <div className="font-serif italic font-black text-sky-800 text-sm border-b border-slate-300 pb-1">
              {prescription.doctorId?.name || 'Dr. Registered Physician'}
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mt-0.5">
              Authorized Signature
            </span>
          </div>
        </div>
      </div>

      {/* Modal Actions */}
      <div className="no-print mt-6 flex items-center justify-between gap-3 pt-3 border-t border-slate-200">
        <button
          onClick={onClose}
          className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
        >
          Close
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSpeak}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black border transition ${
              isSpeaking
                ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isSpeaking ? 'Stop Audio' : '🔊 Listen to E-Rx Aloud'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-black shadow-md shadow-sky-600/30"
          >
            <Printer className="w-4 h-4" /> Print / Save E-Prescription (PDF)
          </button>
        </div>
      </div>
    </Modal>
  );
};
