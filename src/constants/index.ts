// Константы приложения Call Mom

export const APP_CONFIG = {
  name: 'Call Mom',
  version: '1.0.0',
  description: 'P2P Video Calling App with WebRTC',
} as const;

export const WEBRTC_CONFIG = {
  // STUN серверы
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
  
  // Настройки соединения
  sdpSemantics: 'unified-plan' as const,
  bundlePolicy: 'max-bundle' as const,
  rtcpMuxPolicy: 'require' as const,
  iceCandidatePoolSize: 10,
  
  // Таймауты
  connectionTimeout: 30000, // 30 секунд
  iceGatheringTimeout: 10000, // 10 секунд
} as const;

export const MEDIA_CONSTRAINTS = {
  // Видео настройки
  video: {
    width: { ideal: 640, max: 1280 },
    height: { ideal: 480, max: 720 },
    frameRate: { ideal: 30, max: 60 },
    facingMode: 'user' as const,
  },
  
  // Аудио настройки
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
    channelCount: 1,
  },
} as const;

export const UI_CONFIG = {
  // Цвета
  colors: {
    primary: '#2196F3',
    secondary: '#FF9800',
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
  },
  
  // Размеры
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  // Радиусы
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  
  // Тени
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  },
} as const;

export const MESSAGES = {
  // Успешные операции
  success: {
    connectionEstablished: 'Соединение установлено!',
    dataCopied: 'Данные скопированы в буфер обмена',
    dataPasted: 'Данные вставлены из буфера обмена',
    callEnded: 'Звонок завершен',
  },
  
  // Ошибки
  error: {
    webRTCNotAvailable: 'WebRTC API недоступен',
    connectionFailed: 'Не удалось установить соединение',
    mediaAccessDenied: 'Доступ к камере/микрофону запрещен',
    invalidData: 'Неверный формат данных',
    copyFailed: 'Не удалось скопировать данные',
    pasteFailed: 'Не удалось прочитать данные из буфера обмена',
    unknownError: 'Произошла неизвестная ошибка',
  },
  
  // Информационные сообщения
  info: {
    generatingOffer: 'Генерация предложения соединения...',
    waitingForAnswer: 'Ожидание ответа от собеседника...',
    establishingConnection: 'Установление соединения...',
    connectionInProgress: 'Соединение в процессе...',
  },
  
  // Предупреждения
  warning: {
    networkIssues: 'Возможны проблемы с сетью',
    lowBandwidth: 'Низкая скорость соединения',
    deviceNotSupported: 'Устройство может не поддерживать WebRTC',
  },
} as const;

export const DEEP_LINKS = {
  scheme: 'callmom',
  host: 'call',
  paths: {
    call: '/call',
    accept: '/accept',
  },
} as const;

export const STORAGE_KEYS = {
  contacts: 'call_mom_contacts',
  settings: 'call_mom_settings',
  lastCall: 'call_mom_last_call',
} as const;

export const PERMISSIONS = {
  camera: 'camera',
  microphone: 'microphone',
  network: 'network',
} as const;

export const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
} as const;

export const DEFAULT_SETTINGS = {
  videoEnabled: true,
  audioEnabled: true,
  videoQuality: 'medium' as const,
  audioQuality: 'high' as const,
  autoAcceptCalls: false,
  showLocalVideo: true,
  enableEchoCancellation: true,
  enableNoiseSuppression: true,
} as const;
