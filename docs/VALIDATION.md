# Validación local y Supabase · 30 de octubre de 2026

- ESLint, TypeScript, compilación y pruebas de búsqueda.
- Pruebas de validación editorial, estados, fechas inválidas, URL de la fuente y activación condicionada de anuncios.
- Instancia HTTP aislada en 3061 con .data-tests: acceso protegido, rechazo de solicitudes de otro origen, creación, publicación, edición, conflicto de versiones, archivo y guías.
- Recepción de consultas con referencia, bandeja privada y cambio a atendida.
- Comprobación de que el correo de una consulta no aparece en el HTML público.
- Cinco borradores simultáneos conservados sin pérdida de datos.
- AdSense sin configurar: ads.txt no declara un editor inventado y no se carga el script de anuncios.
- Navegador: acceso editorial y publicación de la primera guía original, comprobada en su página pública.
- Importador: formato HTML del MTC, conteo de filas, fechas imposibles, robots.txt, fuentes cerradas a URLs arbitrarias, deduplicación, cambios, archivo persistente e inserciones concurrentes.
- HTTP: importación sin sesión rechazada, protección de origen, enlace a ficha editorial sin duplicados, hash antiguo rechazado, procedencia conservada y control de revisiones al archivar.
- Consulta real del MTC: ocho candidatos guardados como borradores privados, todos con cierre el 27/10/2026 y marcados como vencidos. No se publicaron automáticamente.
- Navegador: filtros de vigencia, formulario con campos desconocidos vacíos y diseño sin desbordamiento en móvil y escritorio.
- Next.js actualizado a 16.4.3; auditoría de dependencias sin vulnerabilidades reportadas.
- Automatización: autenticación del cron, una sola ejecución ante llamadas simultáneas, intervalo respetado, fecha diaria de Vercel y recuperación por fuente fallida.
- ProInversión: fechas numéricas y meses en español, exclusión de procesos internos, validación de enlaces oficiales y eliminación de plantillas duplicadas.
- Arranque real con npm run start:local: búsqueda automática sin pulsar botones. Resultado: MTC 8 procesos vencidos; ProInversión 10 con plazo vigente. Próxima búsqueda guardada para una hora después.
- Hallazgos públicos: solo campos de convocatorias, sin correos privados ni reservas; retirada de vencidos, archivados, eliminados de la fuente o sin consulta reciente en 48 horas.
- Búsqueda pública por puesto y filtro de fuente, incluida la pantalla vacía de MTC sin plazos vigentes.

Las credenciales de desarrollo, los registros privados y los datos de prueba están ignorados por Git y excluidos del paquete del servidor. La publicidad real sigue pendiente de una cuenta y aprobación de AdSense.

Supabase comprobado con el proyecto convoca-peru: tres tablas con RLS; 19 registros migrados sin muestras ni mensajes privados; lectura del servidor con HTTP 200; acceso editorial con HTTP 200 y proveedor supabase. Primera búsqueda en Supabase completada con éxito: MTC 8 procesos vencidos y ProInversión 10 hallazgos, de los cuales 3 vencieron el día anterior; la página pública muestra los 7 restantes. Reserva y finalización del trabajo y límite de acceso se comprobaron en las funciones SQL reales.

Compatibilidad de claves comprobada: sb_secret_ solo en apikey; JWT service_role con Authorization: Bearer. Pruebas, lint y compilación aprobados.

Consulta de permisos en el proyecto real: las tres tablas tienen RLS y carecen de SELECT para anon y authenticated. service_role puede leer publicaciones y ejecuciones; el límite de solicitudes se consume mediante su función SECURITY DEFINER, sin SELECT directo sobre la tabla de límites. La clave privada no aparece en el paquete del navegador ni en los archivos trazados del servidor.

La instancia principal se mantiene en http://127.0.0.1:3060/.

## Producción en Vercel

Publicado el 30 de octubre de 2026 en https://convoca-peru.vercel.app, desde la rama main de Jp3528/Convoca-PERU. Cinco variables Secret y nueve de configuración, solo en producción. Funciones en gru1 (São Paulo).

- Despliegue Ready; páginas de inicio, hallazgos, catálogo, guía original, contacto y acceso editorial con HTTP 200.
- Inicio de sesión con HTTP 200 y cookie Secure. Lectura autenticada: proveedor supabase, 19 registros y cero muestras.
- Estado automático habilitado, programador vercel e intervalo diario. Vercel muestra /api/cron/import habilitado con 0 12 * * * (07:00–07:59 de Lima en Hobby).
- Cron sin autorización: HTTP 401. Con autorización: disponibilidad HTTP 200 y llamada anticipada omitida como not_due, respetando la próxima ejecución guardada. La primera ejecución programada queda para el día siguiente; no se afirma haber observado todavía esa invocación diaria.
- Consulta de ProInversión ejecutada desde el servidor de producción: HTTP 200, diez procesos, cero duplicados nuevos, tres vencidos y siete hallazgos públicos. La lectura de las fuentes MTC y ProInversión también se había validado en el trabajador local contra Supabase.
- Anuncios desactivados, sin script publicitario. /ads.txt devuelve HTTP 404 mientras no exista un editor válido.
- El trabajador periódico local se detuvo para que la programación quede a cargo de Vercel. La vista en 3060 continúa disponible con la automatización local desactivada en ese proceso.

Pruebas visuales: [hallazgos publicados](produccion-hallazgos.png) y [cron registrado](produccion-cron.png).
