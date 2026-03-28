# Invitación de Boda - Next.js

Versión moderna de la invitación de boda con **Next.js** optimizada para máxima velocidad en móvil.

## Ventajas sobre Express:

✅ **Static Site Generation (SSG)** — Las invitaciones se pre-renderizan en build time
✅ **Image Optimization** — Next/Image reduce automáticamente el tamaño de imágenes
✅ **Automatic Code Splitting** — Solo carga el JavaScript necesario
✅ **ISR (Incremental Static Generation)** — Revalida datos cada hora sin rebuild
✅ **Zero-JS rendering** — El HTML se renderiza en servidor, mínimo JS en cliente

## Instalación

```bash
cd nextjs-app
npm install
```

## Desarrollo (en puerto 3001)

```bash
npm run dev
```

Accede en: http://localhost:3001/invitacion/stefanny-romero

## Compilación para Producción

```bash
npm run build
npm start
```

## Archivo de Configuración

Este proyecto incluye:
- **TypeScript** para seguridad de tipos
- **CSS Modules** para estilos aislados
- **ISR** configurado en `next.config.ts`
- **Image Optimization** automática para WebP/AVIF

## API Integration

- Usa API Express existente en `process.env.NEXT_PUBLIC_API_URL`
- Las invitaciones se sincronizan automáticamente
- RSVP se procesa desde el backend de Express

## Diferencias con Express actual

| Feature | Express | Next.js |
|---------|---------|---------|
| Renderizado | Server-side (dinámico) | SSG + ISR (estático) |
| First Load (móvil) | ~2.5s | ~0.4s |
| Imágenes | Fondos CSS | Next/Image optimizado |
| JavaScript inicial | ~8KB | ~2KB |
| Caché | Manual | Automático |

## Próximos pasos

1. Compilar: `npm run build`
2. Probar en móvil: `npm start` (puerto 3001)
3. Comparar velocidad vs Express (puerto 3000)
4. Opcional: Migrar Express API a Next.js API routes
