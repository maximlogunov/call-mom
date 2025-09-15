# Интеграция с нативным WebRTC

Данный документ описывает шаги для интеграции созданного WebRTC сервиса с нативными библиотеками React Native.

## Текущее состояние

Созданная архитектура использует абстрактный интерфейс WebRTC, который может работать с различными реализациями:

- ✅ **Веб-платформа**: Встроенная поддержка WebRTC в браузере
- ⚠️ **Мобильные платформы**: Требует интеграции с нативными библиотеками

## Варианты интеграции

### 1. react-native-webrtc (Рекомендуется)

#### Установка

```bash
# Для Expo Dev Client
npx expo install expo-dev-client
npx expo run:ios
npx expo run:android

# Установка react-native-webrtc
npm install react-native-webrtc

# Для iOS
cd ios && pod install && cd ..
```

#### Настройка

1. **Обновите WebRTCService.ts**:

```typescript
// Добавьте импорт
import {
  RTCPeerConnection,
  RTCView,
  mediaDevices,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc';

// Обновите initializeWebRTCAPI
private initializeWebRTCAPI(): void {
  this.webrtcAPI = {
    RTCPeerConnection,
    RTCSessionDescription,
    RTCIceCandidate,
    mediaDevices,
  };
}
```

2. **Обновите компонент для отображения видео**:

```typescript
import { RTCView } from 'react-native-webrtc';

// В компоненте
<RTCView
  style={styles.remoteVideo}
  streamURL={remoteStream?.toURL()}
  mirror={false}
  objectFit="cover"
/>
```

### 2. Expo WebRTC (Альтернатива)

#### Установка

```bash
npx expo install expo-webrtc
```

#### Использование

```typescript
import { WebRTC } from 'expo-webrtc';

// В WebRTCService
private initializeWebRTCAPI(): void {
  this.webrtcAPI = WebRTC;
}
```

### 3. Кастомная реализация

Создайте собственную реализацию WebRTC API:

```typescript
// src/services/CustomWebRTCService.ts
export class CustomWebRTCService extends WebRTCService {
  protected initializeWebRTCAPI(): void {
    // Ваша реализация WebRTC API
    this.webrtcAPI = {
      RTCPeerConnection: YourRTCPeerConnection,
      RTCSessionDescription: YourRTCSessionDescription,
      RTCIceCandidate: YourRTCIceCandidate,
      mediaDevices: YourMediaDevices,
    };
  }
}
```

## Настройка разрешений

### Android (android/app/src/main/AndroidManifest.xml)

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CHANGE_NETWORK_STATE" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

### iOS (ios/YourApp/Info.plist)

```xml
<key>NSCameraUsageDescription</key>
<string>This app needs access to camera for video calls</string>
<key>NSMicrophoneUsageDescription</key>
<string>This app needs access to microphone for video calls</string>
```

## Конфигурация для продакшена

### 1. TURN серверы

Для работы в сложных сетевых конфигурациях добавьте TURN серверы:

```typescript
const config = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { 
      urls: 'turn:your-turn-server.com:3478',
      username: 'user',
      credential: 'password'
    }
  ]
};
```

### 2. Безопасность

```typescript
const config = {
  iceServers: [...],
  sdpSemantics: 'unified-plan',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
  iceCandidatePoolSize: 10,
  // Дополнительные настройки безопасности
  certificates: [/* ваши сертификаты */],
};
```

### 3. Оптимизация производительности

```typescript
const mediaConstraints = {
  video: {
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 },
    frameRate: { ideal: 30, max: 60 },
    facingMode: 'user',
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
    channelCount: 2,
  },
};
```

## Тестирование

### 1. Локальное тестирование

```bash
# Запуск на двух устройствах
npm start

# Откройте Expo Go на обоих устройствах
# Сканируйте QR код
# Протестируйте соединение
```

### 2. Тестирование в разных сетях

- Устройство A: Wi-Fi домашней сети
- Устройство B: Мобильный интернет
- Проверьте установку соединения

### 3. Тестирование производительности

```typescript
// Получение статистики
const stats = await service.getStats();
console.log('Статистика соединения:', stats);
```

## Отладка

### 1. Логирование

```typescript
// Включите подробное логирование
const service = new WebRTCService();
service.on('onConnectionStateChange', (state) => {
  console.log('Connection state:', state);
});
service.on('onIceConnectionStateChange', (state) => {
  console.log('ICE state:', state);
});
```

### 2. Проверка WebRTC API

```typescript
// Проверьте доступность API
if (service.isWebRTCAvailable()) {
  console.log('WebRTC API доступен');
} else {
  console.log('WebRTC API недоступен');
}
```

### 3. Валидация данных

```typescript
import { validateSignalingData } from '../utils/signaling';

const isValid = validateSignalingData(data);
if (!isValid) {
  console.error('Неверный формат данных сигналинга');
}
```

## Миграция с текущей реализации

### Шаг 1: Установка нативных библиотек

```bash
npm install react-native-webrtc
```

### Шаг 2: Обновление WebRTCService

Замените абстрактный интерфейс на конкретную реализацию.

### Шаг 3: Обновление компонентов

Замените веб-компоненты на нативные (RTCView).

### Шаг 4: Тестирование

Протестируйте на реальных устройствах.

## Поддержка

- [react-native-webrtc документация](https://github.com/react-native-webrtc/react-native-webrtc)
- [Expo WebRTC](https://docs.expo.dev/versions/latest/sdk/webrtc/)
- [WebRTC спецификация](https://webrtc.org/)

## Заключение

Созданная архитектура позволяет легко интегрироваться с различными реализациями WebRTC. Выберите подходящий вариант в зависимости от ваших требований:

- **Для быстрого прототипирования**: Используйте веб-версию
- **Для продакшена**: Интегрируйте react-native-webrtc
- **Для Expo**: Используйте expo-webrtc или Expo Dev Client
