# Environment Variables

## Server (`server/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `CLIENT_URL` | Yes | — | Frontend URL for CORS and email links |
| `MONGODB_URI` | Yes | — | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Yes | — | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Yes | — | Secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRES` | No | `15m` | Access token expiry |
| `JWT_REFRESH_EXPIRES` | No | `7d` | Refresh token expiry |
| `CLOUDINARY_CLOUD_NAME` | No | — | Cloudinary cloud name (for file uploads) |
| `CLOUDINARY_API_KEY` | No | — | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | — | Cloudinary API secret |
| `GOOGLE_CLIENT_ID` | No | — | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | — | Google OAuth client secret |
| `SMTP_HOST` | No | `smtp.gmail.com` | SMTP server host |
| `SMTP_PORT` | No | `587` | SMTP server port |
| `SMTP_USER` | No | — | SMTP username/email |
| `SMTP_PASS` | No | — | SMTP password |
| `OPENAI_API_KEY` | No | — | OpenAI API key (AI features have fallbacks without it) |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | OpenAI model to use |

## Client (`client/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | `http://localhost:5000/api` | Backend API base URL |
| `VITE_WS_URL` | No | `http://localhost:5000` | Socket.io server URL |

## Notes

- Variables prefixed with `VITE_` are exposed to the client bundle
- AI features (resume analysis, matching, interview questions, cover letters) will use algorithmic fallbacks if `OPENAI_API_KEY` is not set
- File uploads (avatar, resume) will fail if Cloudinary credentials are not configured
- Emails will only be logged to console in development mode (not sent via SMTP)
