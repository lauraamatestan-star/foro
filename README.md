# Foro Comunidad

Foro con **Angular** (web) + **Laravel** (API). Estructura simplificada para aprender: pocos archivos grandes en lugar de muchas carpetas.

## Arranque rápido

```powershell
.\scripts\start.ps1
```

- Web: http://127.0.0.1:4200  
- API: http://127.0.0.1:8000/api  

Demo: `demo@foro.test` / `password123` (admin → `/admin`)

### Frontend (3 archivos clave + pantallas)

```
frontend/src/app/
  foro.api.ts      # datos y API
  foro.ui.ts       # componentes compartidos
  pages/           # pantallas (.page.ts)
```

### Backend (6 controladores + rutas)

```
backend/routes/api.php
backend/app/Http/Controllers/
```

## Google OAuth

Variables en `backend/.env`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `FRONTEND_URL`.

## Producción

Vercel (frontend) + Render (backend). Ver variables en `.env.example` y despliegue anterior en commits/docs si lo necesitas.
