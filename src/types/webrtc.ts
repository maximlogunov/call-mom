// WebRTC типы для приложения Call Mom

export interface RTCConfiguration {
  iceServers: RTCIceServer[];
  sdpSemantics?: 'unified-plan' | 'plan-b';
  bundlePolicy?: 'balanced' | 'max-compat' | 'max-bundle';
  rtcpMuxPolicy?: 'negotiate' | 'require';
  iceCandidatePoolSize?: number;
}

export interface RTCIceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface RTCSessionDescriptionInit {
  type: 'offer' | 'answer' | 'pranswer' | 'rollback';
  sdp?: string;
}

export interface RTCIceCandidateInit {
  candidate?: string;
  sdpMLineIndex?: number | null;
  sdpMid?: string | null;
  usernameFragment?: string;
}

export interface MediaStreamConstraints {
  video?: boolean | MediaTrackConstraints;
  audio?: boolean | MediaTrackConstraints;
}

export interface MediaTrackConstraints {
  width?: number | ConstrainULongRange;
  height?: number | ConstrainULongRange;
  frameRate?: number | ConstrainDoubleRange;
  facingMode?: 'user' | 'environment' | 'left' | 'right';
  deviceId?: string | ConstrainDOMString;
  // Audio-specific constraints
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
}

export interface ConstrainULongRange {
  min?: number;
  max?: number;
  exact?: number;
  ideal?: number;
}

export interface ConstrainDoubleRange {
  min?: number;
  max?: number;
  exact?: number;
  ideal?: number;
}

export interface ConstrainDOMString {
  min?: string;
  max?: string;
  exact?: string;
  ideal?: string;
}

export interface MediaStream {
  id: string;
  active: boolean;
  getTracks(): MediaStreamTrack[];
  getVideoTracks(): MediaStreamTrack[];
  getAudioTracks(): MediaStreamTrack[];
  addTrack(track: MediaStreamTrack): void;
  removeTrack(track: MediaStreamTrack): void;
}

export interface MediaStreamTrack {
  id: string;
  kind: 'audio' | 'video';
  label: string;
  enabled: boolean;
  muted: boolean;
  readyState: 'live' | 'ended';
  stop(): void;
}

// Состояния соединения
export type ConnectionState = 
  | 'new'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'failed'
  | 'closed';

export type IceConnectionState = 
  | 'new'
  | 'checking'
  | 'connected'
  | 'completed'
  | 'failed'
  | 'disconnected'
  | 'closed';

// События WebRTC
export interface WebRTCEvents {
  onConnectionStateChange: (state: ConnectionState) => void;
  onIceConnectionStateChange: (state: IceConnectionState) => void;
  onIceCandidate: (candidate: RTCIceCandidateInit) => void;
  onRemoteStream: (stream: MediaStream) => void;
  onLocalStream: (stream: MediaStream) => void;
  onError: (error: Error) => void;
}

// Данные для сигналинга
export interface SignalingData {
  type: 'offer' | 'answer' | 'ice-candidate';
  data: RTCSessionDescriptionInit | RTCIceCandidateInit;
  timestamp: number;
}

// Сериализованные данные для обмена
export interface SerializedSignalingData {
  offer?: string; // base64 encoded SDP
  answer?: string; // base64 encoded SDP
  iceCandidates?: string[]; // base64 encoded ICE candidates
  timestamp: number;
}

// Конфигурация по умолчанию
export const DEFAULT_RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
  sdpSemantics: 'unified-plan',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
  iceCandidatePoolSize: 10,
};

export const DEFAULT_MEDIA_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    frameRate: { ideal: 30 },
    facingMode: 'user',
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};
