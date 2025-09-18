# AGENTS.md

## 🎯 Общая цель проекта

Создать мобильное приложение **Call Mom** на **React Native (Expo, TypeScript)** для P2P видеозвонков **без серверов**, с использованием **WebRTC внутри WebView**.
Приложение должно быть максимально простым: список контактов, профиль, добавление контактов через deep links, звонки напрямую (offer/answer) и inline-редактирование.

---

## 🛠️ Общие правила разработки

1. **TypeScript only**

   * Все файлы писать на TypeScript (`.ts`, `.tsx`).
   * Использовать строгую типизацию.

2. **Expo Managed Workflow**

   * Не использовать bare workflow и нативные модули.
   * Для WebRTC использовать встроенный HTML/JS клиент внутри **WebView**.

3. **Архитектура проекта**

   * `screens/` — экраны приложения
   * `components/` — UI и вспомогательные компоненты
   * `storage/` — работа с AsyncStorage
   * `utils/` — вспомогательные функции
   * `assets/` — иконки/ресурсы
   * `README.md`, `AGENTS.md` — документация

4. **Стиль кода**

   * Функциональные компоненты и React Hooks.
   * Избегать дублирования, использовать константы.
   * Писать комментарии (JSDoc для каждого нового файла).
   * Использовать `async/await`, не `then/catch`.

---

## 📱 Интерфейс и UX

* **Хедер (Header)**

  * Слева: `Call Mom` (текст)
  * Справа: иконка профиля (переход на экран профиля)

* **Экраны**

  1. **Contacts List**

     * Список контактов (аватар с инициалами, имя, chevron).
     * Пустой список → сообщение: “No contacts yet. Share your profile to add.”

  2. **Profile Screen**

     * Поле ввода имени (сохранение в AsyncStorage).
     * Кнопка **“Share my contact”** — генерирует deep link вида `callmom://addContact?...` и открывает Share Sheet.

  3. **Contact Detail**

     * Хедер с именем + иконка редактирования (inline TextInput).
     * Внизу: зелёная круглая кнопка звонка (иконка `phone`).

  4. **Incoming Call Modal**

     * Имя звонящего.
     * Две кнопки: Accept (зелёная), Decline (красная).

  5. **In-Call Overlay**

     * Видео собеседника на весь экран.
     * Локальное видео маленьким кружком вверху справа.
     * Внизу — красная кнопка “End Call”.
     * Опционально: кнопка переключения камеры.

* **Цвета**

  * Зелёный звонка: `#10B981`
  * Красный завершения: `#EF4444`
  * Текст: почти чёрный `#0F172A`
  * Фон: `#FFFFFF` / `#F7F7F8`

---

## 🔗 Deep Links (callmom://)

* **Добавление контакта**

  ```
  callmom://addContact?d=<base64(JSON)>
  ```

  JSON:

  ```json
  { "id": "<uuid>", "name": "John Doe", "createdAt": "<ISO>" }
  ```

* **Исходящий звонок (offer)**

  ```
  callmom://incomingCall?from=<base64(name+id)>&sdp=<base64(offerSdp)>
  ```

* **Ответ на звонок (answer)**

  ```
  callmom://callAnswer?from=<base64(name+id)>&sdp=<base64(answerSdp)>
  ```

---

## 💾 Данные

* **Profile**

  ```ts
  { id: string, name: string }
  ```

* **Contact**

  ```ts
  { id: string, name: string, createdAt: string, raw: string }
  ```

* **Хранение**

  * В `AsyncStorage` (profile.ts, contacts.ts).

---

## 📹 WebRTC через WebView

* Встроенный HTML + JS клиент, выполняющий:

  * `getUserMedia({ video: { facingMode: 'user' }, audio: true })`
  * `RTCPeerConnection` c STUN: `stun:stun.l.google.com:19302`
  * Сбор ICE-кандидатов → дождаться `iceGatheringState = complete` → отправить SDP через `postMessage`.

* **Протокол сообщений RN ↔ WebView**

  * RN → WebView:

    * `{ type: 'createOffer' }`
    * `{ type: 'setRemoteOffer', sdp }`
    * `{ type: 'setRemoteAnswer', sdp }`
    * `{ type: 'hangup' }`
    * `{ type: 'switchCamera' }`

  * WebView → RN:

    * `{ type: 'offer', sdp }`
    * `{ type: 'answer', sdp }`
    * `{ type: 'connected' }`
    * `{ type: 'error', message }`

---

## ⚠️ Ошибки и ограничения

* Если ICE-кандидаты не собрались → сообщение:
  *“Direct connection failed. Try same Wi-Fi or another network.”*
* При ошибках WebRTC показывать пользователю Toast/Alert.
* Возможные проблемы с очень длинными SDP → предусмотреть копирование/вставку вручную или через QR.
* TURN-сервера не используем (чтобы остаться полностью P2P).

---

## ✅ Acceptance Criteria

* Все экраны реализованы по дизайну.
* Deep links корректно добавляют контакты и инициируют звонки.
* Видеозвонок устанавливается при обмене offer/answer ссылками.
* Завершение звонка корректно освобождает ресурсы.
* Ошибки отображаются пользователю.
* Код полностью совместим с Expo Managed workflow.