import React, { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import { Phone, PhoneOff, Mic, MicOff, X } from "lucide-react";
import { SOCKET_URL } from "../../services/api.service";
import { startCall } from "../../services/callApi";
import {
  requestNotificationPermission,
  showBrowserNotification,
} from "./GlobalBookingModals";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

type CallState =
  | "idle"
  | "calling"
  | "incoming"
  | "connecting"
  | "active"
  | "ended"
  | "rejected"
  | "failed";

interface CallPanelProps {
  isOpen: boolean; // tied to the chat window being open — the socket connects only then
  currentUserId: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
}

interface IncomingCallData {
  callId: string;
  callerId: string;
  callerName?: string;
  callerAvatar?: string;
}

const CallPanel: React.FC<CallPanelProps> = ({
  isOpen,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  otherUserId,
  otherUserName,
  otherUserAvatar,
}) => {
  const [callState, setCallState] = useState<CallState>("idle");
  const [callId, setCallId] = useState<string | null>(null);
  const callIdRef = useRef<string | null>(null); // socket handlers read this, not the state, to avoid stale closures
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);

  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const remoteDescriptionSetRef = useRef(false);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const otherPartyIdRef = useRef<string>(otherUserId); // the party a live call is actually with
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Socket lifecycle — connects for as long as the chat window is open
  useEffect(() => {
    if (!isOpen) return;

    const socket = io(SOCKET_URL, { transports: ["polling", "websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", currentUserId);
    });

    socket.on("incomingCall", (data: IncomingCallData) => {
      otherPartyIdRef.current = data.callerId;
      setIncomingCall(data);
      setCallId(data.callId);
      callIdRef.current = data.callId;
      setCallState("incoming");

      if (document.hidden) {
        showBrowserNotification(
          `📞 Incoming call from ${data.callerName || "someone"}`,
          { body: "Tap to open the chat and answer.", icon: "/logo.png", tag: `call-${data.callId}` }
        );
      }
    });

    socket.on("callOffer", (data: { callId: string; offer: RTCSessionDescriptionInit }) => {
      pendingOfferRef.current = data.offer;
    });

    socket.on("callAnswer", async (data: { callId: string; answer: RTCSessionDescriptionInit }) => {
      const pc = pcRef.current;
      if (!pc || data.callId !== callIdRef.current) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        remoteDescriptionSetRef.current = true;
        await flushPendingCandidates();
        setCallState("active");
      } catch {
        setCallState("failed");
      }
    });

    socket.on("iceCandidate", async (data: { callId: string; candidate: RTCIceCandidateInit }) => {
      const pc = pcRef.current;
      if (!pc) return;
      if (remoteDescriptionSetRef.current) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch {
          // ignore individual candidate failures
        }
      } else {
        pendingCandidatesRef.current.push(data.candidate);
      }
    });

    socket.on("callRejected", () => {
      cleanupCall();
      setCallState("rejected");
      setTimeout(() => setCallState("idle"), 2000);
    });

    socket.on("callEnded", () => {
      cleanupCall();
      setCallState("ended");
      setTimeout(() => setCallState("idle"), 2000);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      cleanupCall();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentUserId]);

  useEffect(() => {
    if (callState === "active") {
      durationTimerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } else {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      setDuration(0);
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [callState]);

  const flushPendingCandidates = async () => {
    const pc = pcRef.current;
    if (!pc) return;
    const queued = pendingCandidatesRef.current;
    pendingCandidatesRef.current = [];
    for (const candidate of queued) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        // ignore
      }
    }
  };

  const setupPeerConnection = (callIdForIce: string, targetUserId: string) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit("iceCandidate", {
          callId: callIdForIce,
          targetUserId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
      }
    };

    return pc;
  };

  const cleanupCall = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    remoteDescriptionSetRef.current = false;
    pendingCandidatesRef.current = [];
    pendingOfferRef.current = null;
    callIdRef.current = null;
    setIsMuted(false);
  };

  const handleStartCall = async () => {
    try {
      setCallState("calling");
      otherPartyIdRef.current = otherUserId;

      const { call } = await startCall({ callerId: currentUserId, receiverId: otherUserId });
      const newCallId = call._id;
      setCallId(newCallId);
      callIdRef.current = newCallId;

      socketRef.current?.emit("initiateCall", {
        callId: newCallId,
        callerId: currentUserId,
        receiverId: otherUserId,
        callerName: currentUserName,
        callerAvatar: currentUserAvatar,
      });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;

      const pc = setupPeerConnection(newCallId, otherUserId);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.emit("callOffer", { callId: newCallId, receiverId: otherUserId, offer, from: currentUserId });
    } catch {
      setCallState("failed");
      setTimeout(() => setCallState("idle"), 2000);
    }
  };

  const handleAcceptIncoming = async () => {
    if (!incomingCall) return;
    try {
      setCallState("connecting");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;

      const pc = setupPeerConnection(incomingCall.callId, incomingCall.callerId);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      if (pendingOfferRef.current) {
        await pc.setRemoteDescription(new RTCSessionDescription(pendingOfferRef.current));
        remoteDescriptionSetRef.current = true;
        await flushPendingCandidates();
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketRef.current?.emit("callAnswer", {
        callId: incomingCall.callId,
        callerId: incomingCall.callerId,
        answer,
        from: currentUserId,
      });

      setCallState("active");
    } catch {
      setCallState("failed");
      setTimeout(() => setCallState("idle"), 2000);
    }
  };

  const handleDeclineIncoming = () => {
    if (incomingCall) {
      socketRef.current?.emit("rejectCall", { callId: incomingCall.callId });
    }
    cleanupCall();
    setIncomingCall(null);
    setCallState("idle");
  };

  const handleHangUp = () => {
    if (callId) {
      socketRef.current?.emit("endCall", { callId, userId: currentUserId });
    }
    cleanupCall();
    setCallState("idle");
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) track.enabled = !next;
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!isOpen) return null;

  const displayName = callState === "incoming" ? incomingCall?.callerName || "Unknown" : otherUserName;
  const displayAvatar =
    callState === "incoming"
      ? incomingCall?.callerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${incomingCall?.callerName}`
      : otherUserAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUserName}`;

  return (
    <>
      {/* Hidden audio sink for the remote party's voice */}
      <audio ref={remoteAudioRef} autoPlay />

      {/* Idle: just the call button, shown inline where PopupChat renders it */}
      {callState === "idle" && (
        <button
          onClick={handleStartCall}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Call"
          title={`Call ${otherUserName}`}
        >
          <Phone className="w-4 h-4 text-gray-600" />
        </button>
      )}

      {/* Everything else: a floating call overlay */}
      {callState !== "idle" && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs flex flex-col items-center py-8 px-6">
            <img src={displayAvatar} alt={displayName} className="w-20 h-20 rounded-full ring-4 ring-blue-100 mb-4" />
            <h3 className="font-semibold text-gray-900 text-lg">{displayName}</h3>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              {callState === "calling" && "Calling…"}
              {callState === "incoming" && "Incoming voice call"}
              {callState === "connecting" && "Connecting…"}
              {callState === "active" && formatDuration(duration)}
              {callState === "ended" && "Call ended"}
              {callState === "rejected" && "Call declined"}
              {callState === "failed" && "Call failed"}
            </p>

            {callState === "incoming" && (
              <div className="flex gap-6">
                <button
                  onClick={handleDeclineIncoming}
                  className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-colors"
                  aria-label="Decline"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
                <button
                  onClick={handleAcceptIncoming}
                  className="p-4 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-md transition-colors"
                  aria-label="Accept"
                >
                  <Phone className="w-6 h-6" />
                </button>
              </div>
            )}

            {(callState === "calling" || callState === "connecting" || callState === "active") && (
              <div className="flex gap-4">
                {callState === "active" && (
                  <button
                    onClick={toggleMute}
                    className={`p-4 rounded-full shadow-md transition-colors ${isMuted ? "bg-gray-300" : "bg-gray-100"}`}
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <MicOff className="w-5 h-5 text-gray-700" /> : <Mic className="w-5 h-5 text-gray-700" />}
                  </button>
                )}
                <button
                  onClick={handleHangUp}
                  className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-colors"
                  aria-label="End call"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              </div>
            )}

            {(callState === "ended" || callState === "rejected" || callState === "failed") && (
              <button
                onClick={() => setCallState("idle")}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CallPanel;
