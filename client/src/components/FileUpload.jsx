// 21st.dev-inspired File Upload (@manuarora700/file-upload)
// Polished drag-and-drop photo upload for the detection flow.
// Shows a preview once attached; parent decides what happens on submit.
// Exposes openPicker() via ref for the PromptBox "Selfie" tool button.
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';

const FileUpload = forwardRef(function FileUpload(
  { onPhoto, photo, onClear, compact = false },
  ref
) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);

  useImperativeHandle(ref, () => ({
    openPicker: () => inputRef.current?.click(),
  }));

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    onPhoto?.({ url, name: file.name });
  };

  return (
    <div className={`fu21 ${compact ? 'compact' : ''}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="fu21-hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
        aria-label="Upload a selfie"
      />

      {!photo ? (
        <button
          type="button"
          className={`fu21-drop ${drag ? 'drag' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => inputRef.current?.click()}
        >
          <span className="fu21-icon">
            <ImagePlus size={18} />
          </span>
          <span>
            {drag ? 'Drop it — the AI is ready' : 'Drag a selfie here, or click to browse'}
          </span>
        </button>
      ) : (
        <div className="fu21-preview">
          <img src={photo.url} alt="Your selfie" />
          <div className="fu21-prev-meta">
            <b>Selfie attached</b>
            <span>{photo.name}</span>
          </div>
          <button
            type="button"
            className="fu21-clear"
            onClick={onClear}
            aria-label="Remove photo"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
});

export default FileUpload;
