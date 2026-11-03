# Asistente y fichas detalladas · 3 de noviembre de 2026

## Funciones

`/asistente-cv` permite elegir una convocatoria pública o introducir un perfil personalizado, leer un PDF con texto o un TXT y pegar texto manualmente. El CV se procesa en memoria del navegador: no se envía al servidor, no se guarda en Supabase ni en localStorage. El botón Borrar todo y la recarga descartan el contenido de la pantalla. Los TXT descargados permanecen en el dispositivo del usuario.

La puntuación muestra su rúbrica: contacto, secciones, fechas, extensión, legibilidad del texto y coincidencia literal de términos del puesto. No reproduce un ATS ni verifica títulos, años de experiencia, identidad, elegibilidad o resultado de selección. El borrador reorganiza secciones completas y conserva los hechos y las líneas originales; no inventa logros ni cambia la atribución de funciones a empleadores.

PDF/TXT: hasta 2 MB, 8 páginas y 24,000 caracteres. El PDF se lee en un worker local con límite de tiempo; no se renderizan páginas, no se ejecutan acciones del documento ni se realiza OCR. Los archivos escaneados, protegidos o incompatibles requieren pegar el texto.

## Orientación opcional con Gemini

La API `/api/cv/coach` acepta exclusivamente `{jobKey, adult: true}`. Resuelve el perfil público en el servidor. Rechaza campos adicionales, CV, texto personalizado y URLs. Gemini recibe solo el título, entidad, tipo, requisitos y resumen públicos. No recibe el archivo, texto del CV, nombre ni contacto del postulante. No se habilitan herramientas, navegación ni funciones del modelo.

Esta separación responde a las condiciones de la [cuota gratuita de Gemini](https://ai.google.dev/gemini-api/terms): no se deben enviar datos personales, confidenciales o sensibles. La interfaz informa sobre el proveedor y requiere confirmar mayoría de edad. No hay anuncios en el asistente.

Variables privadas (ver `.env.example`): GEMINI_API_KEY, GEMINI_MODEL, GEMINI_CV_ENABLED y GEMINI_DAILY_LIMIT. No deben usar el prefijo NEXT_PUBLIC_. Límite por conexión: dos consultas por hora. Límite compartido: veinte por ventana de 24 horas por defecto, como máximo cincuenta. En Vercel, los contadores usan la función atómica existente de Supabase. El SDK hace un solo intento por petición y tiene un tiempo máximo de 25 segundos. Las respuestas deben ajustarse al esquema y los errores no incluyen mensajes privados del proveedor.

Pruebas reales del 3 de noviembre: inicialmente gemini-3.1-flash-lite respondió HTTP 503 y agotó tiempos de espera. En la comprobación posterior respondió correctamente tanto desde el SDK como a través de `/api/cv/coach` con los requisitos reales de Asesor Legal: HTTP 200 y respuesta estructurada validada. El proveedor todavía puede tener errores transitorios; se informa del fallo y el análisis local continúa disponible. Los fallos, respuestas inválidas y límites se verificaron además con un proveedor simulado. Con autorización del propietario se guardó GEMINI_API_KEY como Secret exclusivo de producción de convoca-peru en Vercel, junto con el modelo, la activación y el límite compartido de veinte consultas. No se cambió la facturación del proveedor.

## Fichas y extracción

Las rutas `/descubiertas/[id]` muestran resumen, destinatarios, requisitos, funciones, sueldo, vacantes, fechas, contrato, canal y documentos oficiales. Las fichas editoriales usan el mismo diseño. Se distinguen períodos abiertos, próximos, cerrados, retirados o desactualizados. Los datos no identificados se declaran expresamente y el costo de postulación se separa de la remuneración y del uso gratuito del portal.

El enriquecimiento actual extrae los perfiles de ProInversión. MTC mantiene la información de su listado y sus enlaces; no se inventan datos cuando la fuente no ofrece un detalle compatible. Solo se solicitan páginas y documentos de la lista de dominios/rutas permitidos, sin redirecciones y respetando robots. HTML: 2 MB; PDF: 3 MB, 12 páginas, 80,000 caracteres. La lectura tiene un tiempo limitado; por ejecución se intentan como máximo ocho perfiles, priorizando los menos recientes y con presupuesto de tiempo para el lote. Un fallo conserva la última extracción compatible, cuya antigüedad se controla antes de publicarla.

La versión 2 del extractor corrige miles separados por espacios: el perfil CAS 011-2026 de Asesor Legal indica S/ 13 364.19. También conserva el bloque completo de experiencia cuando el PDF no usa subtítulos General/Específica. Las extracciones anteriores no se exponen como detalle nuevo hasta renovarse. Los enlaces se mantienen estables para compartir incluso cuando finaliza el plazo, mostrando su estado.

El buscador incluye formación y requisitos públicos en las coincidencias de texto: “Derecho” encuentra Asesor Legal aunque la carrera no aparezca en el título. No se indexan campos privados ni se infiere modalidad. El control de compartir incluye además un botón directo para copiar el enlace público.

## Verificación

- `npm test`: fechas/filtros, fuentes/robots, duplicados, privacidad, conservación de texto, esquema y límites de IA.
- `npm run test:backend`: servidor aislado 3061 con LOCAL_DATA_DIR=.data-tests y Supabase desactivado; autenticación, CSRF, concurrencia, edición, archivo y consultas privadas.
- `npm run test:security`: esa misma instancia; cabeceras, secretos inaccesibles, acceso editorial/cron, JSON limitado por bytes reales aun sin Content-Length, bloqueo de CV y de orígenes externos, frecuencia y ausencia de anuncios en el asistente.
- Compilación, TypeScript, ESLint y npm audit. Inspección de paquetes públicos y trazas para excluir claves, .env.local, api key.txt, .local-admin.txt y .data.

Estas pruebas cubren los controles implementados; no sustituyen una auditoría externa de penetración ni verifican todas las configuraciones futuras del alojamiento.
