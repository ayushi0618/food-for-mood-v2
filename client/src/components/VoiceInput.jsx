// 21st.dev-inspired AI Voice Input (@kokonutd/ai-voice-input)
// + Voice Powered Orb (@isaiahbjork/voice-powered-orb)
// Voice-driven mood input with animated listening states: idle orb,
// pulsing listening orb, and transcript delivery into the prompt box.
// Uses the browser's SpeechRecognition API where available.
import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Square } from 'lucide-react';

function VoiceInput({ onTranscript, compact = false }) {
  const [state, setState] = useState('idle'); // idle | listening | unsupported | denied
  const recogRef = useRef(null);
  const finalRef = useRef('');

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setState('unsupported');
      return;
    }
    const recog = new SR();
    recog.lang = 'en-IN';
    recog.interimResults = true;
    recog.continuous = true;

    recog.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalRef.current += t + ' ';
        else interim += t;
      }
      const text = (finalRef.current + interim).trim();
      if (text) onTranscript?.(text, e);
    };
    recog.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setState('denied');
      }
    };
    recog.onend = () => {
      setState((s) => (s === 'listening' ? 'idle' : s));
      if (finalRef.current.trim()) {
        onTranscript?.(finalRef.current.trim());
        finalRef.current = '';
      }
    };
    recogRef.current = recog;
    return () => {
      try {
        recog.abort();
      } catch {
        /* noop */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    const recog = recogRef.current;
    if (!recog) return;
    if (state === 'listening') {
      try {
        recog.stop();
      } catch {
        /* noop */
      }
      setState('idle');
    } else {
      finalRef.current = '';
      try {
        recog.start();
        setState('listening');
      } catch {
        setState('idle');
      }
    }
  };

  if (state === 'unsupported') return null;

  return (
    <button
      type="button"
      className={`voice-pill ${state} ${compact ? 'compact' : ''}`}
      onClick={toggle}
      title={state === 'listening' ? 'Stop listening' : 'Speak your mood'}
      aria-label={state === 'listening' ? 'Stop voice input' : 'Start voice input'}
    >
      <span className="voice-orb">
        <span className="voice-orb-core" />
        {state === 'listening' && (
          <>
            <span className="voice-ring r1" />
            <span className="voice-ring r2" />
            <span className="voice-ring r3" />
          </>
        )}
      </span>
      <span className="voice-icon">
        {state === 'listening' ? (
          <Square size={16} fill="currentColor" />
        ) : state === 'denied' ? (
          <MicOff size={17} />
        ) : (
          <Mic size={17} />
        )}
      </span>
      <span className="voice-label">
        {state === 'listening'
          ? 'Listening… tap to stop'
          : state === 'denied'
          ? 'Mic blocked'
          : 'Speak it'}
      </span>
      {state === 'listening' && (
        <span className="voice-bars" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <i key={i} style={{ animationDelay: `${i * 0.12}s` }} />
          ))}
        </span>
      )}
    </button>
  );
}

export default VoiceInput;
