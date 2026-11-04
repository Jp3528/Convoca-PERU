# Recursos visuales

- Fotografía anterior conservada en los recursos: fauxels / Pexels, foto 3184291.
  Fuente: https://www.pexels.com/photo/people-sitting-near-table-with-laptop-3184291/
  Archivo local: public/images/equipo-profesional.jpg
  Licencia: https://www.pexels.com/license/
- Marca e íconos: SVG creados para este proyecto; no son logotipos oficiales de las entidades.
- Ilustraciones de las guías: composición original en HTML/CSS y SVG.
- Portada actual: `public/images/postulacion-profesional-v2.png`, generada para el proyecto. Imagen ilustrativa; no muestra postulantes ni personal de una entidad real. Prompt: fotografía editorial natural de dos profesionales adultos latinoamericanos revisando un CV y un portátil en una oficina luminosa de Lima, ropa azul marino y neutra, acentos verde azulado, rostros y manos realistas, sin texto legible, marcas ni datos personales. Se conserva el PNG generado sin editar y Next Image entrega versiones responsivas optimizadas.
- Marca original: `public/logo-convoca.svg` y `src/app/icon.svg`. Símbolo vectorial escalable con una C y una flecha de avance; el nombre se presenta como texto accesible en el componente Brand.
- Tipografías actuales: DM Sans en títulos y marca, e Inter en lectura; ambas servidas localmente mediante next/font.
- Exportación PDF: Inter Latin 400 y 700 de `@fontsource/inter` 5.3.0, convertidas de WOFF2 a TrueType con fontTools y servidas desde `public/fonts/`; licencia SIL Open Font License conservada en `public/fonts/Inter-LICENSE.txt`. El PDF se genera localmente con pdf-lib y fontkit, cargados al solicitar la descarga. Las fuentes deben conservar su versión TrueType para que la incrustación en el PDF funcione.
- Identidad visual: azul tinta `#192E4C`, coral oscuro `#BD442C` y papel `#F7F5F0`. Botones con estados de foco, hover, pulsación y deshabilitado; la información de vigencia conserva etiquetas y colores semánticos. El bloque de CV utiliza una composición original de documento y líneas en HTML/CSS, sin puntuaciones ficticias ni testimonios inventados.
- Lector de PDF: worker de PDF.js 6.4.299 alojado en `public/vendor/pdf.worker.min.mjs`. Licencia Apache-2.0 conservada en `public/vendor/pdfjs-LICENSE`. Al actualizar pdfjs-dist, debe copiarse también el worker de la misma versión.
