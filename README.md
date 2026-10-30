# Convoca Perú

Portal de convocatorias y orientación laboral con Next.js 16, React 19 y TypeScript. El diseño incluye una identidad propia, búsqueda por filtros, favoritos y guías.

## Funcionalidad implementada

- Panel editorial protegido por contraseña y cookie de sesión HTTP-only.
- Crear, editar, publicar y archivar convocatorias y guías; las publicaciones aparecen en la web desde el servidor.
- Validación de fuente HTTPS, fecha, requisitos y revisión editorial; control de versiones para evitar sobreescrituras.
- Consultas guardadas en una bandeja privada, con referencias y estados de atención.
- Persistencia local en el servidor y conector REST a Supabase para Vercel.
- Favoritos en el navegador y filtros combinados por carrera, región, sector, modalidad y estado.
- Sitemap dinámico, control de indexación y páginas informativas.
- Bloques de AdSense preparados, ads.txt generado con un ID válido y vista previa local sin solicitudes publicitarias.
- Una primera guía original publicada y conservada en content/initial-articles.json.
- Scraping automático del MTC y ProInversión: ejecución cada hora en local y cron diario preparado para Vercel. Deduplicación, detección de cambios y sección pública de hallazgos vigentes que requieren verificar las bases. Consulta [el funcionamiento y límites](docs/IMPORTADOR.md).

El catálogo local conserva convocatorias y guías de muestra identificadas. En Supabase no se cargan muestras automáticamente. Una casilla de revisión editorial representa la revisión que debe realizar el administrador; no verifica automáticamente una oferta en Internet.

## Ejecutar localmente

Requisitos: Node.js 22 y npm.

```powershell
npm ci
npm run setup:local
npm run dev
```

Abre http://127.0.0.1:3060/ y el panel en /admin. Las credenciales generadas están en el archivo privado .local-admin.txt. El comando de configuración conserva un acceso ya creado y no rota su contraseña.

Para servir la compilación optimizada con el mismo proceso automático: `npm run build` y `npm run start:local`. El proceso busca al iniciar y comprueba cada minuto si toca la siguiente ejecución. Funciona con el navegador cerrado mientras el servidor y el equipo estén encendidos. Abrir la web no dispara búsquedas externas.

Los datos locales se guardan en .data/portal.json, con escritura atómica y bloqueo entre procesos. .data/, .data-tests/, .env.local y .local-admin.txt están ignorados por Git y excluidos del paquete del servidor para Vercel.

## Comprobaciones

```powershell
npm run lint
npm test
npm run build
```

Para las pruebas HTTP del backend, después de compilar, abre una terminal separada:

```powershell
$env:LOCAL_DATA_DIR='.data-tests'
$env:SUPABASE_URL=''
$env:SUPABASE_SERVICE_ROLE_KEY=''
node .\node_modules\next\dist\bin\next start --hostname 127.0.0.1 --port 3061
```

En otra terminal ejecuta npm run test:backend. La prueba exige el puerto 3061 y almacenamiento local de pruebas; crea y archiva registros ficticios sin tocar el catálogo principal ni Supabase.

## Vercel y AdSense

Consulta [la guía de publicación y monetización](docs/VERCEL-ADSENSE.md). La migración está en [database/002_portal_documents.sql](database/002_portal_documents.sql).

Para los borradores del importador ejecuta también [database/003_import_candidates.sql](database/003_import_candidates.sql).
La ejecución periódica en Vercel requiere además [database/004_import_automation.sql](database/004_import_automation.sql), `AUTO_IMPORT_ENABLED=true` y una variable privada `CRON_SECRET` de al menos 32 caracteres. El cron de producción está en vercel.json; todavía no se ha desplegado.

La conexión real con Supabase se verificó el 30 de octubre de 2026: el portal local usa las tablas remotas y la búsqueda automática guarda allí su estado y resultados. La clave está solo en .env.local. Vercel requiere configurar también esas variables privadas al desplegar; nunca coloques una clave secreta en NEXT_PUBLIC.

En una base nueva, database/005_supabase_initial_setup.sql consolida las migraciones 002, 003 y 004. Para copiar contenido, `npm run migrate:supabase` simula y `npm run migrate:supabase:apply` aplica la copia.

Los anuncios reales están desactivados. Para activarlos se necesitan una cuenta, un sitio aprobado, los identificadores de bloques y el consentimiento configurado en AdSense. Los indicadores del panel son comprobaciones técnicas, no una aprobación de Google.

## Estructura

- src/lib/portal-store.ts: persistencia y catálogo público.
- src/lib/editor-auth.ts: acceso, sesiones y límites de solicitudes.
- src/lib/portal-validation.ts: validación editorial.
- src/app/api/: publicación y recepción de consultas.
- src/components/EditorDashboard.tsx: gestión de contenido, bandeja y preparación para monetizar.
- content/initial-articles.json: contenido editorial original inicial.
- docs/ASSETS.md: créditos visuales.

## English

A job and internship portal with an authenticated editorial dashboard, server-persisted publishing, a private contact inbox, browser favorites and original guides. Local storage uses an atomic JSON repository; the Vercel connector uses Supabase REST and server-only credentials. AdSense slots and ads.txt are prepared but live ads remain disabled until an approved publisher account, ad units and consent configuration are provided. Sample listings remain labeled and are excluded from the production migration.
