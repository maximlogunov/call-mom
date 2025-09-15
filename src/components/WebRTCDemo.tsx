// Демонстрационный компонент для WebRTC

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView,
  TextInput 
} from 'react-native';
import { useWebRTC } from '../hooks/useWebRTC';
import { 
  createSignalingPackage, 
  createAnswerPackage,
  createCompactString,
  parseCompactString 
} from '../utils/signaling';
import { copyToClipboard, readFromClipboard } from '../utils/clipboard';
import { RTCSessionDescriptionInit, RTCIceCandidateInit } from '../types/webrtc';

export const WebRTCDemo: React.FC = () => {
  const [isInitiator, setIsInitiator] = useState(false);
  const [signalingData, setSignalingData] = useState<string>('');
  const [inputData, setInputData] = useState<string>('');
  
  const {
    connectionState,
    iceConnectionState,
    localStream,
    remoteStream,
    isConnected,
    isConnecting,
    hasError,
    error,
    createConnection,
    getLocalStream,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    getIceCandidates,
    close,
  } = useWebRTC();

  // Обработка ошибок
  useEffect(() => {
    if (hasError && error) {
      Alert.alert('Ошибка WebRTC', error.message);
    }
  }, [hasError, error]);

  // Инициирование звонка
  const handleInitiateCall = async () => {
    try {
      setIsInitiator(true);
      
      // Создаем соединение
      await createConnection();
      
      // Получаем локальный медиапоток
      await getLocalStream();
      
      // Создаем офер
      const offer = await createOffer();
      
      // Ждем ICE кандидатов
      setTimeout(async () => {
        const iceCandidates = getIceCandidates();
        const packageData = createSignalingPackage(offer, iceCandidates);
        const compactString = createCompactString(packageData);
        
        setSignalingData(compactString);
        
        Alert.alert(
          'Данные для обмена',
          'Скопируйте эту строку и отправьте собеседнику:',
          [
            { text: 'OK' }
          ]
        );
      }, 2000);
      
    } catch (err) {
      console.error('Ошибка инициирования звонка:', err);
      Alert.alert('Ошибка', 'Не удалось инициировать звонок');
    }
  };

  // Принятие звонка
  const handleAcceptCall = async () => {
    try {
      if (!inputData.trim()) {
        Alert.alert('Ошибка', 'Введите данные от инициатора');
        return;
      }

      setIsInitiator(false);
      
      // Парсим данные
      const packageData = parseCompactString(inputData);
      if (!packageData || !packageData.offer) {
        Alert.alert('Ошибка', 'Неверный формат данных');
        return;
      }

      // Создаем соединение
      await createConnection();
      
      // Получаем локальный медиапоток
      await getLocalStream();
      
      // Устанавливаем удаленное описание
      const offer: RTCSessionDescriptionInit = {
        type: 'offer',
        sdp: packageData.offer,
      };
      await setRemoteDescription(offer);
      
      // Создаем ответ
      const answer = await createAnswer();
      
      // Ждем ICE кандидатов
      setTimeout(async () => {
        const iceCandidates = getIceCandidates();
        const answerPackage = createAnswerPackage(answer, iceCandidates);
        const compactString = createCompactString(answerPackage);
        
        setSignalingData(compactString);
        
        Alert.alert(
          'Ответ для инициатора',
          'Отправьте эту строку инициатору:',
          [
            { text: 'OK' }
          ]
        );
      }, 2000);
      
    } catch (err) {
      console.error('Ошибка принятия звонка:', err);
      Alert.alert('Ошибка', 'Не удалось принять звонок');
    }
  };

  // Завершение звонка
  const handleEndCall = async () => {
    try {
      await close();
      setSignalingData('');
      setInputData('');
      setIsInitiator(false);
    } catch (err) {
      console.error('Ошибка завершения звонка:', err);
    }
  };

  // Копирование данных в буфер обмена
  const handleCopyToClipboard = async () => {
    if (signalingData) {
      const success = await copyToClipboard(signalingData);
      if (success) {
        Alert.alert('Скопировано', 'Данные скопированы в буфер обмена');
      } else {
        Alert.alert('Ошибка', 'Не удалось скопировать данные');
      }
    }
  };

  // Вставка данных из буфера обмена
  const handlePasteFromClipboard = async () => {
    const clipboardText = await readFromClipboard();
    if (clipboardText) {
      setInputData(clipboardText);
      Alert.alert('Вставлено', 'Данные вставлены из буфера обмена');
    } else {
      Alert.alert('Ошибка', 'Не удалось прочитать данные из буфера обмена');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>WebRTC Demo - Call Mom</Text>
      
      {/* Статус соединения */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Статус соединения:</Text>
        <Text style={[styles.statusText, { color: isConnected ? 'green' : 'orange' }]}>
          {connectionState || 'Не подключено'}
        </Text>
        
        <Text style={styles.statusLabel}>ICE статус:</Text>
        <Text style={styles.statusText}>
          {iceConnectionState || 'Не определен'}
        </Text>
      </View>

      {/* Кнопки управления */}
      <View style={styles.buttonContainer}>
        {!isConnecting && !isConnected && (
          <>
            <TouchableOpacity 
              style={[styles.button, styles.initiateButton]} 
              onPress={handleInitiateCall}
            >
              <Text style={styles.buttonText}>Инициировать звонок</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.acceptButton]} 
              onPress={handleAcceptCall}
            >
              <Text style={styles.buttonText}>Принять звонок</Text>
            </TouchableOpacity>
          </>
        )}
        
        {(isConnecting || isConnected) && (
          <TouchableOpacity 
            style={[styles.button, styles.endButton]} 
            onPress={handleEndCall}
          >
            <Text style={styles.buttonText}>Завершить звонок</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Поле для ввода данных */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Введите данные от {isInitiator ? 'собеседника' : 'инициатора'}:
        </Text>
        <TextInput
          style={styles.textInput}
          value={inputData}
          onChangeText={setInputData}
          placeholder="Вставьте данные здесь..."
          multiline
          numberOfLines={4}
        />
        <TouchableOpacity 
          style={[styles.button, styles.pasteButton]} 
          onPress={handlePasteFromClipboard}
        >
          <Text style={styles.buttonText}>Вставить из буфера</Text>
        </TouchableOpacity>
      </View>

      {/* Отображение данных для обмена */}
      {signalingData && (
        <View style={styles.dataContainer}>
          <Text style={styles.dataLabel}>
            Данные для {isInitiator ? 'собеседника' : 'инициатора'}:
          </Text>
          <TextInput
            style={styles.dataInput}
            value={signalingData}
            editable={false}
            multiline
            numberOfLines={6}
          />
          <TouchableOpacity 
            style={[styles.button, styles.copyButton]} 
            onPress={handleCopyToClipboard}
          >
            <Text style={styles.buttonText}>Скопировать</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Информация о потоках */}
      <View style={styles.streamInfo}>
        <Text style={styles.streamLabel}>Локальный поток:</Text>
        <Text style={styles.streamText}>
          {localStream ? `Активен (${localStream.getTracks().length} треков)` : 'Не активен'}
        </Text>
        
        <Text style={styles.streamLabel}>Удаленный поток:</Text>
        <Text style={styles.streamText}>
          {remoteStream ? `Активен (${remoteStream.getTracks().length} треков)` : 'Не активен'}
        </Text>
      </View>

      {/* Инструкции */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Инструкции:</Text>
        <Text style={styles.instructionsText}>
          1. Нажмите "Инициировать звонок" на одном устройстве{'\n'}
          2. Скопируйте сгенерированные данные{'\n'}
          3. Отправьте данные собеседнику (мессенджер, email){'\n'}
          4. На втором устройстве вставьте данные и нажмите "Принять звонок"{'\n'}
          5. Скопируйте ответные данные и отправьте инициатору{'\n'}
          6. Инициатор вставляет ответные данные{'\n'}
          7. Соединение установлено!
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  initiateButton: {
    backgroundColor: '#4CAF50',
  },
  acceptButton: {
    backgroundColor: '#2196F3',
  },
  endButton: {
    backgroundColor: '#F44336',
  },
  copyButton: {
    backgroundColor: '#FF9800',
    marginTop: 10,
  },
  pasteButton: {
    backgroundColor: '#9C27B0',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  dataContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dataLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  dataInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    fontFamily: 'monospace',
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9',
  },
  streamInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streamLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  streamText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  instructions: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
