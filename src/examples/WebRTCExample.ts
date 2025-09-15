// Примеры использования WebRTC API

import { WebRTCService } from '../services/WebRTCService';
import { 
  createSignalingPackage, 
  createAnswerPackage,
  createCompactString,
  parseCompactString 
} from '../utils/signaling';
import { copyToClipboard, readFromClipboard } from '../utils/clipboard';

/**
 * Пример 1: Базовое создание соединения
 */
export async function basicConnectionExample() {
  const service = new WebRTCService();
  
  try {
    // Создаем соединение
    await service.createConnection();
    console.log('Соединение создано');
    
    // Получаем локальный медиапоток
    const localStream = await service.getLocalStream();
    console.log('Локальный поток получен:', localStream);
    
    // Подписываемся на события
    service.on('onConnectionStateChange', (state) => {
      console.log('Состояние соединения:', state);
    });
    
    service.on('onRemoteStream', (stream) => {
      console.log('Получен удаленный поток:', stream);
    });
    
    // Закрываем соединение
    await service.close();
    console.log('Соединение закрыто');
    
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

/**
 * Пример 2: Инициация звонка
 */
export async function initiateCallExample() {
  const service = new WebRTCService();
  
  try {
    // Создаем соединение и получаем медиапоток
    await service.createConnection();
    await service.getLocalStream();
    
    // Создаем офер
    const offer = await service.createOffer();
    console.log('Офер создан:', offer);
    
    // Ждем ICE кандидатов (в реальном приложении это делается через события)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Получаем ICE кандидаты
    const iceCandidates = service.getIceCandidates();
    console.log('ICE кандидаты:', iceCandidates);
    
    // Создаем пакет для обмена
    const signalingPackage = createSignalingPackage(offer, iceCandidates);
    const compactString = createCompactString(signalingPackage);
    
    console.log('Данные для обмена:', compactString);
    
    // Копируем в буфер обмена
    await copyToClipboard(compactString);
    console.log('Данные скопированы в буфер обмена');
    
    return { service, compactString };
    
  } catch (error) {
    console.error('Ошибка инициирования звонка:', error);
    throw error;
  }
}

/**
 * Пример 3: Принятие звонка
 */
export async function acceptCallExample(signalingData: string) {
  const service = new WebRTCService();
  
  try {
    // Парсим данные
    const packageData = parseCompactString(signalingData);
    if (!packageData || !packageData.offer) {
      throw new Error('Неверный формат данных');
    }
    
    // Создаем соединение и получаем медиапоток
    await service.createConnection();
    await service.getLocalStream();
    
    // Устанавливаем удаленное описание
    const offer = {
      type: 'offer' as const,
      sdp: packageData.offer,
    };
    await service.setRemoteDescription(offer);
    
    // Создаем ответ
    const answer = await service.createAnswer();
    console.log('Ответ создан:', answer);
    
    // Ждем ICE кандидаты
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Получаем ICE кандидаты
    const iceCandidates = service.getIceCandidates();
    
    // Создаем ответный пакет
    const answerPackage = createAnswerPackage(answer, iceCandidates);
    const compactString = createCompactString(answerPackage);
    
    console.log('Ответные данные:', compactString);
    
    // Копируем в буфер обмена
    await copyToClipboard(compactString);
    console.log('Ответные данные скопированы в буфер обмена');
    
    return { service, compactString };
    
  } catch (error) {
    console.error('Ошибка принятия звонка:', error);
    throw error;
  }
}

/**
 * Пример 4: Завершение установки соединения
 */
export async function completeConnectionExample(
  service: WebRTCService, 
  answerData: string
) {
  try {
    // Парсим ответные данные
    const packageData = parseCompactString(answerData);
    if (!packageData || !packageData.answer) {
      throw new Error('Неверный формат ответных данных');
    }
    
    // Устанавливаем удаленное описание (ответ)
    const answer = {
      type: 'answer' as const,
      sdp: packageData.answer,
    };
    await service.setRemoteDescription(answer);
    
    // Добавляем ICE кандидаты
    if (packageData.iceCandidates) {
      for (const candidateData of packageData.iceCandidates) {
        const candidate = {
          candidate: candidateData,
          sdpMLineIndex: null,
          sdpMid: null,
          usernameFragment: undefined,
        };
        await service.addIceCandidate(candidate);
      }
    }
    
    console.log('Соединение установлено!');
    
    // Подписываемся на события
    service.on('onConnectionStateChange', (state) => {
      console.log('Состояние соединения:', state);
      if (state === 'connected') {
        console.log('🎉 Соединение успешно установлено!');
      } else if (state === 'failed') {
        console.log('❌ Соединение не удалось установить');
      }
    });
    
    service.on('onRemoteStream', (stream) => {
      console.log('📹 Получен удаленный видеопоток');
    });
    
    return service;
    
  } catch (error) {
    console.error('Ошибка завершения соединения:', error);
    throw error;
  }
}

/**
 * Пример 5: Полный цикл звонка
 */
export async function fullCallCycleExample() {
  console.log('🚀 Начинаем полный цикл звонка...');
  
  try {
    // Шаг 1: Инициатор создает звонок
    console.log('📞 Инициатор создает звонок...');
    const { service: initiatorService, compactString: offerData } = 
      await initiateCallExample();
    
    // Шаг 2: Получатель принимает звонок
    console.log('📱 Получатель принимает звонок...');
    const { service: receiverService, compactString: answerData } = 
      await acceptCallExample(offerData);
    
    // Шаг 3: Инициатор завершает установку соединения
    console.log('🔗 Инициатор завершает установку соединения...');
    await completeConnectionExample(initiatorService, answerData);
    
    // Шаг 4: Получатель также завершает установку (для симметрии)
    console.log('🔗 Получатель завершает установку соединения...');
    await completeConnectionExample(receiverService, offerData);
    
    console.log('✅ Полный цикл звонка завершен успешно!');
    
    // Возвращаем сервисы для дальнейшего использования
    return { initiatorService, receiverService };
    
  } catch (error) {
    console.error('❌ Ошибка в полном цикле звонка:', error);
    throw error;
  }
}

/**
 * Пример 6: Работа с буфером обмена
 */
export async function clipboardExample() {
  try {
    // Создаем тестовые данные
    const testData = 'Тестовые данные для буфера обмена';
    
    // Копируем в буфер обмена
    const copySuccess = await copyToClipboard(testData);
    console.log('Копирование:', copySuccess ? 'Успешно' : 'Ошибка');
    
    // Читаем из буфера обмена
    const clipboardData = await readFromClipboard();
    console.log('Данные из буфера:', clipboardData);
    
    // Проверяем совпадение
    const isMatch = clipboardData === testData;
    console.log('Данные совпадают:', isMatch);
    
    return isMatch;
    
  } catch (error) {
    console.error('Ошибка работы с буфером обмена:', error);
    return false;
  }
}

/**
 * Пример 7: Обработка ошибок
 */
export async function errorHandlingExample() {
  const service = new WebRTCService();
  
  try {
    // Подписываемся на ошибки
    service.on('onError', (error) => {
      console.error('WebRTC ошибка:', error);
    });
    
    service.on('onConnectionStateChange', (state) => {
      if (state === 'failed') {
        console.log('Соединение не удалось установить');
      }
    });
    
    // Пытаемся создать соединение без медиапотока
    await service.createConnection();
    
    // Это должно вызвать ошибку, так как нет медиапотока
    await service.createOffer();
    
  } catch (error) {
    console.log('Перехвачена ошибка:', error);
  } finally {
    await service.close();
  }
}

// Экспорт всех примеров
export const examples = {
  basicConnection: basicConnectionExample,
  initiateCall: initiateCallExample,
  acceptCall: acceptCallExample,
  completeConnection: completeConnectionExample,
  fullCallCycle: fullCallCycleExample,
  clipboard: clipboardExample,
  errorHandling: errorHandlingExample,
};
