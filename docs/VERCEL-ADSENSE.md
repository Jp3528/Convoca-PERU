# Publicar Convoca Perú en Vercel y preparar AdSense

## Estado actual

El portal local está conectado al proyecto convoca-peru de Supabase desde el 30 de octubre de 2026. Se crearon las tres tablas con RLS, se copiaron 19 registros reales (una guía original y 18 hallazgos) y se verificó una búsqueda automática guardada en Supabase. Las muestras y consultas privadas locales se excluyeron. El despliegue y las variables de Vercel, y la cuenta de AdSense, siguen pendientes.

## 1. Crear la base de datos

1. Crea un proyecto en Supabase.
2. Ejecuta database/002_portal_documents.sql, database/003_import_candidates.sql y database/004_import_automation.sql, en ese orden. Incluyen el panel, la bandeja de importación y el estado de las ejecuciones automáticas.
   En una base nueva puedes ejecutar solo database/005_supabase_initial_setup.sql como alternativa consolidada. No ejecutes ambas alternativas.
3. Guarda la URL del proyecto y una clave privada del servidor en SUPABASE_SERVICE_ROLE_KEY. Admite la clave actual sb_secret_ o la antigua service_role. El navegador público no recibe esta clave. El adaptador envía sb_secret_ solamente en apikey y reserva Authorization: Bearer para las claves JWT antiguas.

La migración crea las publicaciones, la bandeja privada y el límite de solicitudes. Las tablas tienen RLS y no conceden acceso a los roles anónimo o autenticado: el servidor valida la sesión editorial antes de gestionar contenido.

## 2. Configurar Vercel

Conecta el repositorio cuando se decida publicar estos cambios. Configura:

| Variable                  | Uso                                                                   |
| ------------------------- | --------------------------------------------------------------------- |
| NEXT_PUBLIC_SITE_URL      | URL HTTPS definitiva del sitio                                        |
| SUPABASE_URL              | URL del proyecto Supabase                                             |
| SUPABASE_SERVICE_ROLE_KEY | Clave privada del servidor                                            |
| ADMIN_EMAIL               | Correo del acceso editorial                                           |
| ADMIN_PASSWORD_HASH       | Hash generado por setup:local, sin incluir la contraseña en el código |
| SESSION_SECRET            | Secreto privado de sesión, de al menos 32 caracteres                  |
| CRON_SECRET               | Secreto privado del cron, de al menos 32 caracteres                   |
| AUTO_IMPORT_ENABLED       | true para activar las búsquedas del cron                             |
| PORTAL_DEMO_MODE          | false en el sitio público                                             |
| SITE_INDEXABLE            | false durante la preparación; true cuando exista contenido real listo |

Los valores privados se generan en .env.local para la prueba local. No se sube ese archivo ni .local-admin.txt. Si se cambia la contraseña del acceso, también se puede cambiar SESSION_SECRET para invalidar las sesiones anteriores.

El sistema de archivos de Vercel no se utiliza como almacenamiento permanente. Si faltan las variables de Supabase, las escrituras se rechazan y el panel indica que la base necesita configurarse.

## 3. Llevar el contenido real a Supabase

Añade las claves privadas a .env.local. Primero revisa la simulación:

```powershell
npm run migrate:supabase
```

Cuando se quiera copiar ese contenido al proyecto configurado:

```powershell
npm run migrate:supabase:apply
```

La migración copia contenido editorial real y conserva sus IDs. Excluye muestras y consultas privadas; no elimina registros remotos. Si aún no existe un catálogo local, utiliza la primera guía original incluida en el repositorio.

Después, entra en /admin del sitio publicado. Crea convocatorias con fuentes vigentes, resúmenes propios, requisitos y pasos claros. La revisión editorial debe comprobar la fuente y el contenido antes de marcar la verificación. El importador consulta automáticamente las fuentes configuradas y muestra hallazgos separados del catálogo editorial; esos hallazgos siguen requiriendo verificar las bases.

## 4. Preparar el contenido para AdSense

Google pide contenido propio, útil y original, y evalúa el sitio. No hay una cantidad de artículos ni ingresos garantizados por este proyecto. La validación de longitud del editor es una regla de calidad interna, no un requisito numérico de Google. [Requisitos oficiales](https://support.google.com/adsense/answer/9724?hl=es).

Antes de solicitar la revisión, revisa las fuentes, los enlaces, la información del responsable del portal, el contacto y la privacidad. Activa SITE_INDEXABLE cuando el catálogo real esté listo. Las muestras no se incluyen en el sitemap.

## 5. Crear la cuenta e integrar sus identificadores

1. Registra la cuenta de AdSense y añade el dominio definitivo.
2. Configura NEXT_PUBLIC_ADSENSE_CLIENT con el ID ca-pub de tu cuenta. El sitio añade la etiqueta de verificación y genera /ads.txt con ese ID.
3. Crea los bloques y configura NEXT_PUBLIC_ADSENSE_SLOT_HOME, NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE y NEXT_PUBLIC_ADSENSE_SLOT_OPPORTUNITY.
4. Mantén los anuncios desactivados durante la preparación. Revisa el estado del sitio en la cuenta.

Google recomienda ads.txt; el archivo usa el identificador del editor y la declaración de vendedor autorizado. No se inventa un identificador ni se conserva el archivo de ejemplo anterior. [Guía de ads.txt](https://support.google.com/adsense/answer/12171612?hl=es).

## 6. Configurar privacidad y consentimiento

Para utilizar la solución de Google, crea y publica el mensaje desde Privacidad y mensajes de AdSense, con la URL de privacidad y las opciones correspondientes. Google indica que el código de AdSense debe estar colocado en el sitio para mostrar esos mensajes. [Crear el mensaje](https://support.google.com/adsense/answer/10960768?hl=es).

Si se sirven anuncios a visitantes del EEE, Reino Unido o Suiza, revisa los requisitos de la CMP certificada. [Requisitos de consentimiento](https://support.google.com/adsense/answer/13554116?hl=es).

El pie incluye un control de preferencias cuando se habilita AdSense, utilizando la función de revocación de Google. Debe comprobarse con el mensaje real de la cuenta; una variable no sustituye configurar y publicar esa CMP. [Revocación del consentimiento](https://support.google.com/adsense/answer/10959060?hl=es).

## 7. Habilitar anuncios después de la configuración

Una vez que Google apruebe el sitio y se haya comprobado el consentimiento:

- NEXT_PUBLIC_ADSENSE_APPROVED=true
- NEXT_PUBLIC_ADSENSE_CONSENT_READY=true
- NEXT_PUBLIC_ADSENSE_ENABLED=true
- NEXT_PUBLIC_ADSENSE_PREVIEW=false
- SITE_INDEXABLE=true
- PORTAL_DEMO_MODE=false

Los bloques aparecen en páginas de contenido, separados de los controles de búsqueda, enlaces para postular y botones de compartir. No se incluyen anuncios en el panel, la bandeja privada, favoritos ni resultados vacíos. Las páginas de muestra no solicitan anuncios reales. [Políticas de emplazamiento](https://support.google.com/adsense/answer/1346295?hl=es).

En local, NEXT_PUBLIC_ADSENSE_PREVIEW=true muestra espacios identificados como vista previa. No carga el código publicitario de Google.

## Validación pendiente en servicios externos

La persistencia local, las rutas editoriales y el flujo de publicación se probaron. Las migraciones SQL, los permisos y el conector se verificaron contra el proyecto real de Supabase. La revisión de AdSense, los mensajes de consentimiento y el servicio de anuncios siguen pendientes de configurar en la cuenta del propietario.
