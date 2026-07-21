# TalentHire – AI Recruitment Platform

Plateforme de recrutement intelligente : analyse de CV par IA, matching
candidat/poste, génération de questions d'entretien et de lettres de
motivation.

## Structure

```
TalentHire/
├── client/     # React 19 + Vite + TypeScript + Tailwind
├── server/     # Node + Express + TypeScript + MongoDB
└── docs/
```

## Démarrage rapide

### 1. Backend

```bash
cd server
npm install
cp .env.example .env   # puis renseigner MONGODB_URI, JWT secrets, etc.
npm run dev
```

API disponible sur `http://localhost:5000`, health check sur `/health`.

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

App disponible sur `http://localhost:5173` (proxy `/api` → serveur sur le
port 5000).

## Étape actuelle : Setup ✅

- Arborescence client/server conforme au cahier des charges
- Express configuré (helmet, cors, rate limiting, cookies, morgan)
- Connexion MongoDB (Mongoose) prête
- Socket.io initialisé (connexion de base)
- Auth : register/login/logout fonctionnels (JWT access + refresh en
  cookies httpOnly, bcrypt pour le hash des mots de passe)
- React + Router + TanStack Query + Tailwind configurés
- Page d'accueil de test

## Prochaines étapes

1. Authentification complète (email verification, forgot/reset password,
   Google login, refresh token endpoint, guard de rôles côté client)
2. Profils Candidate & Company
3. Jobs & Applications (CRUD, filtres, pagination)
4. Module IA (analyse CV, matching, questions d'entretien, lettre de
   motivation) via OpenAI API
5. Messagerie temps réel (Socket.io, typing indicator, seen status)
6. Dashboards par rôle (candidate / recruiter / admin)
