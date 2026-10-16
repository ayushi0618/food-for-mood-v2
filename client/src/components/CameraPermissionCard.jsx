// 21st.dev-inspired Camera Permission Request Card
// (@ahmedmayara/camera-permission-request-card)
// Friendly onboarding card explaining camera access before detection
// starts. Dismissable; stored in localStorage.
import { useState } from 'react';
import { Camera, ShieldCheck, X } from 'lucide-react';

const KEY = 'ffm_cam_card_dismissed';

function CameraPermissionCard() {
  const [gone, setGone] = useState(() => {
    try {
      return localStorage.getItem(KEY) === '1';
    } catch {
      return false;
    }
  });
  if (gone) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      /* noop */
    }
    setGone(true);
  };

  return (
    <div className="cam21" role="note" aria-label="About camera access">
      <span className="cam21-icon">
        <Camera size={20} />
      </span>
      <div className="cam21-copy">
        <b>Quick heads-up about your camera</b>
        <p>
          We never ask for live camera access. If you want visual mood
          detection, just attach a selfie below — it's processed right here in
          your browser and never leaves your device.
        </p>
        <span className="cam21-trust">
          <ShieldCheck size={13} /> Private by design — text analysis only
        </span>
      </div>
      <button className="cam21-x" onClick={dismiss} aria-label="Dismiss">
        <X size={15} />
      </button>
    </div>
  );
}

export default CameraPermissionCard;
