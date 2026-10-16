// 21st.dev-inspired AI Prompt Box (@jahed/ai-prompt-box)
// Rich mood input: expanding textarea with quick actions — voice input,
// photo upload — and a prominent submit. Controlled by MoodForm.
import { useRef } from 'react';
import { BrainCircuit, ImagePlus, Loader2, Sparkles } from 'lucide-react';
import VoiceInput from './VoiceInput';
import FileUpload from './FileUpload';

function PromptBox({
  value,
  onChange,
  onSubmit,
  loading,
  onVoiceTranscript,
  onPhoto,
  photoAttached,
  onClearPhoto,
}) {
  const uploadRef = useRef(null);

  return (
    <div className="prompt21">
      <div className="prompt21-head">
        <span className="prompt21-badge">
          <Sparkles size={13} /> AI mood reader
        </span>
        <span className="prompt21-count">{value.length}/500</span>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 500))}
        placeholder="Tell me about your day… e.g. “Exam week is killing me, I need something warm and cheesy.”"
        rows={4}
        className="prompt21-input"
        aria-label="Describe your day"
      />

      <FileUpload
        ref={uploadRef}
        compact
        onPhoto={onPhoto}
        photo={photoAttached}
        onClear={onClearPhoto}
      />

      <div className="prompt21-actions">
        <div className="prompt21-tools">
          <VoiceInput onTranscript={(t) => onVoiceTranscript(t)} />
          <button
            type="button"
            className="tool-btn"
            title="Attach a selfie"
            onClick={() => uploadRef.current?.openPicker()}
          >
            <ImagePlus size={17} />
            <span>Selfie</span>
          </button>
        </div>
        <button
          type="button"
          className="btn btn-primary prompt21-submit"
          onClick={onSubmit}
          disabled={loading || !value.trim()}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="spinner" /> Reading your mood…
            </>
          ) : (
            <>
              <BrainCircuit size={18} /> Get my recommendation
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default PromptBox;
