# Convoca Perú | Jobs & Internships Portal

[Español](#espanol) · [English](#english)

[Demo](https://convoca-peru.vercel.app) · [GitHub](https://github.com/Jp3528/Convoca-PERU)

<a id="espanol"></a>

## Español

### Descripción

Portal web para explorar convocatorias laborales, prácticas y guías para postulantes en Perú. Utiliza Next.js App Router y datos tipados para presentar oportunidades, filtros y fichas con enlaces a sus fuentes.

### Funcionalidades

- Listado de oportunidades con filtros y páginas de detalle.
- Guías editoriales con rutas dinámicas por artículo.
- Panel de borradores y formulario de contacto de demostración.
- Metadata, sitemap y robots definidos desde Next.js.

### Tecnologías

Next.js 16 · React 19 · TypeScript · CSS · ESLint

### Ejecutar localmente

**Requisitos:** Node.js 22 y npm.

```bash
git clone https://github.com/Jp3528/Convoca-PERU.git
cd Convoca-PERU
```

```bash
npm ci
```

**Configuración.** Copia [`.env.example`](.env.example) a `.env.local` para personalizar `NEXT_PUBLIC_SITE_URL`. Los valores de Supabase y AdSense incluidos son plantillas: no habilitan por sí solos esas integraciones.

```bash
npm run dev
```

Abre `http://localhost:3000`. Las oportunidades actuales se editan en `src/lib/data.ts`.

### Comprobaciones

```bash
npm run lint
npm run build
```

Comandos disponibles para comprobar el proyecto en un entorno con sus dependencias instaladas.

### Estructura

| Ruta                                         | Contenido                                   |
| -------------------------------------------- | ------------------------------------------- |
| [`src/app/`](src/app/)                       | Páginas, rutas dinámicas y metadata.        |
| [`src/components/`](src/components/)         | Tarjetas y controles de búsqueda.           |
| [`src/lib/data.ts`](src/lib/data.ts)         | Datos tipados de oportunidades y artículos. |
| [`database/schema.sql`](database/schema.sql) | Esquema previsto para Supabase/PostgreSQL.  |

### Alcance

La versión actual utiliza datos locales. El panel conserva borradores en estado de React y el contacto muestra una confirmación local; no publican en Supabase ni envían mensajes. La persistencia, autenticación editorial y validación de convocatorias vigentes requieren desarrollo adicional. Las postulaciones se realizan en la fuente oficial de cada entidad.

---

<a id="english"></a>

## English

### Overview

A web portal for exploring jobs, internships and application guides in Peru. It uses Next.js App Router and typed data to present opportunities, filters and detail pages linking to their sources.

### Features

- Opportunity listings with filters and detail pages.
- Editorial guides with dynamic article routes.
- Demo editorial drafts panel and contact form.
- Metadata, sitemap and robots defined through Next.js.

### Technology

Next.js 16 · React 19 · TypeScript · CSS · ESLint

### Run locally

**Requirements:** Node.js 22 and npm.

```bash
git clone https://github.com/Jp3528/Convoca-PERU.git
cd Convoca-PERU
```

```bash
npm ci
```

**Configuration.** Copy [`.env.example`](.env.example) to `.env.local` to customize `NEXT_PUBLIC_SITE_URL`. The included Supabase and AdSense values are templates and do not enable those integrations by themselves.

```bash
npm run dev
```

Open `http://localhost:3000`. Current opportunities are edited in `src/lib/data.ts`.

### Checks

```bash
npm run lint
npm run build
```

Available commands for checking the project in an environment with its dependencies installed.

### Structure

| Path                                         | Contents                             |
| -------------------------------------------- | ------------------------------------ |
| [`src/app/`](src/app/)                       | Pages, dynamic routes and metadata.  |
| [`src/components/`](src/components/)         | Cards and search controls.           |
| [`src/lib/data.ts`](src/lib/data.ts)         | Typed opportunity and article data.  |
| [`database/schema.sql`](database/schema.sql) | Proposed Supabase/PostgreSQL schema. |

### Scope

The current version uses local data. The editor keeps drafts in React state and the contact form shows a local confirmation; neither publishes to Supabase nor sends messages. Persistence, editorial authentication and verification of current opportunities require further development. Applications take place through each organization's official source.
