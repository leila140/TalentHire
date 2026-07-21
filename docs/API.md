# API Reference

Base URL: `http://localhost:5000/api`

All endpoints return JSON. Protected endpoints require `Authorization: Bearer <token>` header.

---

## Auth (`/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new account | No |
| POST | `/login` | Login (returns access + refresh tokens) | No |
| POST | `/logout` | Invalidate refresh token | Yes |
| POST | `/refresh` | Refresh access token | No (cookie) |
| POST | `/google` | Google OAuth login | No |
| POST | `/verify-email` | Verify email with token | No |
| POST | `/forgot-password` | Request password reset email | No |
| POST | `/reset-password` | Reset password with token | No |

**Rate limits:** Register/login/google: 20 req/15min. Password reset: 5 req/hour.

---

## Profile (`/profile`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get current user profile | Yes |
| PATCH | `/` | Update profile | Yes |
| GET | `/export-pdf` | Export own resume as PDF | Yes |
| GET | `/:userId/export-pdf` | Export user resume as PDF | Yes |

---

## Companies (`/companies`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Create company profile | Recruiter |
| GET | `/` | List all companies | No |
| GET | `/:id` | Get company by ID | No |
| PATCH | `/:id` | Update company | Owner |
| POST | `/:id/gallery` | Add gallery image | Owner |
| DELETE | `/:id/gallery/:imageId` | Remove gallery image | Owner |

---

## Jobs (`/jobs`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Create job posting | Recruiter |
| GET | `/` | List jobs (with filters/pagination) | No |
| GET | `/:id` | Get job details | No |
| PATCH | `/:id` | Update job | Owner |
| DELETE | `/:id` | Delete job | Owner |

---

## Applications (`/applications`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Apply to job | Candidate |
| GET | `/` | List applications | Yes |
| GET | `/:id` | Get application details | Yes |
| PATCH | `/:id/status` | Update application status | Recruiter |

---

## Interviews (`/interviews`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Schedule interview | Recruiter |
| GET | `/` | List interviews | Yes |
| GET | `/:id` | Get interview details | Yes |
| PATCH | `/:id` | Update interview | Recruiter |
| PATCH | `/:id/status` | Update interview status | Yes |

---

## Messages (`/messages`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/conversations` | List conversations (paginated) | Yes |
| POST | `/conversations/:id/messages` | Send message | Yes |
| GET | `/conversations/:id/messages` | Get messages (paginated) | Yes |

**Socket.io events:** `join_conversation`, `leave_conversation`, `send_message`, `receive_message`, `typing`, `stop_typing`

---

## Saved Jobs (`/saved-jobs`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/:jobId` | Save a job | Candidate |
| DELETE | `/:jobId` | Unsave a job | Candidate |
| GET | `/` | List saved jobs | Candidate |

---

## Upload (`/upload`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/avatar` | Upload avatar (Cloudinary) | Yes |
| POST | `/resume` | Upload resume (Cloudinary) | Yes |
| DELETE | `/avatar` | Delete avatar | Yes |
| DELETE | `/resume` | Delete resume | Yes |

---

## Notifications (`/notifications`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List notifications (paginated) | Yes |
| PATCH | `/:id/read` | Mark as read | Yes |
| PATCH | `/read-all` | Mark all as read | Yes |

---

## AI (`/ai`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/analyze-resume` | Analyze uploaded resume (PDF) | Yes |
| POST | `/match` | Match candidate to job | Yes |
| POST | `/interview-questions` | Generate interview questions | Yes |
| POST | `/cover-letter` | Generate cover letter | Yes |
| GET | `/recommended-jobs` | Get AI-recommended jobs | Candidate |

---

## Candidates (`/candidates`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List/search candidates | Recruiter |
| GET | `/:id` | Get candidate profile | Recruiter |

---

## Reports (`/reports`) — Admin only

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List reports | Admin |
| GET | `/:id` | Get report details | Admin |
| POST | `/` | Generate report | Admin |
| DELETE | `/:id` | Delete report | Admin |

---

## Activity (`/activity`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/me` | Get own activity logs | Yes |
| GET | `/` | List all activity logs | Admin |

---

## Admin (`/admin`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users` | List all users | Admin |
| GET | `/dashboard` | Admin dashboard stats | Admin |

---

## Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |

---

## Error Format

```json
{
  "success": false,
  "error": "Error message"
}
```

Standard HTTP status codes: 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 409 (conflict), 429 (rate limited), 500 (server error).
