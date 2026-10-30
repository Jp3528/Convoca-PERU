# Búsqueda automática de convocatorias

El servidor consulta fuentes oficiales sin que el administrador pulse un botón y sin depender de visitas al sitio. Los hallazgos vigentes aparecen automáticamente en la portada y en `/descubiertas`, identificados como datos extraídos que requieren verificar las bases. Las fichas editoriales completas conservan su revisión humana.

## Frecuencia

- Local: `npm run setup:local` y `npm run dev`, o `npm run build` seguido de `npm run start:local`. El proceso inicia Next y comprueba cada minuto si corresponde buscar. Ejecuta al iniciar si no existe una ejecución reciente y después cada 60 minutos por defecto. El navegador puede estar cerrado; el equipo y el servidor necesitan seguir encendidos. `AUTO_IMPORT_INTERVAL_MINUTES` admite entre 15 y 1440 minutos.
- Vercel: `vercel.json` prepara una ejecución diaria a las 12:00 UTC, 07:00 de Lima. Hobby puede ejecutarla dentro de esa hora y admite frecuencia diaria; no se presupone un plan de pago. Es necesario desplegar, conectar Supabase, ejecutar las migraciones y configurar `CRON_SECRET` y `AUTO_IMPORT_ENABLED=true`. Este despliegue todavía está pendiente.
- No hay temporizadores en páginas públicas ni búsquedas por cada visitante. El panel solo actualiza el estado guardado cada 30 segundos.
- Si una fuente falla, las demás siguen consultándose. En local se intenta de nuevo en 15 minutos; en Vercel se espera al siguiente cron diario. El estado y los errores aparecen en la pestaña Importar.

## Fuentes y alcance

1. MTC, listado CAS: <https://portal.mtc.gob.pe/ofertaslaborales/CAS/frmConvocatoriaCAS.aspx>. Extrae referencia, puesto, entidad y periodo. El enlace lleva al listado porque las bases usan postbacks de ASP.NET.
2. ProInversión: <https://www.investinperu.pe/convocatorias-laborales/>. Lee los procesos externos marcados como vigentes en la primera página, con puesto, código, ubicación y fechas. Excluye concursos internos y plantillas repetidas de los modales. El enlace lleva a la convocatoria concreta. No recorre el archivo histórico ni descarga PDFs.

Solo se aceptan las URL fijas del registro de fuentes. Las URL proporcionadas por clientes no se consultan. No se ejecuta JavaScript remoto ni se siguen redirecciones. Se respetan las reglas Allow/Disallow del robots.txt y se detiene ante 429, errores de servidor o bloqueos de la página. Un robots.txt con respuesta 4xx distinta de 429 se considera no disponible conforme a RFC 9309, sección 2.3.1.3; esto no cambia el tratamiento de páginas de contenido que deniegan el acceso. Cada respuesta tiene un límite de 2 MB y 12 segundos de espera.

Las fuentes se procesan secuencialmente. Un bloqueo con vencimiento impide dos ejecuciones simultáneas; el resultado conserva próxima fecha, informes y errores. En local se usan escrituras atómicas y bloqueo de archivo. En Supabase, funciones SQL realizan la reserva y finalización atómicas. Una ejecución interrumpida puede recuperarse al vencer su reserva, sin duplicar los candidatos existentes.

## Hallazgos públicos

- Se muestran únicamente los campos de la fuente: puesto, entidad, referencia, lugar cuando figura, fechas y enlace oficial.
- El aviso exige verificar las bases. No se inventan requisitos, vacantes, modalidad o remuneración ni se declara revisión editorial automática.
- Los procesos vencidos o archivados dejan de aparecer. También se ocultan los retirados de una consulta completa y los que no se han consultado correctamente en 48 horas. Una búsqueda fallida no borra datos ni se presenta como una lista vacía correcta.
- Solo se exponen datos de candidatos procedentes de dominios y rutas autorizados; no se exponen correos de consultas, hashes, sesiones ni el estado interno de las ejecuciones.
- `/descubiertas` permite buscar por puesto, entidad o lugar y filtrar por fuente. No carga bloques publicitarios y tiene noindex. El contenido editorial original conserva sus rutas habituales.

## Revisión editorial opcional

La pestaña Importar permite completar una ficha a partir de un hallazgo, archivar o reabrir candidatos y adelantar una consulta manual con intervalo mínimo de cinco minutos. Los campos desconocidos quedan vacíos. La publicación editorial exige completar datos, una fecha vigente, un resumen propio y confirmar la revisión. Una consulta automática nunca sobrescribe una ficha editorial. La bandeja avisa si cambian los datos de la fuente.

La deduplicación utiliza fuente y referencia o identificador de plaza. El hash de campos detecta cambios. Un candidato archivado permanece archivado después de una nueva búsqueda; puede reabrirse desde el panel.

## Configuración y almacenamiento

- `CRON_SECRET`: clave privada de al menos 32 caracteres. `setup:local` la genera sin modificar el acceso editorial existente. Solo se envía entre el proceso local y su servidor, o entre el cron de Vercel y la ruta protegida.
- `AUTO_IMPORT_ENABLED=true`: activa las ejecuciones.
- Local: `.data/portal.json` conserva candidatos y publicaciones; `.data/import-automation.json` conserva ejecuciones. Ambos quedan fuera de Git y del paquete del servidor.
- Supabase: ejecutar `002_portal_documents.sql`, `003_import_candidates.sql` y `004_import_automation.sql`, en ese orden. RLS impide el acceso anónimo a las tablas; solo el servidor usa la clave de servicio.
- `npm run migrate:supabase` incluye candidatos y contenido real, sin muestras ni consultas privadas. La primera ejecución del cron crea su estado remoto; no se copian reservas locales.
- El panel lee hasta 1.000 registros y el catálogo automático hasta 500. Antes de ampliar a muchas fuentes se debe añadir paginación y una cola de trabajo.

Fuentes de la configuración: [Vercel Cron, protección y gestión](https://vercel.com/docs/cron-jobs/manage-cron-jobs), [frecuencia por plan](https://vercel.com/docs/cron-jobs/usage-and-pricing), [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html#section-2.3.1.3).

El scraping aporta hallazgos y enlaces; no activa AdSense ni garantiza su aprobación. La conexión real con Supabase y una ejecución automática remota en sus tablas se verificaron el 30 de octubre de 2026. La programación del cron en Vercel requiere todavía desplegar y configurar sus variables privadas.
