# Convoca Peru

Portal de convocatorias laborales, practicas preprofesionales, practicas profesionales y guias para postulantes en Peru.

## Stack recomendado

- Next.js App Router con TypeScript para SEO, rutas dinamicas y deploy sencillo.
- Supabase Postgres como base de datos productiva.
- Vercel como hosting.
- Dominio comprado o administrado en Cloudflare apuntando a Vercel por DNS.

## Desarrollo local

```bash
npm install
npm run dev
```

## Variables

Copiar `.env.example` a `.env.local` y completar valores reales. No subir `.env.local` al repositorio.

## Base de datos

El archivo `database/schema.sql` contiene el esquema inicial para Supabase:

- organizaciones
- convocatorias
- carreras por convocatoria
- articulos
- politicas RLS para lectura publica de contenido publicado

## Produccion

1. Crear proyecto en Supabase y ejecutar `database/schema.sql`.
2. Cargar convocatorias reales desde el panel o scripts internos.
3. Subir el repositorio a GitHub.
4. Importar el repositorio en Vercel.
5. Configurar dominio propio desde Vercel y crear los registros DNS en Cloudflare.
6. Cuando AdSense apruebe el sitio, colocar el ID real en `NEXT_PUBLIC_ADSENSE_CLIENT` y publicar `ads.txt`.

## Nota editorial

Las convocatorias deben enlazar a una fuente oficial. El sitio no debe cobrar por postulaciones ni reemplazar las bases de cada entidad.
