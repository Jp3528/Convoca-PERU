// Pure browser-safe helpers. CV contents must never be passed to a server action.
export type CvJob = {
  key: string;
  title: string;
  organization: string;
  type: string;
  requirements: string[];
  summary: string;
  href: string;
  sample?: boolean;
};
export type CvCheck = {
  label: string;
  passed: boolean;
  points: number;
  possible: number;
  advice: string;
};
const plain = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const ignored = new Set(
  "para como desde hasta entre sobre mediante nivel puesto cargo trabajo laboral funciones experiencia general especifica anos ano meses mes minima minimo contar tener acreditar requisitos perfil profesional profesionales universidad universitario universitarios egresado bachiller titulo titulado conocimientos conocimiento relacionado relacionados afines administracion publica sector publico privado entidad convocatoria contratacion otros otras capacidad gestion personal curso cursos especializacion programas formacion academica carrera carreras actividades realizar conforme servicios servicio procesos proceso informacion apoyo requerimientos".split(
    " ",
  ),
);
export function jobKeywords(job: Pick<CvJob, "title" | "requirements">) {
  const words =
    plain(job.title + " " + job.requirements.join(" ")).match(
      /[a-z][a-z0-9]{2,}/g,
    ) || [];
  return [
    ...new Set(words.filter((w) => w.length >= 4 && !ignored.has(w))),
  ].slice(0, 18);
}
const heading =
  /^(?:perfil(?: profesional)?|resumen(?: profesional)?|objetivo(?: profesional)?|experiencia(?: (?:laboral|profesional))?|educacion|formacion(?: academica)?|estudios|habilidades|competencias|conocimientos|certificaciones|cursos(?: y certificaciones)?|idiomas|proyectos|datos(?: personales| de contacto)?|contacto|references|education|experience|skills|summary)\s*[:.]?$/;
export function analyzeCv(text: string, job: CvJob) {
  const normalized = plain(text),
    words = text.trim().split(/\s+/).filter(Boolean).length;
  const keywords = jobKeywords(job);
  const tokens = new Set(normalized.match(/[a-z0-9]+/g) || []);
  const matched = keywords.filter((w) => tokens.has(w)),
    missing = keywords.filter((w) => !tokens.has(w));
  const checks: CvCheck[] = [];
  function add(
    label: string,
    passed: boolean,
    possible: number,
    advice: string,
  ) {
    checks.push({
      label,
      passed,
      possible,
      points: passed ? possible : 0,
      advice,
    });
  }
  add(
    "Contacto identificable",
    /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(text) &&
      /(?:\+?\d[\s().-]*){9,}/.test(text),
    15,
    "Incluye un correo profesional y un teléfono de contacto; evita DNI, dirección exacta u otros datos innecesarios.",
  );
  add(
    "Sección de experiencia o proyectos",
    /(?:experiencia|experience|proyectos|projects)/.test(normalized),
    15,
    "Usa un encabezado claro para tu experiencia o tus proyectos y prácticas reales.",
  );
  add(
    "Sección de formación",
    /(?:educacion|education|formacion|estudios)/.test(normalized),
    15,
    "Indica tu formación, institución y estado real: estudiante, egresado, bachiller o titulado.",
  );
  add(
    "Fechas reconocibles",
    /\b(?:19|20)\d{2}\b/.test(text),
    10,
    "Añade fechas claras a tus estudios y experiencias, sin modificar su duración.",
  );
  add(
    "Texto con extensión revisable",
    words >= 150 && words <= 1200,
    15,
    "Como referencia de lectura, revisa un texto de 150 a 1,200 palabras. La extensión adecuada depende de las bases y tu trayectoria.",
  );
  add(
    "Texto legible tras la extracción",
    !text.includes("\uFFFD") &&
      (text.match(/[a-záéíóúñ]/gi)?.length || 0) / Math.max(text.length, 1) >
        0.45,
    10,
    "Comprueba que al copiar el documento se conserve el orden y no aparezcan caracteres extraños. Esta prueba no detecta columnas, tablas ni diseño del archivo.",
  );
  if (keywords.length && job.requirements.length)
    checks.push({
      label: "Coincidencia de términos del perfil",
      passed: matched.length === keywords.length,
      possible: 20,
      points: Math.round((20 * matched.length) / keywords.length),
      advice:
        "Coincidencias literales, sin verificar equivalencias, años ni títulos. Añade un término solo si describe una capacidad que puedes acreditar.",
    });
  const possible = checks.reduce((n, c) => n + c.possible, 0);
  return {
    score: Math.round(
      (100 * checks.reduce((n, c) => n + c.points, 0)) / possible,
    ),
    checks,
    keywords,
    matched,
    missing,
    words,
    draft: organizeCv(text),
  };
}
export function organizeCv(text: string) {
  // Move whole blocks, never sentences between employers. Preserve every input line.
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const preamble: string[] = [],
    blocks: { title: string; lines: string[]; index: number }[] = [];
  for (const line of lines) {
    const label = plain(line.trim());
    if (isCvSectionHeading(line))
      blocks.push({ title: label, lines: [line], index: blocks.length });
    else if (blocks.length) blocks[blocks.length - 1].lines.push(line);
    else preamble.push(line);
  }
  const rank = (t: string) =>
    /perfil|resumen|summary|objetivo/.test(t)
      ? 0
      : /experiencia|experience|proyectos/.test(t)
        ? 1
        : /formacion|educacion|education|estudios/.test(t)
          ? 2
          : 3;
  blocks.sort((a, b) => rank(a.title) - rank(b.title) || a.index - b.index);
  return [...preamble, ...blocks.flatMap((b) => b.lines)].join("\n").trim();
}

export function isCvSectionHeading(line: string) {
  return line.trim().length < 55 && heading.test(plain(line.trim()));
}
