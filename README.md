# Auditorium Booking Backend

A modern, layered backend architecture built with **Express**, **MongoDB/Mongoose**, **Awilix (DI)**, and **TypeScript**.

## Setup & Installation

### 1. Install dependencies
```bash
npm install
```

### 2. Create `.env` file
```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/auditorium-booking
NODE_ENV=development
```
### 3. Run the server
```bash
# Development mode (with auto-reload)
npm run dev

# Production build
npm run build
npm start
```

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Awilix** - Dependency injection container
- **TypeScript** - Language
- **TSX** - TypeScript executor for development
- **CORS** - Cross-origin requests
