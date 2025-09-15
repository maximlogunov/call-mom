// WebRTC сервис для P2P соединений в Call Mom

import {
  RTCConfiguration,
  RTCSessionDescriptionInit,
  RTCIceCandidateInit,
  MediaStreamConstraints,
  ConnectionState,
  IceConnectionState,
  WebRTCEvents,
  DEFAULT_RTC_CONFIG,
  DEFAULT_MEDIA_CONSTRAINTS,
} from '../types/webrtc';

// Абстрактный интерфейс для WebRTC API
interface WebRTCAPI {
  RTCPeerConnection: new (config: RTCConfiguration) => RTCPeerConnection;
  RTCSessionDescription: new (init: RTCSessionDescriptionInit) => RTCSessionDescription;
  RTCIceCandidate: new (init: RTCIceCandidateInit) => RTCIceCandidate;
  mediaDevices: MediaDevices;
}

// Глобальные типы для WebRTC (будут доступны в браузере или через polyfill)
declare global {
  interface RTCPeerConnection {
    createOffer(): Promise<RTCSessionDescriptionInit>;
    createAnswer(): Promise<RTCSessionDescriptionInit>;
    setLocalDescription(description: RTCSessionDescriptionInit): Promise<void>;
    setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void>;
    addIceCandidate(candidate: RTCIceCandidateInit): Promise<void>;
    addTrack(track: MediaStreamTrack, stream: MediaStream): RTCRtpSender;
    removeTrack(sender: RTCRtpSender): void;
    getStats(): Promise<RTCStatsReport>;
    close(): void;
    
    // События
    onconnectionstatechange: ((event: Event) => void) | null;
    oniceconnectionstatechange: ((event: Event) => void) | null;
    onicecandidate: ((event: RTCPeerConnectionIceEvent) => void) | null;
    ontrack: ((event: RTCTrackEvent) => void) | null;
    
    // Свойства
    connectionState: ConnectionState;
    iceConnectionState: IceConnectionState;
    localDescription: RTCSessionDescriptionInit | null;
    remoteDescription: RTCSessionDescriptionInit | null;
  }

  interface RTCSessionDescription {
    type: 'offer' | 'answer' | 'pranswer' | 'rollback';
    sdp: string;
  }

  interface RTCIceCandidate {
    candidate: string;
    sdpMLineIndex: number | null;
    sdpMid: string | null;
    usernameFragment: string | null;
  }

  interface RTCPeerConnectionIceEvent extends Event {
    candidate: RTCIceCandidate | null;
  }

  interface RTCTrackEvent extends Event {
    streams: MediaStream[];
    track: MediaStreamTrack;
  }

  interface MediaDevices {
    getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
    enumerateDevices(): Promise<MediaDeviceInfo[]>;
  }

  interface MediaStream {
    id: string;
    active: boolean;
    getTracks(): MediaStreamTrack[];
    getVideoTracks(): MediaStreamTrack[];
    getAudioTracks(): MediaStreamTrack[];
    addTrack(track: MediaStreamTrack): void;
    removeTrack(track: MediaStreamTrack): void;
  }

  interface MediaStreamTrack {
    id: string;
    kind: 'audio' | 'video';
    label: string;
    enabled: boolean;
    muted: boolean;
    readyState: 'live' | 'ended';
    stop(): void;
  }

  interface MediaDeviceInfo {
    deviceId: string;
    groupId: string;
    kind: 'audioinput' | 'audiooutput' | 'videoinput';
    label: string;
  }
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private iceCandidates: RTCIceCandidateInit[] = [];
  private events: Partial<WebRTCEvents> = {};
  private config: RTCConfiguration;
  private mediaConstraints: MediaStreamConstraints;
  private webrtcAPI: WebRTCAPI | null = null;

  constructor(
    config: RTCConfiguration = DEFAULT_RTC_CONFIG,
    mediaConstraints: MediaStreamConstraints = DEFAULT_MEDIA_CONSTRAINTS
  ) {
    this.config = config;
    this.mediaConstraints = mediaConstraints;
    this.initializeWebRTCAPI();
  }

  /**
   * Инициализация WebRTC API
   * В Expo это может быть polyfill или нативная реализация
   */
  private initializeWebRTCAPI(): void {
    // Проверяем доступность WebRTC API
    if (typeof window !== 'undefined' && window.RTCPeerConnection) {
      this.webrtcAPI = {
        RTCPeerConnection: window.RTCPeerConnection,
        RTCSessionDescription: window.RTCSessionDescription,
        RTCIceCandidate: window.RTCIceCandidate,
        mediaDevices: navigator.mediaDevices,
      };
    } else {
      console.warn('WebRTC API не доступен. Требуется polyfill или нативная реализация.');
      // Здесь можно добавить fallback или polyfill
    }
  }

  /**
   * Проверка доступности WebRTC
   */
  public isWebRTCAvailable(): boolean {
    return this.webrtcAPI !== null;
  }

  /**
   * Создание нового P2P соединения
   */
  public async createConnection(): Promise<void> {
    if (!this.webrtcAPI) {
      throw new Error('WebRTC API недоступен');
    }

    try {
      this.peerConnection = new this.webrtcAPI.RTCPeerConnection(this.config);
      this.setupEventHandlers();
      
      console.log('WebRTC соединение создано');
    } catch (error) {
      console.error('Ошибка создания соединения:', error);
      throw error;
    }
  }

  /**
   * Настройка обработчиков событий
   */
  private setupEventHandlers(): void {
    if (!this.peerConnection) return;

    // Изменение состояния соединения
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState as ConnectionState;
      console.log('Состояние соединения:', state);
      this.events.onConnectionStateChange?.(state);
    };

    // Изменение состояния ICE соединения
    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection?.iceConnectionState as IceConnectionState;
      console.log('Состояние ICE соединения:', state);
      this.events.onIceConnectionStateChange?.(state);
    };

    // Получение ICE кандидатов
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const candidate: RTCIceCandidateInit = {
          candidate: event.candidate.candidate,
          sdpMLineIndex: event.candidate.sdpMLineIndex,
          sdpMid: event.candidate.sdpMid,
          usernameFragment: event.candidate.usernameFragment,
        };
        
        this.iceCandidates.push(candidate);
        console.log('ICE кандидат получен:', candidate);
        this.events.onIceCandidate?.(candidate);
      }
    };

    // Получение удаленного медиапотока
    this.peerConnection.ontrack = (event) => {
      console.log('Получен удаленный медиапоток');
      this.remoteStream = event.streams[0];
      this.events.onRemoteStream?.(event.streams[0]);
    };
  }

  /**
   * Получение локального медиапотока
   */
  public async getLocalStream(): Promise<MediaStream> {
    if (!this.webrtcAPI) {
      throw new Error('WebRTC API недоступен');
    }

    try {
      this.localStream = await this.webrtcAPI.mediaDevices.getUserMedia(this.mediaConstraints);
      
      // Добавляем треки в соединение
      if (this.peerConnection) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection!.addTrack(track, this.localStream!);
        });
      }
      
      console.log('Локальный медиапоток получен');
      this.events.onLocalStream?.(this.localStream);
      
      return this.localStream;
    } catch (error) {
      console.error('Ошибка получения медиапотока:', error);
      throw error;
    }
  }

  /**
   * Создание SDP офера
   */
  public async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Соединение не создано');
    }

    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      console.log('SDP офер создан:', offer);
      return offer;
    } catch (error) {
      console.error('Ошибка создания офера:', error);
      throw error;
    }
  }

  /**
   * Создание SDP ответа
   */
  public async createAnswer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Соединение не создано');
    }

    try {
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      console.log('SDP ответ создан:', answer);
      return answer;
    } catch (error) {
      console.error('Ошибка создания ответа:', error);
      throw error;
    }
  }

  /**
   * Установка удаленного SDP описания
   */
  public async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection || !this.webrtcAPI) {
      throw new Error('Соединение или WebRTC API недоступен');
    }

    try {
      const rtcDescription = new this.webrtcAPI.RTCSessionDescription(description);
      await this.peerConnection.setRemoteDescription(rtcDescription);
      
      console.log('Удаленное SDP описание установлено:', description);
    } catch (error) {
      console.error('Ошибка установки удаленного описания:', error);
      throw error;
    }
  }

  /**
   * Добавление ICE кандидата
   */
  public async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection || !this.webrtcAPI) {
      throw new Error('Соединение или WebRTC API недоступен');
    }

    try {
      const rtcCandidate = new this.webrtcAPI.RTCIceCandidate(candidate);
      await this.peerConnection.addIceCandidate(rtcCandidate);
      
      console.log('ICE кандидат добавлен:', candidate);
    } catch (error) {
      console.error('Ошибка добавления ICE кандидата:', error);
      throw error;
    }
  }

  /**
   * Получение собранных ICE кандидатов
   */
  public getIceCandidates(): RTCIceCandidateInit[] {
    return [...this.iceCandidates];
  }

  /**
   * Очистка ICE кандидатов
   */
  public clearIceCandidates(): void {
    this.iceCandidates = [];
  }

  /**
   * Получение локального медиапотока
   */
  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Получение удаленного медиапотока
   */
  public getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  /**
   * Получение состояния соединения
   */
  public getConnectionState(): ConnectionState | null {
    return this.peerConnection?.connectionState as ConnectionState || null;
  }

  /**
   * Получение состояния ICE соединения
   */
  public getIceConnectionState(): IceConnectionState | null {
    return this.peerConnection?.iceConnectionState as IceConnectionState || null;
  }

  /**
   * Подписка на события
   */
  public on<K extends keyof WebRTCEvents>(event: K, callback: WebRTCEvents[K]): void {
    this.events[event] = callback;
  }

  /**
   * Отписка от событий
   */
  public off<K extends keyof WebRTCEvents>(event: K): void {
    delete this.events[event];
  }

  /**
   * Завершение соединения и очистка ресурсов
   */
  public async close(): Promise<void> {
    try {
      // Останавливаем локальный медиапоток
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }

      // Закрываем соединение
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      // Очищаем удаленный поток
      this.remoteStream = null;
      
      // Очищаем ICE кандидаты
      this.clearIceCandidates();
      
      // Очищаем обработчики событий
      this.events = {};
      
      console.log('WebRTC соединение закрыто');
    } catch (error) {
      console.error('Ошибка закрытия соединения:', error);
      throw error;
    }
  }

  /**
   * Получение статистики соединения
   */
  public async getStats(): Promise<RTCStatsReport | null> {
    if (!this.peerConnection) {
      return null;
    }

    try {
      return await this.peerConnection.getStats();
    } catch (error) {
      console.error('Ошибка получения статистики:', error);
      return null;
    }
  }
}

// Экспорт синглтона для удобства использования
export const webRTCService = new WebRTCService();
