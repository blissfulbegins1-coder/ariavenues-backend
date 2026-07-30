# Auditorium Booking Backend

## Running Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Ensure `.env` file exists with required variables:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/auditorium-booking
JWT_SECRET=your_secret_key
CORS_ORIGINS=http://localhost:5173
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Production Build & Start
```bash
npm run build
npm start
```
