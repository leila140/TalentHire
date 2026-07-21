# Deployment

## Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- Cloudinary account (for file storage)
- OpenAI API key (optional, AI features have fallbacks)
- SMTP credentials (for emails)

## Environment Variables

Copy `server/.env.example` to `server/.env` and fill in all values.

Required:
- `MONGODB_URI` — MongoDB connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — Random strings for JWT signing
- `CLIENT_URL` — Frontend URL (e.g., `http://localhost:5173` in dev)

Optional but recommended:
- `CLOUDINARY_*` — For avatar/resume file uploads
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — For Google OAuth
- `SMTP_*` — For email sending (verification, password reset, etc.)
- `OPENAI_API_KEY` — For AI features

## Development

```bash
# Terminal 1: Backend
cd server
npm install
npm run dev          # Starts on port 5000

# Terminal 2: Frontend
cd client
npm install
npm run dev          # Starts on port 5173, proxies /api to :5000
```

## Production Build

```bash
# Build frontend
cd client
npm run build        # Output in dist/

# Build backend
cd server
npm run build        # Output in dist/

# Start server (serves built client from dist/ if configured)
cd server
npm start            # Runs dist/index.js
```

## Docker (Optional)

Create a `docker-compose.yml` for containerized deployment:

```yaml
version: "3.8"
services:
  server:
    build: ./server
    ports:
      - "5000:5000"
    env_file: ./server/.env
    depends_on:
      - mongodb

  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong, unique JWT secrets
- [ ] Configure CORS to only allow your production domain
- [ ] Enable MongoDB Atlas IP whitelisting
- [ ] Set up SSL/TLS (reverse proxy with nginx recommended)
- [ ] Configure rate limiting appropriate for production traffic
- [ ] Set up monitoring and logging (e.g., Sentry, PM2)
- [ ] Verify Cloudinary upload/delete endpoints work
- [ ] Test email delivery in production (check spam folder)
- [ ] Configure proper SMTP credentials (not Gmail for production)

## Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }

    location / {
        root /path/to/client/dist;
        try_files $uri $uri/ /index.html;
    }
}
```
