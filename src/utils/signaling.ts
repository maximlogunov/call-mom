// Утилиты для сериализации и десериализации данных сигналинга

import { 
  SerializedSignalingData, 
  SignalingData, 
  RTCSessionDescriptionInit, 
  RTCIceCandidateInit 
} from '../types/webrtc';

/**
 * Сериализует SDP офер в base64 строку
 */
export function serializeOffer(offer: RTCSessionDescriptionInit): string {
  try {
    const jsonString = JSON.stringify(offer);
    return btoa(jsonString);
  } catch (error) {
    throw new Error(`Ошибка сериализации офера: ${error}`);
  }
}

/**
 * Десериализует base64 строку в SDP офер
 */
export function deserializeOffer(serializedOffer: string): RTCSessionDescriptionInit {
  try {
    const jsonString = atob(serializedOffer);
    return JSON.parse(jsonString) as RTCSessionDescriptionInit;
  } catch (error) {
    throw new Error(`Ошибка десериализации офера: ${error}`);
  }
}

/**
 * Сериализует SDP ответ в base64 строку
 */
export function serializeAnswer(answer: RTCSessionDescriptionInit): string {
  try {
    const jsonString = JSON.stringify(answer);
    return btoa(jsonString);
  } catch (error) {
    throw new Error(`Ошибка сериализации ответа: ${error}`);
  }
}

/**
 * Десериализует base64 строку в SDP ответ
 */
export function deserializeAnswer(serializedAnswer: string): RTCSessionDescriptionInit {
  try {
    const jsonString = atob(serializedAnswer);
    return JSON.parse(jsonString) as RTCSessionDescriptionInit;
  } catch (error) {
    throw new Error(`Ошибка десериализации ответа: ${error}`);
  }
}

/**
 * Сериализует ICE кандидата в base64 строку
 */
export function serializeIceCandidate(candidate: RTCIceCandidateInit): string {
  try {
    const jsonString = JSON.stringify(candidate);
    return btoa(jsonString);
  } catch (error) {
    throw new Error(`Ошибка сериализации ICE кандидата: ${error}`);
  }
}

/**
 * Десериализует base64 строку в ICE кандидата
 */
export function deserializeIceCandidate(serializedCandidate: string): RTCIceCandidateInit {
  try {
    const jsonString = atob(serializedCandidate);
    return JSON.parse(jsonString) as RTCIceCandidateInit;
  } catch (error) {
    throw new Error(`Ошибка десериализации ICE кандидата: ${error}`);
  }
}

/**
 * Создает полный набор данных для сигналинга (офер + ICE кандидаты)
 */
export function createSignalingPackage(
  offer: RTCSessionDescriptionInit,
  iceCandidates: RTCIceCandidateInit[]
): SerializedSignalingData {
  return {
    offer: serializeOffer(offer),
    iceCandidates: iceCandidates.map(serializeIceCandidate),
    timestamp: Date.now(),
  };
}

/**
 * Создает ответный пакет для сигналинга (ответ + ICE кандидаты)
 */
export function createAnswerPackage(
  answer: RTCSessionDescriptionInit,
  iceCandidates: RTCIceCandidateInit[]
): SerializedSignalingData {
  return {
    answer: serializeAnswer(answer),
    iceCandidates: iceCandidates.map(serializeIceCandidate),
    timestamp: Date.now(),
  }
}

/**
 * Создает глубокую ссылку для приглашения к звонку
 */
export function createCallLink(signalingData: SerializedSignalingData): string {
  const encodedData = btoa(JSON.stringify(signalingData));
  return `callmom://call?data=${encodedData}`;
}

/**
 * Извлекает данные сигналинга из глубокой ссылки
 */
export function parseCallLink(link: string): SerializedSignalingData | null {
  try {
    const url = new URL(link);
    const dataParam = url.searchParams.get('data');
    
    if (!dataParam) {
      return null;
    }
    
    const jsonString = atob(dataParam);
    return JSON.parse(jsonString) as SerializedSignalingData;
  } catch (error) {
    console.error('Ошибка парсинга ссылки:', error);
    return null;
  }
}

/**
 * Создает QR-код данные для обмена
 */
export function createQRData(signalingData: SerializedSignalingData): string {
  return JSON.stringify(signalingData);
}

/**
 * Парсит данные из QR-кода
 */
export function parseQRData(qrData: string): SerializedSignalingData | null {
  try {
    return JSON.parse(qrData) as SerializedSignalingData;
  } catch (error) {
    console.error('Ошибка парсинга QR данных:', error);
    return null;
  }
}

/**
 * Валидирует структуру данных сигналинга
 */
export function validateSignalingData(data: any): data is SerializedSignalingData {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.timestamp === 'number' &&
    (data.offer || data.answer) &&
    Array.isArray(data.iceCandidates)
  );
}

/**
 * Создает компактную строку для копирования в буфер обмена
 */
export function createCompactString(signalingData: SerializedSignalingData): string {
  const compact = {
    o: signalingData.offer,
    a: signalingData.answer,
    i: signalingData.iceCandidates,
    t: signalingData.timestamp,
  };
  
  return btoa(JSON.stringify(compact));
}

/**
 * Парсит компактную строку из буфера обмена
 */
export function parseCompactString(compactString: string): SerializedSignalingData | null {
  try {
    const jsonString = atob(compactString);
    const compact = JSON.parse(jsonString);
    
    return {
      offer: compact.o,
      answer: compact.a,
      iceCandidates: compact.i,
      timestamp: compact.t,
    };
  } catch (error) {
    console.error('Ошибка парсинга компактной строки:', error);
    return null;
  }
}
