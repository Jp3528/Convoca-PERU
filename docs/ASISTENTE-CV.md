# Asistente y fichas detalladas · 3 de noviembre de 2026

## Funciones

`/asistente-cv` permite elegir una convocatoria pública o introducir un perfil personalizado, leer un PDF con texto o un TXT y pegar texto manualmente. El CV se procesa en memoria del navegador: no se envía al servidor, no se guarda en Supabase ni en localStorage. El botón Borrar todo y la recarga descartan el contenido de la pantalla. Los PDF y TXT descargados permanecen en el dispositivo del usuario.

La exportación PDF conserva el borrador en una columna A4, con texto seleccionable, fuente Inter incrustada y numeración. Se genera en el dispositivo al pulsar Descargar CV en PDF. No consume otra preparación ni una consulta a Gemini. Si un carácter no está representado en la fuente, muestra un aviso y conserva la alternativa TXT. El generador limita el resultado a 30 páginas y el texto a 24 000 caracteres.

La puntuación muestra su rúbrica: contacto, secciones, fechas, extensión, legibilidad del texto y coincidencia literal de términos del puesto. No reproduce un ATS ni verifica títulos, años de experiencia, identidad, elegibilidad o resultado de selección. El borrador reorganiza secciones completas y conserva los hechos y las líneas originales; no inventa logros ni cambia la atribución de funciones a empleadores.

PDF/TXT: hasta 2 MB, 8 páginas y 24,000 caracteres. El PDF se lee en un worker local con límite de tiempo; no se renderizan páginas, no se ejecutan acciones del documento ni se realiza OCR. Los archivos escaneados, protegidos o incompatibles requieren pegar el texto.

## Orientación opcional con Gemini

La API `/api/cv/coach` acepta exclusivamente `{jobKey, adult: true}`. Resuelve el perfil público en el servidor. Rechaza campos adicionales, CV, texto personalizado y URLs. Gemini recibe solo el título, entidad, tipo, requisitos y resumen públicos. No recibe el archivo, texto del CV, nombre ni contacto del postulante. No se habilitan herramientas, navegación ni funciones del modelo.

Esta separación responde a las condiciones de la [cuota gratuita de Gemini](https://ai.google.dev/gemini-api/terms): no se deben enviar datos personales, confidenciales o sensibles. La interfaz informa sobre el proveedor y requiere confirmar mayoría de edad. No hay anuncios en el asistente.

Si la IA no responde o se agota una cuota, la pantalla muestra una guía local con los requisitos públicos y pasos de preparación. También puede abrirse directamente con “Ver guía del perfil sin usar IA”. Se identifica como guía local, no como contenido generado por Gemini; no utiliza el CV ni inventa cualificaciones. Así la preparación puede continuar sin depender de la disponibilidad del proveedor.

La preparación local tiene un cupo de dos por día y navegador, con reinicio a medianoche en Lima. El navegador guarda únicamente la fecha y el contador. Gemini tiene un cupo independiente de dos consultas por conexión cada 24 horas.

Variables privadas (ver `.env.example`): GEMINI_API_KEY, GEMINI_MODEL, GEMINI_CV_ENABLED y GEMINI_DAILY_LIMIT. No deben usar el prefijo NEXT_PUBLIC_. Límite compartido: veinte llamadas al proveedor por ventana de 24 horas por defecto, como máximo cincuenta. En Vercel, los contadores usan la función atómica existente de Supabase. Cada intento del SDK dura como máximo 12 segundos, sin reintentos internos. La ruta permite un único reintento ante 503, 504 o timeout; vuelve a consumir el contador global antes de llamar al modelo. No reintenta respuestas inválidas, credenciales rechazadas ni cuotas agotadas. Las respuestas deben ajustarse al esquema y los errores no incluyen mensajes privados del proveedor.

Pruebas reales del 3 de noviembre: inicialmente gemini-3.1-flash-lite respondió HTTP 503 y agotó tiempos de espera. En la comprobación posterior respondió correctamente tanto desde el SDK como a través de `/api/cv/coach` con los requisitos reales de Asesor Legal: HTTP 200 y respuesta estructurada validada. El proveedor todavía puede tener errores transitorios; se informa del fallo y el análisis local continúa disponible. Los fallos, respuestas inválidas y límites se verificaron además con un proveedor simulado. Con autorización del propietario se guardó GEMINI_API_KEY como Secret exclusivo de producción de convoca-peru en Vercel, junto con el modelo, la activación y el límite compartido de veinte consultas. No se cambió la facturación del proveedor.

## Fichas y extracción

Las rutas `/descubiertas/[id]` muestran resumen, destinatarios, requisitos, funciones, sueldo, vacantes, fechas, contrato, canal y documentos oficiales. Las fichas editoriales usan el mismo diseño. Se distinguen períodos abiertos, próximos, cerrados, retirados o desactualizados. Los datos no identificados se declaran expresamente y el costo de postulación se separa de la remuneración y del uso gratuito del portal.

El enriquecimiento extrae perfiles de ProInversión y OSIPTEL. MTC mantiene la información de su listado y sus enlaces. OSIPTEL consulta el listado CAS vigente y obtiene las fechas exclusivamente de la fila de postulación del cronograma PDF, con validación de referencia. Si no puede validar todo el listado, conserva sus registros anteriores. Se limita a doce perfiles y un presupuesto de 25 segundos entre lecturas. Solo se solicitan páginas y documentos de la lista de dominios/rutas permitidos, sin redirecciones y respetando robots. HTML: 2 MB; PDF: 3 MB, 12 páginas, 80,000 caracteres. ProInversión intenta como máximo ocho perfiles por ejecución, priorizando los menos recientes y con un presupuesto de tiempo para el lote. La antigüedad de las extracciones se controla antes de publicarlas.

La versión 2 del extractor corrige miles separados por espacios: el perfil CAS 011-2026 de Asesor Legal indica S/ 13 364.19. También conserva el bloque completo de experiencia cuando el PDF no usa subtítulos General/Específica. Las extracciones anteriores no se exponen como detalle nuevo hasta renovarse. Los enlaces se mantienen estables para compartir incluso cuando finaliza el plazo, mostrando su estado.

El buscador incluye formación y requisitos públicos en las coincidencias de texto: “Derecho” encuentra Asesor Legal aunque la carrera no aparezca en el título. No se indexan campos privados ni se infiere modalidad. El control de compartir incluye además un botón directo para copiar el enlace público.

## Verificación

- `npm test`: fechas/filtros, fuentes/robots, duplicados, privacidad, conservación de texto, esquema y límites de IA.
- `npm run test:backend`: servidor aislado 3061 con LOCAL_DATA_DIR=.data-tests y Supabase desactivado; autenticación, CSRF, concurrencia, edición, archivo y consultas privadas.
- `npm run test:security`: esa misma instancia; cabeceras, secretos inaccesibles, acceso editorial/cron, JSON limitado por bytes reales aun sin Content-Length, bloqueo de CV y de orígenes externos, frecuencia y ausencia de anuncios en el asistente.
- Compilación, TypeScript, ESLint y npm audit. Inspección de paquetes públicos y trazas para excluir claves, .env.local, api key.txt, .local-admin.txt y .data.

Estas pruebas cubren los controles implementados; no sustituyen una auditoría externa de penetración ni verifican todas las configuraciones futuras del alojamiento.
