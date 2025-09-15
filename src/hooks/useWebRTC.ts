// React хук для работы с WebRTC

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ConnectionState, 
  IceConnectionState, 
  RTCSessionDescriptionInit, 
  RTCIceCandidateInit,
  MediaStream 
} from '../types/webrtc';
import { WebRTCService } from '../services/WebRTCService';

interface UseWebRTCOptions {
  autoCreateConnection?: boolean;
  autoGetLocalStream?: boolean;
}

interface UseWebRTCReturn {
  // Состояния
  connectionState: ConnectionState | null;
  iceConnectionState: IceConnectionState | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnected: boolean;
  isConnecting: boolean;
  hasError: boolean;
  error: Error | null;
  
  // Методы
  createConnection: () => Promise<void>;
  getLocalStream: () => Promise<MediaStream>;
  createOffer: () => Promise<RTCSessionDescriptionInit>;
  createAnswer: () => Promise<RTCSessionDescriptionInit>;
  setRemoteDescription: (description: RTCSessionDescriptionInit) => Promise<void>;
  addIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
  getIceCandidates: () => RTCIceCandidateInit[];
  close: () => Promise<void>;
  
  // События
  onConnectionStateChange: (callback: (state: ConnectionState) => void) => void;
  onIceConnectionStateChange: (callback: (state: IceConnectionState) => void) => void;
  onRemoteStream: (callback: (stream: MediaStream) => void) => void;
  onLocalStream: (callback: (stream: MediaStream) => void) => void;
  onError: (callback: (error: Error) => void) => void;
}

export function useWebRTC(options: UseWebRTCOptions = {}): UseWebRTCReturn {
  const { autoCreateConnection = false, autoGetLocalStream = false } = options;
  
  // Состояния
  const [connectionState, setConnectionState] = useState<ConnectionState | null>(null);
  const [iceConnectionState, setIceConnectionState] = useState<IceConnectionState | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Рефы для хранения сервиса и обработчиков
  const serviceRef = useRef<WebRTCService | null>(null);
  const eventHandlersRef = useRef<Map<string, Function>>(new Map());
  
  // Вычисляемые состояния
  const isConnected = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting' || connectionState === 'new';
  
  // Инициализация сервиса
  useEffect(() => {
    if (!serviceRef.current) {
      serviceRef.current = new WebRTCService();
      
      // Настройка обработчиков событий
      serviceRef.current.on('onConnectionStateChange', (state: ConnectionState) => {
        setConnectionState(state);
        setHasError(state === 'failed');
        if (state === 'failed') {
          setError(new Error('Соединение не удалось установить'));
        }
      });
      
      serviceRef.current.on('onIceConnectionStateChange', (state: IceConnectionState) => {
        setIceConnectionState(state);
      });
      
      serviceRef.current.on('onRemoteStream', (stream: MediaStream) => {
        setRemoteStream(stream);
      });
      
      serviceRef.current.on('onLocalStream', (stream: MediaStream) => {
        setLocalStream(stream);
      });
      
      serviceRef.current.on('onError', (err: Error) => {
        setError(err);
        setHasError(true);
      });
    }
    
    return () => {
      if (serviceRef.current) {
        serviceRef.current.close();
        serviceRef.current = null;
      }
    };
  }, []);
  
  // Автоматическое создание соединения
  useEffect(() => {
    if (autoCreateConnection && serviceRef.current) {
      createConnection();
    }
  }, [autoCreateConnection]);
  
  // Автоматическое получение локального потока
  useEffect(() => {
    if (autoGetLocalStream && serviceRef.current && connectionState) {
      getLocalStream();
    }
  }, [autoGetLocalStream, connectionState]);
  
  // Методы
  const createConnection = useCallback(async () => {
    if (!serviceRef.current) return;
    
    try {
      setHasError(false);
      setError(null);
      await serviceRef.current.createConnection();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Неизвестная ошибка');
      setError(error);
      setHasError(true);
    }
  }, []);
  
  const getLocalStream = useCallback(async (): Promise<MediaStream> => {
    if (!serviceRef.current) {
      throw new Error('WebRTC сервис не инициализирован');
    }
    
    try {
      setHasError(false);
      setError(null);
      const stream = await serviceRef.current.getLocalStream();
      return stream;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Неизвестная ошибка');
      setError(error);
      setHasError(true);
      throw error;
    }
  }, []);
  
  const createOffer = useCallback(async (): Promise<RTCSessionDescriptionInit> => {
    if (!serviceRef.current) {
      throw new Error('WebRTC сервис не инициализирован');
    }
    
    try {
      setHasError(false);
      setError(null);
      return await serviceRef.current.createOffer();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Неизвестная ошибка');
      setError(error);
      setHasError(true);
      throw error;
    }
  }, []);
  
  const createAnswer = useCallback(async (): Promise<RTCSessionDescriptionInit> => {
    if (!serviceRef.current) {
      throw new Error('WebRTC сервис не инициализирован');
    }
    
    try {
      setHasError(false);
      setError(null);
      return await serviceRef.current.createAnswer();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Неизвестная ошибка');
      setHasError(true);
      throw error;
    }
  }, []);
  
  const setRemoteDescription = useCallback(async (description: RTCSessionDescriptionInit) => {
    if (!serviceRef.current) {
      throw new Error('WebRTC сервис не инициализирован');
    }
    
    try {
      setHasError(false);
      setError(null);
      await serviceRef.current.setRemoteDescription(description);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Неизвестная ошибка');
      setError(error);
      setHasError(true);
      throw error;
    }
  }, []);
  
  const addIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    if (!serviceRef.current) {
      throw new Error('WebRTC сервис не инициализирован');
    }
    
    try {
      setHasError(false);
      setError(null);
      await serviceRef.current.addIceCandidate(candidate);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Неизвестная ошибка');
      setError(error);
      setHasError(true);
      throw error;
    }
  }, []);
  
  const getIceCandidates = useCallback((): RTCIceCandidateInit[] => {
    if (!serviceRef.current) {
      return [];
    }
    
    return serviceRef.current.getIceCandidates();
  }, []);
  
  const close = useCallback(async () => {
    if (!serviceRef.current) return;
    
    try {
      setHasError(false);
      setError(null);
      await serviceRef.current.close();
      setConnectionState(null);
      setIceConnectionState(null);
      setLocalStream(null);
      setRemoteStream(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Неизвестная ошибка');
      setError(error);
      setHasError(true);
    }
  }, []);
  
  // Обработчики событий
  const onConnectionStateChange = useCallback((callback: (state: ConnectionState) => void) => {
    eventHandlersRef.current.set('onConnectionStateChange', callback);
  }, []);
  
  const onIceConnectionStateChange = useCallback((callback: (state: IceConnectionState) => void) => {
    eventHandlersRef.current.set('onIceConnectionStateChange', callback);
  }, []);
  
  const onRemoteStream = useCallback((callback: (stream: MediaStream) => void) => {
    eventHandlersRef.current.set('onRemoteStream', callback);
  }, []);
  
  const onLocalStream = useCallback((callback: (stream: MediaStream) => void) => {
    eventHandlersRef.current.set('onLocalStream', callback);
  }, []);
  
  const onError = useCallback((callback: (error: Error) => void) => {
    eventHandlersRef.current.set('onError', callback);
  }, []);
  
  return {
    // Состояния
    connectionState,
    iceConnectionState,
    localStream,
    remoteStream,
    isConnected,
    isConnecting,
    hasError,
    error,
    
    // Методы
    createConnection,
    getLocalStream,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    getIceCandidates,
    close,
    
    // События
    onConnectionStateChange,
    onIceConnectionStateChange,
    onRemoteStream,
    onLocalStream,
    onError,
  };
}
