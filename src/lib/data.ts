export type OpportunityType =
  | "Preprofesional"
  | "Profesional"
  | "Empleo"
  | "CAS";

export type Sector = "Publico" | "Privado";

export type Opportunity = {
  slug: string;
  title: string;
  organization: string;
  sector: Sector;
  type: OpportunityType;
  department: string;
  province?: string;
  modality: "Presencial" | "Hibrido" | "Remoto";
  vacancies: number;
  careers: string[];
  endsAt: string;
  stipend: string;
  summary: string;
  requirements: string[];
  steps: string[];
  sourceName: string;
  sourceUrl: string;
  publishedAt: string;
  featured?: boolean;
};

export type Article = {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  publishedAt: string;
  body: string[];
};

export const departments = [
  "Lima",
  "Arequipa",
  "La Libertad",
  "Lambayeque",
  "Piura",
  "Cusco",
  "Junin",
  "Ica",
  "Tacna",
  "Callao",
  "Ancash",
  "Loreto",
  "San Martin",
];

export const careers = [
  "Administracion",
  "Contabilidad",
  "Derecho",
  "Economia",
  "Ingenieria de Sistemas",
  "Ingenieria Industrial",
  "Ingenieria Ambiental",
  "Ingenieria Civil",
  "Comunicacion",
  "Marketing",
  "Arquitectura",
  "Psicologia",
];

export const opportunities: Opportunity[] = [
  {
    slug: "sunat-practicantes-aduanas-tributacion-sistemas-2026",
    title: "Convocatoria de Practicas Pre y Profesionales en Aduanas, Tributos y TI",
    organization: "SUNAT",
    sector: "Publico",
    type: "Preprofesional",
    department: "Lima",
    province: "Lima",
    modality: "Hibrido",
    vacancies: 25,
    careers: [
      "Administracion",
      "Contabilidad",
      "Derecho",
      "Economia",
      "Ingenieria de Sistemas",
      "Ingenieria Industrial",
    ],
    endsAt: "2026-10-28",
    stipend: "S/ 1,200 mensuales + seguro FOLA",
    summary:
      "Programa nacional formativo en gestion tributaria, control aduanero y desarrollo de soluciones tecnologicas para la administracion publica.",
    requirements: [
      "Estudiante perteneciente al tercio o quinto superior a partir del 8vo ciclo.",
      "Dominio intermedio de herramientas ofimaticas y bases de datos.",
      "No tener antecedentes policiales, penales ni judiciales.",
      "Disponibilidad para convenio formativo de hasta 30 horas semanales.",
    ],
    steps: [
      "Registrar postulacion en el portal UNETE a SUNAT.",
      "Cargar ficha de datos personales y constancia de estudios vigente.",
      "Rendir evaluacion tecnica y psicologica virtual.",
      "Entrevista final y publicacion de cuadro de meritos.",
    ],
    sourceName: "Portal Institucional SUNAT - Seccion Oportunidades",
    sourceUrl: "https://unete.sunat.gob.pe/",
    publishedAt: "2026-10-01",
    featured: true,
  },
  {
    slug: "bcrp-concurso-practicantes-economia-finanzas-estadistica-2026",
    title: "Programa de Extension y Practicas en Investigacion Economica y Finanzas",
    organization: "BANCO CENTRAL DE RESERVA DEL PERU (BCRP)",
    sector: "Publico",
    type: "Profesional",
    department: "Lima",
    province: "Lima",
    modality: "Presencial",
    vacancies: 10,
    careers: ["Economia", "Ingenieria de Sistemas", "Contabilidad"],
    endsAt: "2026-10-24",
    stipend: "Subvencion competitiva acorde a ley formativa",
    summary:
      "Oportunidad de alto impacto academico y profesional en politica monetaria, analisis macroeconomico y estabilidad financiera.",
    requirements: [
      "Egresados o bachilleres con maximo 1 año de egreso.",
      "Perteneciente al quinto o decimo superior de su promocion.",
      "Manejo fluido de software econometrico (R, Python, Stata) e ingles avanzado.",
    ],
    steps: [
      "Completar la ficha de inscripcion en el portal del BCRP.",
      "Adjuntar constancia de orden de merito y expediente de notas.",
      "Examen de seleccion academica en macroeconomia y microeconomia.",
    ],
    sourceName: "Portal Oficial del BCRP",
    sourceUrl: "https://www.bcrp.gob.pe/",
    publishedAt: "2026-10-02",
    featured: true,
  },
  {
    slug: "bcp-trainee-practicas-negocios-banca-analitica-2026",
    title: "Programa Crece BCP: Practicas en Banca Digital, Analitica y Finanzas",
    organization: "BANCO DE CREDITO DEL PERU (BCP)",
    sector: "Privado",
    type: "Preprofesional",
    department: "Lima",
    province: "La Molina",
    modality: "Hibrido",
    vacancies: 30,
    careers: [
      "Administracion",
      "Economia",
      "Ingenieria Industrial",
      "Ingenieria de Sistemas",
      "Marketing",
    ],
    endsAt: "2026-10-20",
    stipend: "S/ 1,400 + seguro EPS + bono de bienestar",
    summary:
      "Forma parte de equipos agiles en transformacion digital, productos financieros, analytics y gestion comercial en el principal banco del pais.",
    requirements: [
      "Estudiantes a partir de 7mo ciclo de universidad.",
      "Curiosidad analitica y habilidades de comunicacion efectiva.",
      "Disponibilidad de 30 horas semanales.",
    ],
    steps: [
      "Postular a traves del portal de empleos BCP / Talento BCP.",
      "Evaluaciones psicometricas y pruebas de logica online.",
      "Dinamica grupal (Assessment Center) con lideres de area.",
      "Oferta e induccion al programa.",
    ],
    sourceName: "Portal Empleos BCP",
    sourceUrl: "https://www.viabcp.com/",
    publishedAt: "2026-10-03",
    featured: true,
  },
  {
    slug: "contraloria-convocatoria-cas-auditores-asistentes-2026",
    title: "Convocatoria CAS Nacional: Asistentes de Auditoria y Gestion Publica",
    organization: "CONTRALORIA GENERAL DE LA REPUBLICA",
    sector: "Publico",
    type: "CAS",
    department: "Arequipa",
    province: "Arequipa",
    modality: "Presencial",
    vacancies: 12,
    careers: [
      "Contabilidad",
      "Derecho",
      "Ingenieria Civil",
      "Administracion",
    ],
    endsAt: "2026-10-18",
    stipend: "S/ 3,500 - S/ 4,500 segun perfil",
    summary:
      "Puestos bajo regimen CAS para integrarse a las comisiones de control gubernamental, fiscalizacion y auditoria de obras publicas.",
    requirements: [
      "Bachiller o titulado en carreras pertinentes al puesto.",
      "Experiencia general minima de 1 año en sector publico o privado.",
      "Conocimientos acreditados en contrataciones del Estado (OSCE) o gestion publica.",
      "Habilitacion profesional vigente en colegios respectivos.",
    ],
    steps: [
      "Descargar bases completas y anexos en el portal de la Contraloria.",
      "Registro en el sistema de convocatorias de personal.",
      "Evaluacion curricular y publicacion de aptos para entrevista.",
      "Entrevista personal y firma de contrato.",
    ],
    sourceName: "Portal de Convocatorias Contraloria",
    sourceUrl: "https://www.gob.pe/contraloria",
    publishedAt: "2026-09-30",
    featured: true,
  },
  {
    slug: "alicorp-practicas-supply-chain-calidad-industrial-2026",
    title: "Programa de Practicas en Cadena de Suministro, Calidad y Planta",
    organization: "ALICORP",
    sector: "Privado",
    type: "Profesional",
    department: "Callao",
    province: "Callao",
    modality: "Presencial",
    vacancies: 8,
    careers: [
      "Ingenieria Industrial",
      "Administracion",
      "Ingenieria Ambiental",
    ],
    endsAt: "2026-10-25",
    stipend: "Competitiva + alimentacion cubierta + movilidad",
    summary:
      "Desarrollate en plantas de produccion de consumo masivo, optimizacion de procesos logisticos y proyectos Lean Six Sigma.",
    requirements: [
      "Egresados universitarios (año 2025 o 2026).",
      "Interes por procesos de manufactura, logistica y seguridad industrial.",
      "Manejo de herramientas de analisis de datos (Excel avanzado, Power BI deseable).",
    ],
    steps: [
      "Postulacion a traves de la plataforma de seleccion de Alicorp.",
      "Filtros telefonicos y pruebas de competencias tecnicas.",
      "Entrevista con jefatura de planta.",
    ],
    sourceName: "Alicorp Trabaja con Nosotros",
    sourceUrl: "https://www.alicorp.com.pe/",
    publishedAt: "2026-10-04",
    featured: false,
  },
  {
    slug: "poder-judicial-asistentes-jurisdiccionales-cas-2026",
    title: "Convocatoria CAS: Asistentes Jurisdiccionales y Notificadores Judiciales",
    organization: "PODER JUDICIAL DEL PERU",
    sector: "Publico",
    type: "CAS",
    department: "Cusco",
    province: "Cusco",
    modality: "Presencial",
    vacancies: 15,
    careers: ["Derecho", "Administracion"],
    endsAt: "2026-10-16",
    stipend: "S/ 2,800 - S/ 3,200 segun resolucion administrativa",
    summary:
      "Incorporacion de personal para juzgados especializados, apoyo en elaboracion de resoluciones y tramitacion de expedientes judiciales.",
    requirements: [
      "Egresado o bachiller en Derecho.",
      "No registrar antecedentes judiciales ni sanciones en el RNSDD.",
      "Conocimiento del Sistema de Notificaciones Electronicas (SINOE).",
    ],
    steps: [
      "Registro en la plataforma de seleccion de personal del Poder Judicial.",
      "Postulacion electronica a la plaza deseada en la Corte Superior de Cusco.",
      "Revision curricular, examen de conocimientos y entrevista.",
    ],
    sourceName: "Portal de Oportunidades Laborales Poder Judicial",
    sourceUrl: "https://www.pj.gob.pe/",
    publishedAt: "2026-09-29",
    featured: false,
  },
  {
    slug: "sutran-practicantes-administracion-derecho-sistemas-2026",
    title: "Practicas para Administracion, Derecho e Ingenieria de Sistemas",
    organization: "SUTRAN",
    sector: "Publico",
    type: "Preprofesional",
    department: "Lima",
    province: "Lima",
    modality: "Presencial",
    vacancies: 3,
    careers: [
      "Administracion",
      "Derecho",
      "Ingenieria de Sistemas",
      "Ingenieria Industrial",
    ],
    endsAt: "2026-10-19",
    stipend: "Subvencion segun bases oficiales",
    summary:
      "Programa dirigido a estudiantes con interes en gestion publica, supervision del transporte terrestre y soporte administrativo.",
    requirements: [
      "Ser estudiante universitario desde los ultimos ciclos.",
      "Contar con disponibilidad para jornada formativa de hasta 30 horas semanales.",
      "No registrar impedimentos para contratar con el Estado.",
    ],
    steps: [
      "Revisar las bases oficiales publicadas.",
      "Preparar CV documentado y constancia de estudios.",
      "Enviar la postulacion por la mesa de partes virtual indicada.",
    ],
    sourceName: "Portal institucional SUTRAN",
    sourceUrl: "https://www.gob.pe/sutran",
    publishedAt: "2026-10-01",
    featured: false,
  },
  {
    slug: "bbva-practicantes-riesgos-finanzas-data-2026",
    title: "Practicas Preprofesionales en Modelos de Riesgos y Finanzas",
    organization: "BBVA PERU",
    sector: "Privado",
    type: "Preprofesional",
    department: "Lima",
    province: "San Isidro",
    modality: "Hibrido",
    vacancies: 6,
    careers: [
      "Economia",
      "Ingenieria de Sistemas",
      "Contabilidad",
      "Administracion",
    ],
    endsAt: "2026-10-22",
    stipend: "S/ 1,350 + seguro privado completo",
    summary:
      "Aprende sobre scoring crediticio, modelado de riesgos financieros y gestion patrimonial en una de las instituciones bancarias lideres.",
    requirements: [
      "Estudiantes de 7mo a 9no ciclo.",
      "Conocimientos en SQL, Python o Power BI valorados.",
      "Capacidad analitica orientada a resolucion de problemas.",
    ],
    steps: [
      "Postular en la web de carreras BBVA.",
      "Test gamificado de competencias online.",
      "Entrevista con Business Partner de Recursos Humanos.",
    ],
    sourceName: "Trabaja con Nosotros BBVA",
    sourceUrl: "https://www.bbva.pe/",
    publishedAt: "2026-10-03",
    featured: false,
  },
  {
    slug: "oefa-practicas-derecho-biologia-ingenieria-ambiental-2026",
    title: "Practicas Profesionales para Derecho, Biologia e Ingenieria Ambiental",
    organization: "OEFA",
    sector: "Publico",
    type: "Profesional",
    department: "Junin",
    province: "Huancayo",
    modality: "Presencial",
    vacancies: 4,
    careers: [
      "Derecho",
      "Economia",
      "Ingenieria Ambiental",
    ],
    endsAt: "2026-10-26",
    stipend: "Segun modalidad formativa (S/ 1,200 + seguro)",
    summary:
      "Convocatoria para egresados que deseen apoyar la fiscalizacion ambiental y gestion documental tecnica en la region centro.",
    requirements: [
      "Ser egresado universitario o bachiller de los periodos 2025 o 2026.",
      "Conocimiento comprobado en normativa ambiental sectorial.",
      "Disponibilidad para desplazamientos tecnicos de supervision.",
    ],
    steps: [
      "Descargar bases y anexos oficiales de la web de OEFA.",
      "Completar ficha de postulante debidamente foliada.",
      "Registrar expediente dentro del plazo establecido.",
    ],
    sourceName: "Convocatorias OEFA",
    sourceUrl: "https://www.gob.pe/oefa",
    publishedAt: "2026-10-02",
    featured: false,
  },
  {
    slug: "ferreyros-programa-trainee-ingenieria-comercial-2026",
    title: "Programa Semillero: Ingenieros de Servicio y Soporte Comercial",
    organization: "FERREYROS",
    sector: "Privado",
    type: "Profesional",
    department: "Arequipa",
    province: "Arequipa",
    modality: "Presencial",
    vacancies: 10,
    careers: ["Ingenieria Industrial", "Administracion"],
    endsAt: "2026-10-30",
    stipend: "Atractivo paquete formativo + capacitacion tecnica de fabrica",
    summary:
      "Formacion acelerada en gestion de maquinaria pesada, mantenimiento minero y asesoria comercial tecnica de equipos Caterpillar.",
    requirements: [
      "Egresados de Ingenieria Mecanica, Industrial o afines.",
      "Disponibilidad para rotar en talleres y sedes operativas del sur del pais.",
      "Licencia de conducir de preferencia.",
    ],
    steps: [
      "Envio de CV por plataforma Ferreycorp.",
      "Dinamica de evaluacion de habilidades tecnicas y de liderazgo.",
      "Entrevistas por panel gerencial.",
    ],
    sourceName: "Portal Ferreycorp Talento",
    sourceUrl: "https://www.ferreyros.com.pe/",
    publishedAt: "2026-10-04",
    featured: false,
  },
  {
    slug: "minedu-convocatoria-cas-especialistas-gestion-2026",
    title: "Convocatoria CAS: Especialistas en Monitoreo Educativo y Presupuesto",
    organization: "MINISTERIO DE EDUCACION (MINEDU)",
    sector: "Publico",
    type: "CAS",
    department: "Lima",
    province: "San Borja",
    modality: "Hibrido",
    vacancies: 5,
    careers: ["Administracion", "Economia", "Contabilidad"],
    endsAt: "2026-10-21",
    stipend: "S/ 5,000 - S/ 6,500 segun categoria",
    summary:
      "Supervision y ejecucion del presupuesto por resultados en programas de infraestructura y calidad educativa a nivel nacional.",
    requirements: [
      "Titulo universitario colegiado en carreras economicas o administrativas.",
      "Experiencia minima de 3 años en el sector publico.",
      "Especializacion en gestion publica o presupuesto por resultados (SIAF).",
    ],
    steps: [
      "Registro en el sistema de postulaciones CAS del MINEDU.",
      "Carga de anexos debidamente firmados digitalmente o manuscritos.",
      "Evaluacion curricular y publicacion de resultados preliminares.",
    ],
    sourceName: "Portal MINEDU Convocatorias CAS",
    sourceUrl: "https://www.gob.pe/minedu",
    publishedAt: "2026-10-02",
    featured: false,
  },
  {
    slug: "interseguro-practicantes-data-finanzas-operaciones-2026",
    title: "Programa de Practicas en Analitica de Datos, Finanzas y Procesos",
    organization: "INTERSEGURO",
    sector: "Privado",
    type: "Preprofesional",
    department: "Lima",
    province: "San Isidro",
    modality: "Hibrido",
    vacancies: 4,
    careers: [
      "Administracion",
      "Contabilidad",
      "Economia",
      "Ingenieria de Sistemas",
      "Ingenieria Industrial",
    ],
    endsAt: "2026-10-27",
    stipend: "S/ 1,250 + seguro privado + dias libres por examenes",
    summary:
      "Oportunidad para estudiantes con gusto por la analitica, procesos de seguros, suscripcion y automatizacion de reportes financieros.",
    requirements: [
      "Manejo de Excel y Power BI a nivel intermedio.",
      "Interes por analisis cuantitativo y optimizacion de procesos.",
      "Disponibilidad de 30 horas semanales en horario regular.",
    ],
    steps: [
      "Completar el formulario oficial en la bolsa de talento de Interseguro.",
      "Adjuntar CV actualizado y constancia de matricula.",
      "Evaluacion curricular y entrevista personal.",
    ],
    sourceName: "Bolsa laboral corporativa Interseguro",
    sourceUrl: "https://www.interseguro.pe/",
    publishedAt: "2026-10-04",
    featured: false,
  },
];

export const articles: Article[] = [
  {
    slug: "como-armar-cv-para-practicas",
    title: "Como armar un CV de alto impacto para practicas sin experiencia previa",
    description:
      "Aprende a estructurar tu perfil academico, voluntariados, proyectos tecnicos y habilidades clave para destacar frente a cientos de postulantes.",
    category: "CV y Postulacion",
    readTime: "6 min",
    publishedAt: "2026-10-01",
    body: [
      "Cuando postulas a tus primeras practicas preprofesionales o profesionales, los reclutadores no esperan una larga trayectoria laboral. Lo que buscan es potencial, disciplina, orden mental y disposicion genuina para aprender rapido.",
      "Estructura tu documento en una sola pagina: comienza con un breve perfil profesional de 3 a 4 lineas que defina tu carrera, ciclo o condicion de egreso, area de interes y principales fortalezas. Luego, coloca tu formacion academica destacando tercio o quinto superior si aplica.",
      "Agrega una seccion de 'Proyectos Academicos o Relevantes' donde expliques que problema resolviste en un curso clave, que metodologia o software utilizaste y que resultado alcanzaste. Esto demuestra iniciativa practica.",
      "Menciona tus conocimientos tecnicos reales (Excel, SQL, Power BI, idiomas) con su nivel correspondiente, evitando graficos de barras o porcentajes subjetivos que confunden al seleccionador.",
      "Revisa la ortografia con minuciosidad. Un CV impecable en formato PDF con tipografia legible y margenes comodos proyecta profesionalismo inmediato.",
    ],
  },
  {
    slug: "guia-postulacion-cas-estado-peruano",
    title: "Guia definitiva para postular a convocatorias CAS en el Estado Peruano",
    description:
      "Paso a paso para entender las bases, descargar y foliar los anexos correctamente, evitar errores de descalificacion y preparar tu entrevista.",
    category: "Sector Publico",
    readTime: "8 min",
    publishedAt: "2026-10-02",
    body: [
      "El regimen de Contratacion Administrativa de Servicios (CAS) es una de las principales puertas de acceso al empleo publico en el Peru. Sin embargo, mas del 40% de postulantes queda descalificado en la primera etapa por descuidos formales.",
      "El primer paso obligatorio es leer las Bases de la Convocatoria de inicio a fin. Presta atencion estricta al cronograma: las fechas de registro son improrrogables y muchas veces la ventana de postulacion dura un solo dia.",
      "Verifica con rigor los requisitos minimos: formacion academica solicitada (grado exacto: egresado, bachiller o titulado), colegiatura y habilitacion si se exige, y experiencia laboral sustentada con constancias o certificados que especifiquen fecha de inicio y termino.",
      "Completa todos los Anexos obligatorios (Ficha de postulante, declaraciones juradas de no tener antecedentes ni incompatibilidades) tal como lo indica la entidad. No olvides firmar cada hoja y foliar el expediente si las bases lo exigen.",
      "Para la entrevista personal, investiga la mision, vision y competencias de la entidad, y repasa el marco normativo basico de la funcion publica (Ley N° 27444, codigo de etica de la funcion publica).",
    ],
  },
  {
    slug: "diferencias-practicas-preprofesionales-profesionales",
    title: "Diferencias legales entre practicas preprofesionales y profesionales en Peru",
    description:
      "Conoce tus derechos formativos bajo la Ley N° 28518: jornada maxima semanal, subvencion economica obligatoria, descanso y cobertura de salud.",
    category: "Marco Legal",
    readTime: "5 min",
    publishedAt: "2026-09-28",
    body: [
      "En el Peru, las modalidades formativas laborales estan reguladas por la Ley N° 28518. Comprender la diferencia entre practicas preprofesionales y profesionales te protegera de acuerdos abusivos o fuera de la ley.",
      "Practicas Preprofesionales: Estan dirigidas exclusivamente a estudiantes universitarios o de institutos. La jornada maxima es de 30 horas semanales (6 horas diarias), diseñada para no perjudicar tus horarios de estudio.",
      "Practicas Profesionales: Se orientan a egresados o bachilleres antes de obtener el titulo. La jornada maxima puede extenderse hasta 48 horas semanales (8 horas diarias), y el convenio no puede exceder los 12 meses, salvo casos normativos excepcionales.",
      "En ambas modalidades, la subvencion economica no puede ser menor a una Remuneracion Minima Vital (RMV) cuando se cumple la jornada maxima completa, y la entidad debe otorgarte seguro de salud (FOLA o EPS) y medio descanso subvencionado por cada seis meses de servicios.",
      "Exige siempre un Convenio de Aprendizaje formal firmado por tu institucion educativa, la empresa o entidad, y tu persona.",
    ],
  },
  {
    slug: "como-verificar-convocatoria-oficial",
    title: "Como verificar si una oferta de trabajo o convocatoria es 100% oficial",
    description:
      "Metodos simples para detectar estafas, verificar dominios institucionales y proteger tus datos personales al buscar empleo.",
    category: "Seguridad y Alertas",
    readTime: "5 min",
    publishedAt: "2026-09-25",
    body: [
      "Lamentablemente, proliferan falsas convocatorias en redes sociales que buscan lucrar con la necesidad de trabajo de jovenes postulantes. Saber identificar una fuente fidedigna es esencial.",
      "Regla de oro: Ninguna entidad del Estado ni empresa seria te cobrara jamas por 'derecho de examen', 'tramite de carnet', 'seguro medico de ingreso' o 'materiales de postulacion'. Si te piden dinero, es una estafa.",
      "Verifica la URL del portal: En el sector publico, las convocatorias oficiales siempre se publican en dominios terminados en '.gob.pe' o en las plataformas institucionales reconocidas (como Talentos Peru de SERVIR o bolsas directas de ministerios).",
      "En el sector privado, comprueba que el correo electronico del reclutador pertenezca al dominio corporativo de la empresa (ej. @bcp.com.pe) y no a cuentas gratuitas genericas de Gmail o Hotmail.",
      "En Convoca Peru, cada publicacion incluye de forma obligatoria el enlace directo y verificado a la fuente oficial de origen para que nunca postules a ciegas.",
    ],
  },
  {
    slug: "entrevista-laboral-metodo-star",
    title: "Como responder preguntas conductuales en entrevistas usando el metodo STAR",
    description:
      "Aprende a estructurar tus respuestas con la formula Situacion, Tarea, Accion y Resultado para impactar positivamente al entrevistador.",
    category: "Entrevistas",
    readTime: "6 min",
    publishedAt: "2026-10-03",
    body: [
      "En los procesos de seleccion modernos, los reclutadores ya no preguntan unicamente por tus conocimientos teoricos, sino como actuaste ante desafios reales: 'Cuentame de una ocasion en que tuviste que trabajar bajo presion'.",
      "El metodo STAR es el estandar de oro para contestar con claridad y persuasion: S (Situacion) describe brevemente el contexto o problema; T (Tarea) explica tu responsabilidad exacta; A (Accion) detalla las acciones especificas que tu ejecutaste; y R (Resultado) cuantifica el impacto positivo logrado.",
      "Ejemplo: 'En el 8vo ciclo, nuestro equipo debia entregar una simulacion financiera en dos semanas (Situacion). Como responsable de modelado (Tarea), diseñe un cronograma en Notion y automatice la consolidacion de datos en Excel (Accion), logrando entregar el informe 2 dias antes con la maxima calificacion (Resultado)'.",
      "Prepara con anticipacion de 3 a 5 historias STAR relacionadas con trabajo en equipo, resolucion de conflictos, adaptabilidad y liderazgo.",
    ],
  },
];

export function getOpportunityBySlug(slug: string) {
  return opportunities.find((opportunity) => opportunity.slug === slug);
}

export function getArticleBySlug(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00-05:00`));
}

export function daysUntil(value: string) {
  const now = new Date();
  const end = new Date(`${value}T23:59:59-05:00`);
  return Math.ceil((end.getTime() - now.getTime()) / 86_400_000);
}
