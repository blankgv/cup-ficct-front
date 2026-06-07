# CUP-FICCT Frontend

Frontend del sistema CUP-FICCT (Next.js App Router + TypeScript) que consume la API Laravel.
Implementa el módulo de **Authentication**: login, recuperación de contraseña, cambio de
contraseña forzado, perfil, control de acceso por permisos (RBAC) y gestión de usuarios y roles.

## Stack

- Next.js (App Router) + React + TypeScript (modo estricto).
- Cliente HTTP central tipado con Axios (interceptores de token y refresh).
- Estado de autenticación con Zustand (sesión persistente + auto-refresh).
- Tailwind CSS.
- Docker (multi-stage, salida `standalone`).

## Variables de entorno

Toda la configuración vive en `.env` (no se versiona). Copiá `.env.example` y completá:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

`NEXT_PUBLIC_API_URL` es la URL base de la API e incluye el sufijo `/api`.

`BACKEND_INTERNAL_URL` (opcional) es la URL de la API vista **desde el servidor de
Next**, usada por el proxy de fotos (`/api/foto/...`). En local no hace falta. En
Docker, como el contenedor no resuelve `localhost`, conviene apuntarla al host, p.ej.
`http://host.docker.internal:8000/api`. La foto de perfil llega vía 302 a una URL
firmada de R2 sin CORS; el proxy la resuelve en el servidor y la sirve al mismo
origen para que se pueda usar como `src` de imagen.

## Desarrollo local

```bash
npm install
npm run dev
```

App en http://localhost:3000.

## Docker

```bash
docker compose up --build
```

Levanta el frontend en el puerto `3000` leyendo `.env`.

## Estructura

```
src/
  app/                 Rutas (App Router)
    login/             Inicio de sesión
    forgot-password/   Solicitud de recuperación
    reset-password/    Restablecimiento con token
    change-password/   Cambio de contraseña forzado
    (protected)/       Layout protegido + páginas con sesión
      dashboard/
      perfil/
      usuarios/        CRUD usuarios (permiso user.manage)
      roles/           CRUD roles + permisos (permiso role.manage)
  components/          UI y guardas (AuthProvider, Can, nav)
  hooks/              Hooks de autenticación
  lib/                Cliente HTTP, tipos y helpers de error
  services/           Llamadas a la API por dominio
  store/              Store de autenticación (Zustand)
```
