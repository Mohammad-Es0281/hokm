# 🎮 بازی حکم - Telegram Web App

بازی چند‌نفره حکم با قابلیت بازی آنلاین و زمان واقعی برای Telegram Web App.

## 📋 فهرست مطالب

- [ویژگی‌ها](#ویژگی‌ها)
- [تکنولوژی‌های استفاده شده](#تکنولوژی‌های-استفاده-شده)
- [پیش‌نیازها](#پیش‌نیازها)
- [نصب و راه‌اندازی](#نصب-و-راه‌اندازی)
- [متغیرهای محیطی](#متغیرهای-محیطی)
- [اجرای پروژه](#اجرای-پروژه)
- [قوانین بازی](#قوانین-بازی)
- [ساختار پروژه](#ساختار-پروژه)
- [مثال‌های JSON](#مثال‌های-json)

## ✨ ویژگی‌ها

### قابلیت‌های اصلی
- 🎯 حالت‌های بازی 2، 3 و 4 نفره
- 🔄 بازی آنلاین با WebSocket
- ⏱️ تایمر سمت سرور با قابلیت بازی خودکار
- 🎴 توزیع کارت‌های صحیح (5-4-4 برای 4 نفره، 5-4-4-4 برای 3 نفره، 5-4-4-5-4-4 برای 2 نفره)
- 👑 انتخاب حکم توسط رهبر پس از دیدن 5 کارت اول
- 🔐 امنیت و انصاف با shuffle رمزنگاری شده و commit-reveal
- 📊 ذخیره کامل تاریخچه برای Replay
- 📱 رابط کاربری فارسی و واکنش‌گرا
- 🎮 یکپارچگی کامل با Telegram Web App

### قوانین بازی
- **دست 52 کارتی استاندارد** (♠️ ♥️ ♦️ ♣️)
- **رتبه‌بندی:** A > K > Q > J > 10 > ... > 2
- **دنبال کردن خال:** اگر بازیکن کارت خال را داشته باشد، باید از آن پیروی کند
- **برنده تک:**
    - اگر حکمی بازی نشده → بالاترین کارت خال برنده است
    - اگر حکمی بازی شده → بالاترین حکم برنده است
- **امتیازدهی:**
    - **4 نفره (2v2):** اولین تیمی که 7 تک بگیرد برنده است. **کُت (7-0)** یک دست اضافی می‌دهد
    - **3 نفره (انفرادی):** اولین کسی که 7 تک بگیرد برنده است
    - **2 نفره (H2H):** اولین کسی که 13 تک بگیرد برنده است

### قابلیت‌های تایمر
- تایمر سمت سرور برای تمام بازیکنان
- بازی خودکار هوشمند در صورت تمام شدن زمان:
    1. اگر بازیکن خال حکم دارد → پایین‌ترین کارت خال
    2. وگرنه اگر کارت غیر حکمی دارد → پایین‌ترین غیر حکمی
    3. وگرنه → پایین‌ترین حکمی
- پیام فارسی: «زمان شما تمام شد — یک کارت به‌صورت خودکار بازی شد»

## 🛠 تکنولوژی‌های استفاده شده

### Backend
- **NestJS** - فریمورک Node.js برای ساختار پروژه
- **TypeScript** - تایپ استاتیک
- **PostgreSQL** - پایگاه داده اصلی
- **Redis** - کش و مدیریت اتصالات
- **Socket.IO** - ارتباط زمان واقعی
- **TypeORM** - ORM برای PostgreSQL

### Frontend
- **React 18** - کتابخانه UI
- **TypeScript** - تایپ استاتیک
- **Vite** - بیلد تول
- **Socket.IO Client** - ارتباط WebSocket
- **Telegram Web App SDK** - یکپارچگی تلگرام

### DevOps
- **Docker & Docker Compose** - کانتینرسازی
- **Nginx** - وب سرور برای فرانت‌اند

## 📦 پیش‌نیازها

- **Node.js** >= 20.x
- **npm** >= 9.x
- **Docker** >= 24.x
- **Docker Compose** >= 2.x
- **حساب Telegram Bot** (برای دریافت `BOT_TOKEN`)

## 🚀 نصب و راه‌اندازی

### 1. کلون کردن مخزن

```bash
git clone <repository-url>
cd hokm-game
```

### 2. ایجاد ساختار پروژه (Windows)

```bash
create-structure.bat
```

این اسکریپت تمام پوشه‌ها و فایل‌های خالی پروژه را ایجاد می‌کند.

### 3. تنظیم متغیرهای محیطی

فایل `.env.example` را کپی کرده و به `.env` تغییر نام دهید:

```bash
cp .env.example .env
```

سپس مقادیر را ویرایش کنید (مشاهده بخش [متغیرهای محیطی](#متغیرهای-محیطی))

### 4. دریافت Telegram Bot Token

1. به [@BotFather](https://t.me/BotFather) در تلگرام پیام دهید
2. دستور `/newbot` را ارسال کنید
3. دستورات را دنبال کرده و نام و username برای ربات خود انتخاب کنید
4. `BOT_TOKEN` دریافتی را در فایل `.env` قرار دهید

## 🔧 متغیرهای محیطی

### پایگاه داده (PostgreSQL)

```env
POSTGRES_DB=hokm_db
POSTGRES_USER=hokm_user
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_PORT=5432
```

### Backend

```env
NODE_ENV=production
BACKEND_PORT=3000
JWT_SECRET=your_jwt_secret_here_change_this_in_production
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
```

### Redis

```env
REDIS_PORT=6379
```

### Frontend

```env
FRONTEND_PORT=5173
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

### CORS

```env
CORS_ORIGIN=http://localhost:5173
```

## 🏃 اجرای پروژه

### حالت Development (بدون Docker)

#### Backend

```bash
cd backend
npm install
npm run start:dev
```

Backend روی `http://localhost:3000` اجرا می‌شود.

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend روی `http://localhost:5173` اجرا می‌شود.

### حالت Production (با Docker)

```bash
docker-compose up --build
```

سرویس‌ها:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

### توقف سرویس‌ها

```bash
docker-compose down
```

### پاک کردن داده‌ها

```bash
docker-compose down -v
```

## 🎲 قوانین بازی

### توزیع کارت‌ها

#### 4 نفره (تیمی 2v2)
- **الگوی توزیع:** 5-4-4
- هر بازیکن 13 کارت دریافت می‌کند
- پس از 5 کارت اول، حکم انتخاب می‌شود
- سپس دو دور 4 کارتی دیگر توزیع می‌شود

#### 3 نفره (انفرادی)
- **دست:** 51 کارت (کارت ♦️2 حذف می‌شود)
- **الگوی توزیع:** 5-4-4-4
- هر بازیکن 17 کارت دریافت می‌کند
- حکم پس از 5 کارت اول انتخاب می‌شود

#### 2 نفره (رو در رو)
- هر بازیکن 26 کارت دریافت می‌کند
- **الگوی توزیع:** 5-4-4-5-4-4
- حکم پس از 5 کارت اول انتخاب می‌شود

### انتخاب حکم

- **چه کسی انتخاب می‌کند؟** بازیکن **اول (رهبر)** پس از دیدن 5 کارت اول
- **دست اول:** رهبر اولیه به صورت **تصادفی** انتخاب می‌شود
- **دست‌های بعدی:** **برنده دست قبلی** رهبر جدید می‌شود

### Revoke (عدم پیروی از خال)

سرور حرکت‌ها را اعتبارسنجی می‌کند تا از حرکت‌های غیرقانونی جلوگیری کند.

اگر revoke تشخیص داده شود:
- **تک فعلی** به طرف/بازیکن غیر متخلف داده می‌شود
- در صورت **revoke دوم در همان دست**، متخلف دست را از دست می‌دهد

## 📁 ساختار پروژه

```
hokm-game/
├── backend/               # Backend NestJS
│   ├── src/
│   │   ├── auth/         # احراز هویت تلگرام
│   │   ├── users/        # مدیریت کاربران
│   │   ├── rooms/        # مدیریت اتاق‌ها
│   │   ├── game/         # منطق بازی
│   │   ├── timer/        # سرویس تایمر
│   │   └── replay/       # تاریخچه و replay
│   └── package.json
├── frontend/             # Frontend React
│   ├── src/
│   │   ├── components/  # کامپوننت‌های UI
│   │   ├── pages/       # صفحات اصلی
│   │   ├── services/    # سرویس‌های API
│   │   ├── hooks/       # React hooks
│   │   └── utils/       # توابع کمکی
│   └── package.json
├── docker-compose.yml    # تنظیمات Docker
└── README.md            # این فایل
```

## 📊 مثال‌های JSON

### مثال یک Trick (4 کارت + برنده)

```json
{
  "trickNumber": 3,
  "leadPlayerId": "player_1",
  "leadSuit": "hearts",
  "winnerId": "player_2",
  "winningCardId": "hearts_A",
  "playedCards": [
    {
      "playerId": "player_1",
      "playerName": "علی",
      "suit": "hearts",
      "rank": "K",
      "cardId": "hearts_K",
      "playOrder": 0,
      "isAutoPlayed": false,
      "playedAt": "2025-01-15T10:30:00Z"
    },
    {
      "playerId": "player_2",
      "playerName": "محمد",
      "suit": "hearts",
      "rank": "A",
      "cardId": "hearts_A",
      "playOrder": 1,
      "isAutoPlayed": false,
      "playedAt": "2025-01-15T10:30:05Z"
    },
    {
      "playerId": "player_3",
      "playerName": "حسین",
      "suit": "hearts",
      "rank": "5",
      "cardId": "hearts_5",
      "playOrder": 2,
      "isAutoPlayed": false,
      "playedAt": "2025-01-15T10:30:10Z"
    },
    {
      "playerId": "player_4",
      "playerName": "رضا",
      "suit": "spades",
      "rank": "2",
      "cardId": "spades_2",
      "playOrder": 3,
      "isAutoPlayed": true,
      "playedAt": "2025-01-15T10:30:25Z"
    }
  ]
}
```

### مثال خلاصه یک Hand (امتیازها، حکم، ترتیب تک‌ها)

```json
{
  "handId": "hand_uuid_123",
  "handNumber": 1,
  "trumpSuit": "spades",
  "trumpSelectedBy": "player_1",
  "leaderId": "player_1",
  "dealPattern": [5, 4, 4],
  "scores": {
    "team_0": 7,
    "team_1": 6
  },
  "winnerId": "team_0",
  "isKot": false,
  "startedAt": "2025-01-15T10:00:00Z",
  "completedAt": "2025-01-15T10:35:00Z",
  "tricks": [
    {
      "trickNumber": 1,
      "leadPlayerId": "player_1",
      "leadSuit": "hearts",
      "winnerId": "player_2",
      "playedCards": [
        {
          "playerId": "player_1",
          "suit": "hearts",
          "rank": "K",
          "cardId": "hearts_K",
          "isAutoPlayed": false
        },
        {
          "playerId": "player_2",
          "suit": "hearts",
          "rank": "A",
          "cardId": "hearts_A",
          "isAutoPlayed": false
        },
        {
          "playerId": "player_3",
          "suit": "hearts",
          "rank": "Q",
          "cardId": "hearts_Q",
          "isAutoPlayed": false
        },
        {
          "playerId": "player_4",
          "suit": "hearts",
          "rank": "J",
          "cardId": "hearts_J",
          "isAutoPlayed": false
        }
      ]
    }
  ]
}
```

## 🔒 امنیت و انصاف

- **Shuffle رمزنگاری شده:** استفاده از `crypto.randomBytes()` برای shuffle دست
- **Commit-Reveal:** هش دست در ابتدای هر hand ثبت و در پایان نمایش داده می‌شود
- **بلاک اتصالات چندگانه:** کاربر نمی‌تواند چند بار به یک اتاق وصل شود
- **اعتبارسنجی سمت سرور:** تمام حرکت‌ها در سرور بررسی می‌شوند
- **احراز هویت تلگرام:** اعتبارسنجی `initData` با امضای HMAC

## 🤝 مشارکت

مشارکت‌ها خوش‌آمد هستند! لطفاً:

1. پروژه را Fork کنید
2. یک branch جدید بسازید (`git checkout -b feature/amazing-feature`)
3. تغییرات خود را commit کنید (`git commit -m 'Add amazing feature'`)
4. به branch خود push کنید (`git push origin feature/amazing-feature`)
5. یک Pull Request باز کنید

## 📝 لایسنس

این پروژه تحت لایسنس MIT منتشر شده است.

## 🐛 گزارش مشکلات

اگر مشکلی پیدا کردید یا پیشنهادی دارید، لطفاً یک Issue باز کنید.

## 📞 تماس

برای سوالات یا پشتیبانی، می‌توانید با ما تماس بگیرید.

---

**ساخته شده با ❤️ برای جامعه تلگرام**