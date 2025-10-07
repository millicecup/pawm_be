# Physics Lab Backend

Backend API for the Physics Virtual Lab application.

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Set up environment variables:
Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

3. Start MongoDB (make sure MongoDB is installed and running)

4. Install MongoDB Community Edition:
   - Windows: Download from https://www.mongodb.com/try/download/community
   - macOS: `brew install mongodb-community`
   - Linux: Follow MongoDB official installation guide

5. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/stats` - Get user statistics
- `DELETE /api/users/account` - Delete user account

### Progress
- `POST /api/progress` - Save progress
- `GET /api/progress` - Get user progress
- `GET /api/progress/stats` - Get progress statistics
- `DELETE /api/progress/:id` - Delete progress entry

### Simulations
- `GET /api/simulations` - Get all simulations
- `GET /api/simulations/:id` - Get simulation by ID
- `POST /api/simulations/initialize` - Initialize default simulations (admin)

## Environment Variables

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `FRONTEND_URL` - Frontend URL for CORS

## Database Schema

### User
- name, email, password (hashed)
- role (student/teacher/admin)
- timestamps, last login

### Progress
- userId, simulationId, simulationName
- timeSpent, score, parameters, results
- achievements, completedAt

### Simulation
- simulationId, name, description
- category, difficulty, estimatedTime
- parameters, learning objectives
- materials, prerequisites

## Development

```bash
# Start development server with auto-reload
npm run dev

# Run tests
npm test

# Start production server
npm start
```