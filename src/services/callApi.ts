import { API_BASE_URL, authHeader } from './api.service';

export interface Call {
  _id: string;
  callerId: string;
  receiverId: string;
  callType: 'audio';
  status: 'ringing' | 'accepted' | 'rejected' | 'missed' | 'ended';
  startedAt?: string;
  endedAt?: string;
  duration?: number;
}

const post = async (path: string, body: unknown) => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
};

export const startCall = (params: {
  callerId: string;
  receiverId: string;
  callerSocketId?: string;
}): Promise<{ success: boolean; call: Call }> =>
  post('/start', { ...params, callType: 'audio' });

export const endCallApi = (callId: string, reason?: string) =>
  post('/end', { callId, reason });

export const rejectCallApi = (callId: string, reason?: string) =>
  post('/rejectCall', { callId, reason });
