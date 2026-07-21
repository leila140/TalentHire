# Architecture

## Overview

TalentHire is a full-stack AI recruitment platform with a React frontend and Node.js/Express backend communicating via REST API and Socket.io for real-time messaging.

```
TalentHire/
├── client/          # React 19 SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # Shadcn UI primitives (Button, Card, Input, Dialog, etc.)
│   │   │   └── ...           # Feature components
│   │   ├── pages/            # Route pages (Home, Jobs, Profile, Dashboard, etc.)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities (cn.ts from Shadcn)
│   │   ├── utils/            # API client, helpers
│   │   ├── types/            # TypeScript interfaces
│   │   ├── i18n/             # i18next config + translations
│   │   └── routes/           # React Router config (AppRouter.tsx)
│   └── index.html
├── server/          # Express API
│   ├── src/
│   │   ├── config/           # env.ts, email.ts, emailTemplates.ts
│   │   ├── models/           # Mongoose schemas (User, Job, Application, etc.)
│   │   ├── controllers/      # Request handlers
│   │   ├── routes/           # Express routers
│   │   ├── services/         # Business logic (ai.service.ts, etc.)
│   │   ├── middlewares/      # Auth, error handling, upload, rate limiting
│   │   ├── validators/       # Zod schemas for input validation
│   │   ├── utils/            # Helpers (pdfExport.ts, cloudinary.ts, etc.)
│   │   └── types/            # TypeScript type definitions
│   └── tsconfig.json
└── docs/            # Documentation
```

## Tech Stack

### Frontend
- **React 19** — UI framework
- **Vite** — Build tool and dev server
- **TypeScript** — Type safety
- **Tailwind CSS v3** — Utility-first styling + Shadcn UI
- **React Router v7** — Client-side routing
- **TanStack Query** — Server state management and caching
- **Zustand** — Client state management
- **React Hook Form + Zod** — Form handling and validation
- **Framer Motion** — Animations
- **i18next** — Internationalization
- **Socket.io Client** — Real-time messaging
- **Axios** — HTTP client

### Backend
- **Node.js + Express** — API framework
- **TypeScript** — Type safety
- **MongoDB + Mongoose** — Database and ODM
- **JWT** — Authentication (access + refresh tokens in httpOnly cookies)
- **bcrypt** — Password hashing
- **Zod** — Input validation
- **Cloudinary** — File storage (avatars, resumes)
- **Socket.io** — Real-time messaging
- **OpenAI API** — AI features (resume analysis, matching, questions, cover letters)
- **pdf-parse** — PDF text extraction
- **pdfkit** — PDF generation (resume export)
- **Nodemailer** — Email sending
- **Multer** — File upload handling

## Authentication Flow

```
1. User registers → password hashed with bcrypt → JWT access token (15min) + refresh token (7d) set as httpOnly cookies
2. Login → same token flow
3. Google OAuth → Google verifies → backend creates/finds user → sets JWT cookies
4. Protected routes → middleware verifies access token from cookie
5. Token expires → /auth/refresh endpoint issues new access token using refresh token cookie
6. Logout → refresh token invalidated in DB
```

## Roles & Permissions

| Feature | Candidate | Recruiter | Admin |
|---------|-----------|-----------|-------|
| Job browsing | ✓ | ✓ | ✓ |
| Job posting | ✗ | ✓ | ✓ |
| Apply to jobs | ✓ | ✗ | ✗ |
| Schedule interviews | ✗ | ✓ | ✓ |
| View candidates | ✗ | ✓ | ✓ |
| AI resume analysis | ✓ | ✓ | ✓ |
| Real-time messaging | ✓ | ✓ | ✓ |
| Activity logs | Own | Own | All |
| Reports | ✗ | ✗ | ✓ |
| User management | ✗ | ✗ | ✓ |

## AI Module

The AI service (`ai.service.ts`) provides:
- **Resume Analysis** — Extracts text from PDF resume, sends to OpenAI for structured analysis (skills, experience, education, recommendations)
- **Candidate-Job Matching** — Score and analysis of candidate fit for a specific job
- **Interview Questions** — AI-generated questions tailored to candidate profile and job requirements
- **Cover Letter Generation** — Personalized cover letter for a specific job application
- **Recommended Jobs** — AI-based job recommendations using candidate profile and job embeddings (falls back to algorithmic matching if OpenAI unavailable)

All AI endpoints have algorithmic fallbacks that work without an OpenAI API key.

## Real-Time Messaging

Socket.io powers the messaging system:
- Users join conversation rooms
- Messages are persisted to MongoDB then broadcast
- Typing indicators via `typing`/`stop_typing` events
- REST API for conversation listing and message history with pagination

## Data Models

Core Mongoose models: `User`, `Company`, `Job`, `Application`, `Interview`, `Message`, `Conversation`, `Notification`, `SavedJob`, `Report`, `ActivityLog`, `Skill`

## State Management

- **Zustand stores:** `authStore` (user, tokens, login/logout actions), `chatStore` (conversations, messages, socket state), `themeStore` (dark/light mode), `notificationStore` (notifications)
- **TanStack Query:** Server data caching for jobs, applications, profiles, etc.
