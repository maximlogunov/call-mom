// Утилиты для работы с буфером обмена

import * as Clipboard from 'expo-clipboard';

/**
 * Копирует текст в буфер обмена
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch (error) {
    console.error('Ошибка копирования в буфер обмена:', error);
    return false;
  }
}

/**
 * Читает текст из буфера обмена
 */
export async function readFromClipboard(): Promise<string | null> {
  try {
    const text = await Clipboard.getStringAsync();
    return text;
  } catch (error) {
    console.error('Ошибка чтения из буфера обмена:', error);
    return null;
  }
}

/**
 * Проверяет доступность буфера обмена
 */
export function isClipboardAvailable(): boolean {
  return true; // expo-clipboard is always available in Expo
}
