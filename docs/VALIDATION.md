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
