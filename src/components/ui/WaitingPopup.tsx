
import React, { useEffect, useState, useRef } from "react";

interface WaitingPopupProps {
 
  isOpen: boolean;


  bookingId?: string;


  bookingStatus?: string;

  timerSeconds?: number;

 
  timer?: number;


  onClose: () => void;


  onTimerComplete?: () => void;


  onAccepted?: () => void;

  
  onRejected?: () => void;


  onTimeout?: () => void;
}


const WaitingPopup: React.FC<WaitingPopupProps> = ({
  isOpen,
  bookingId,
  bookingStatus = "Waiting for response...",
  timer,
  timerSeconds,
  onClose,
  onTimerComplete,
  onAccepted,
  onRejected,
  onTimeout,
}) => {
  // Default to 120 seconds
  const resolvedInitial = timerSeconds ?? timer ?? 120;

  const [remainingTime, setRemainingTime] = useState<number>(resolvedInitial);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCalledTimeoutRef = useRef<boolean>(false);

  // Reset state when popup opens
  useEffect(() => {
    if (isOpen) {
      console.log("🟢 WaitingPopup OPENED - Timer set to:", resolvedInitial, "seconds");
      setRemainingTime(resolvedInitial);
      hasCalledTimeoutRef.current = false;
    } else {
      console.log("🔴 WaitingPopup CLOSED");
      // Clear interval when closed
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isOpen, resolvedInitial]);

  // Countdown logic
  useEffect(() => {
    if (!isOpen) return;

    console.log("⏱ Starting countdown from", remainingTime);

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        const newTime = prev - 1;

        // Log every 10 seconds
        if (newTime % 10 === 0 && newTime > 0) {
          console.log("⏱ Timer:", newTime, "seconds remaining");
        }

        // When timer reaches 0
        if (newTime <= 0) {
          console.log("⏰ TIMER REACHED 0 - Closing popup and calling callbacks");

          // Clear interval
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          // Only call timeout callbacks once
          if (!hasCalledTimeoutRef.current) {
            hasCalledTimeoutRef.current = true;

            // Call timeout callbacks
            setTimeout(() => {
              onTimeout?.();
              onTimerComplete?.();
              onClose(); // ✅ CLOSE THE POPUP
            }, 100);
          }

          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => {
      console.log("🧹 Cleaning up timer interval");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isOpen, onTimeout, onTimerComplete, onClose]);

  // Sound effect for waiting state
  useEffect(() => {
    if (!isOpen) return;

    let audioContext: AudioContext | null = null;
    let timerId: NodeJS.Timeout | null = null;

    const playSound = () => {
      try {
        if (!audioContext) {
          audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        // Create oscillator
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Sound parameters (gentle ping)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioContext.currentTime); // A5

        // Envelope
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1.0);

        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + 1.0);

      } catch (e) {
        console.error("Audio play failed", e);
      }
    };

    // Play immediately
    playSound();

    // Repeat every 3 seconds
    timerId = setInterval(playSound, 3000);

    return () => {
      if (timerId) clearInterval(timerId);
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  console.log("🎨 WaitingPopup RENDERING - Time remaining:", remainingTime);

  // Circular progress variables
  const radius = 45;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const total = resolvedInitial > 0 ? resolvedInitial : 120;
  const progress = Math.max(0, Math.min(1, remainingTime / total));
  const offset = circumference * (1 - progress);

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center">
      {/* Backdrop - NO onClick to prevent closing */}
      <div
        className="absolute inset-0 bg-black/40"
        style={{ backdropFilter: "blur(12px)" }}
      />

      {/* Popup card */}
      <div
        className="relative w-full bg-white rounded-t-3xl shadow-2xl pb-8 pt-6 px-6"
        style={{ animation: "slideUp 0.28s ease-out", maxWidth: "600px" }}
        role="dialog"
        aria-modal="true"
      >
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">
          Waiting for response!
        </h2>

        {/* Booking Status */}
        {bookingStatus && (
          <p className="text-center text-sm text-gray-600 mb-2">{bookingStatus}</p>
        )}

        {/* Booking ID (for debugging) */}
        {bookingId && (
          <p className="text-center text-xs text-gray-400 mb-2">
            Booking: {bookingId.substring(0, 8)}...
          </p>
        )}

        {/* Grey line separator */}
        <div className="w-full h-px bg-gray-300 my-5" />

        {/* Progress bars (top mini indicators) */}
        <div className="flex justify-center gap-3 mb-8 px-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-1 h-1.5 rounded-full transition-opacity duration-300"
              style={{
                background: "linear-gradient(to right, #1A2980, #26D0CE)",
                opacity: i < Math.floor(progress * 4) ? 1 : 0.28,
              }}
            />
          ))}
        </div>

        {/* Circular timer */}
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 mb-3">
            <svg
              width="128"
              height="128"
              viewBox="0 0 128 128"
              style={{ transform: "rotate(-90deg)" }}
            >
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1A2980" />
                  <stop offset="100%" stopColor="#26D0CE" />
                </linearGradient>
              </defs>

              {/* Background circle */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="#E5E7EB"
                strokeWidth={strokeWidth}
                fill="none"
              />

              {/* Progress circle */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="url(#grad)"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                fill="none"
                style={{ transition: "stroke-dashoffset 0.45s ease" }}
              />
            </svg>

            {/* Clock icon in center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="clockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1A2980" />
                    <stop offset="100%" stopColor="#26D0CE" />
                  </linearGradient>
                </defs>
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="url(#clockGrad)"
                  strokeWidth="2"
                  fill="none"
                />
                <path d="M12 6V12L16 14" stroke="url(#clockGrad)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Timer text */}
          <p className="text-lg font-bold text-gray-800">
            {remainingTime} sec
            {remainingTime === 0 && <span className="text-sm text-red-500 ml-2">(Closing...)</span>}
          </p>
        </div>

        {/* Action row */}
        <div className="mt-6 px-4">
          <button
            onClick={() => {
              console.log("🔴 User manually closed waiting popup");
              // Clear interval
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              onClose();
            }}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg transition font-medium"
          >
            Cancel Waiting
          </button>
        </div>
      </div>

      {/* Slide-up animation style preserved */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default WaitingPopup;