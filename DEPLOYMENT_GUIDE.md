# Backend Deployment Configuration

## 🚀 RECOMMENDED: Vercel Serverless (Meets All Requirements)

### Why Vercel for Backend?
- ✅ **Serverless Functions** - Meets requirement untuk "layanan Serverless"
- ✅ **Same platform** as frontend (consistency)
- ✅ **Auto-scaling** and global edge network
- ✅ **Free tier** with generous limits
- ✅ **Zero configuration** needed

### Deploy to Vercel Serverless:

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy from backend folder**:
```bash
cd backend
vercel --prod
```

3. **Set Environment Variables** (in Vercel Dashboard):
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/physics-lab
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
FRONTEND_URL=https://fisika-simulator.vercel.app
```

4. **Your backend will be live at**: `https://your-backend.vercel.app`

---

## Alternative Hosting Options

## Railway Deployment
railway.toml
```toml
[build]
  builder = "nixpacks"

[deploy]
  startCommand = "npm start"
  healthcheckPath = "/api/health"
  healthcheckTimeout = 300
  restartPolicyType = "ON_FAILURE"
  restartPolicyMaxRetries = 10

[variables]
  NODE_ENV = "production"
  PORT = "8080"
```

## Render Deployment
render.yaml
```yaml
services:
  - type: web
    name: physics-lab-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        fromService: 
          type: web
          property: port
      - key: MONGODB_URI
        sync: false  # Set in Render dashboard
      - key: JWT_SECRET
        generateValue: true
      - key: SESSION_SECRET
        generateValue: true
```

## Heroku Deployment
Procfile:
```
web: npm start
```

## Environment Variables (Set in hosting platform dashboard):
- NODE_ENV=production
- PORT=8080 (or auto-assigned)
- MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/physics-lab
- JWT_SECRET=your-jwt-secret-here
- SESSION_SECRET=your-session-secret-here
- FRONTEND_URL=https://fisika-simulator.vercel.app
- GOOGLE_CLIENT_ID=your-google-client-id
- GOOGLE_CLIENT_SECRET=your-google-client-secret
- GITHUB_CLIENT_ID=your-github-client-id
- GITHUB_CLIENT_SECRET=your-github-client-secret