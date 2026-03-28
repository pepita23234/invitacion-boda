# Invitacion digital de boda

Aplicacion web full-stack para crear invitados con URL unica y recopilar confirmaciones RSVP.

## Tecnologias

- Frontend: HTML, CSS y JavaScript vanilla
- Backend: Node.js con Express
- Base de datos: MySQL 8+ con migraciones SQL automaticas

## Estructura

```text
.
|-- public/
|   |-- admin.html
|   |-- css/
|   |   |-- styles.css
|   |   `-- invitation.css
|   `-- js/
|       |-- admin.js
|       `-- invitation.js
|-- src/
|   |-- config/
|   |   `-- db.js
|   |-- controllers/
|   |   |-- guestController.js
|   |   `-- rsvpController.js
|   |-- migrations/
|   |   `-- 001_create_guests_table.sql
|   |-- routes/
|   |   |-- apiRoutes.js
|   |   `-- viewRoutes.js
|   |-- services/
|   |   `-- guestService.js
|   |-- utils/
|   |   `-- slug.js
|   |-- views/
|   |   `-- invitationTemplate.js
|   `-- app.js
|-- .env.example
|-- package.json
`-- server.js
```

## Instalacion

1. Instala dependencias:

```bash
npm install
```

2. Crea tu archivo de entorno:

```bash
copy .env.example .env
```

3. Asegura que MySQL este ejecutandose y que el usuario configurado tenga permisos para crear base de datos.

Configuracion sugerida (pedida):

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=invitacion_boda
```

4. Ejecuta en desarrollo:

```bash
npm run dev
```

Al iniciar, el sistema crea la base de datos (si no existe) y aplica migraciones SQL automaticamente.

5. Abre el panel en:

- http://localhost:3000/admin

## Endpoints

- POST /api/invitados
  - body: { "fullName": "Juan Perez" }
- GET /api/invitados
- GET /api/invitados/:slug
- POST /api/rsvp
  - body: { "slug": "juan-perez", "response": "confirmed" }

- GET /invitacion/:slug

## Notas

- El slug se genera automaticamente y evita colisiones (ejemplo: juan-perez-2).
- Se valida nombre duplicado.
- RSVP guarda confirmed o declined y fecha de respuesta.
- El panel de admin muestra URL y QR por invitado.
- Las migraciones se registran en la tabla `schema_migrations`.
