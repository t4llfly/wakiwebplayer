# 🎵 Waki Web Player

> Современная веб-панель управления для Discord-музыкального бота [**Waki**](https://github.com/t4llfly/waki).  
> Создана для уютных музыкальных сессий с друзьями: мгновенная синхронизация, управление очередью и живой виджет голосового канала.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwind-css)
![WebSocket](https://img.shields.io/badge/WebSocket-Event--Driven-4CAF50?logo=websocket)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Возможности

- 🔄 **Real-Time Sync** — состояние плеера обновляется мгновенно через WebSocket (Event-Driven архитектура, без polling)
- 📊 **Live Progress Bar** — клиентская интерполяция позиции трека для плавной анимации без нагрузки на сеть
- 🎛 **Queue Management** — Drag & Drop сортировка, удаление треков, очистка очереди с подтверждением
- 👥 **Voice Presence** — виджет участников голосового канала с аватарками, никами и статусами (мут/наушники)
- 🔐 **Discord Auth** — безопасная авторизация через NextAuth.js (Discord Provider)
- 🎨 **Modern UI** — Next.js App Router, Tailwind CSS, shadcn/ui, адаптивный и минималистичный дизайн
- ⚡ **Optimistic UI & Feedback** — мгновенная реакция на команды с toast-уведомлениями (Sonner)
- 🛡 **Strict TypeScript & React 19 Ready** — полная типизация, мемоизация коллбэков, соблюдение правил чистого рендера

---

## 🛠 Стек технологий

| Категория          | Технологии                                                                 |
|--------------------|----------------------------------------------------------------------------|
| **Framework**      | Next.js 16 (App Router)                                                 |
| **Language**       | TypeScript 5+                                                              |
| **Styling**        | Tailwind CSS, shadcn/ui, Framer Motion (опционально)                       |
| **State & Sync**   | `react-use-websocket`, Custom Hooks, `useRef`/`useMemo`/`useCallback`      |
| **Drag & Drop**    | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`                 |
| **Auth**           | NextAuth.js v5 (Discord Provider)                                          |
| **Icons**          | Lucide React                                                               |
| **Notifications**  | Sonner                                                                     |

---

## 📦 Установка и запуск

> ⚠️ **Важно:** Этот репозиторий содержит только **фронтенд**. Для работы панели требуется запущенный бэкенд (Discord-бот Waki с включённым `WebserverCog` на `aiohttp`).

```bash
# 1. Клонируйте репозиторий
git clone https://github.com/t4llfly/wakimusicplayer.git
cd wakimusicplayer

# 2. Установите зависимости
npm install

# 3. Создайте файл переменных окружения
cp .env.example .env.local

# 4. Заполните .env.local (см. раздел ниже)

# 5. Запустите dev-сервер
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

---

## 🔑 Переменные окружения

Создайте файл `.env.local` в корне проекта:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-random-string-here

# Discord OAuth2 App (https://discord.com/developers/applications)
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

# Подключение к бэкенду бота
NEXT_PUBLIC_WS_URL=wss://waki.tallfly.me/bot/ws
NEXT_PUBLIC_API_URL=https://waki.tallfly.me
```

> 💡 Для локальной разработки бэкенд должен разрешать CORS для `http://localhost:3000`. В продакшене замените URL на ваш домен.

---

## 🔌 Взаимодействие с бэкендом (WebSocket Protocol)

Панель подключается к эндпоинту `/bot/ws` и обменивается JSON-пакетами.

### 📥 События от бота → фронтенд
```typescript
{ "event": "INITIAL_STATE",   "data": PlayerState }
{ "event": "PLAYER_STATE",    "data": PlayerState }
{ "event": "POSITION_UPDATE", "data": { "position_ms": number } }
{ "event": "COMMAND_RESULT",  "request_id": string, "data": CommandResult }
```

### 📤 Команды от фронтенда → бот
```typescript
{ "action": "play",         "payload": { "url": string, "user_id": string }, "request_id": string }
{ "action": "skip",         "payload": { "user_id": string }, "request_id": string }
{ "action": "pause",        "request_id": string }
{ "action": "resume",       "request_id": string }
{ "action": "stop",         "request_id": string }
{ "action": "volume",       "payload": { "level": number }, "request_id": string }
{ "action": "remove_track", "payload": { "index": number }, "request_id": string }
{ "action": "clear_queue",  "request_id": string }
{ "action": "move_track",   "payload": { "from_index": number, "to_index": number }, "request_id": string }
```

Все типы строго описаны в `lib/bot-types.ts`. Фронтенд использует дискриминированные union-типы для полной типобезопасности команд и ответов.

---

## 📁 Структура проекта

```
├── app/                    # Next.js App Router (страницы, layout, auth API)
├── components/             # UI-компоненты
│   ├── WakiPlayer.tsx      # Основной плеер
│   ├── VoiceMembers.tsx    # Виджет участников войса
│   ├── QueueManager.tsx    # Управление очередью (DnD)
│   └── ui/                 # shadcn/ui компоненты
├── hooks/                  # Кастомные React-хуки
│   └── useBotSocket.ts     # WebSocket-клиент + интерполяция прогресса
├── lib/                    # Утилиты и типы
│   ├── bot-types.ts        # Строгая типизация протокола
│   └── utils.ts            # cn() и хелперы
├── public/                 # Статические файлы
├── .env.local              # Переменные окружения (не коммитится)
└── next.config.ts          # Конфигурация Next.js
```

---

## 💡 Особенности архитектуры

- **Event-Driven Sync:** Бот отправляет обновления только при изменении состояния. Нет ежесекундного спама JSON.
- **Клиентская интерполяция:** Позиция трека вычисляется на клиенте (`server_position + elapsed_time`) с синхронизацией каждые 2 секунды через `POSITION_UPDATE`. Это даёт плавный прогресс-бар без нагрузки на сеть.
- **React 19 Compliance:** Все обработчики WebSocket мемоизированы через `useCallback`/`useMemo`. Отсутствуют impure renders и каскадные `setState` внутри `useEffect`.
- **Optimistic UI:** Команды отправляются с `request_id`. Фронтенд мгновенно показывает toast-уведомление при получении `COMMAND_RESULT`.
- **CORS & Dev Proxy:** Для локальной разработки рекомендуется настроить `rewrites` в `next.config.ts` или разрешить `http://localhost:3000` в `cors_middleware` бэкенда.

---

## 📜 Лицензия и контакты

Сделано [**вафелькой**](https://tallfly.me) с ❤️. 

Распространяется под лицензией **MIT**. Свободно используйте, изменяйте и делитесь!

---
