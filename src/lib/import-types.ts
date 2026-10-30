export type ImportCandidate = {
  externalId?: string;
  type?: "CAS" | "Empleo";
  location?: string;
  noLongerListedAt?: string;
  sourceId: string;
  reference: string;
  title: string;
  organization: string;
  sourceUrl: string;
  startsAt: string;
  endsAt: string;
  fingerprint: string;
  firstSeenAt: string;
  lastCheckedAt: string;
  parserVersion: string;
};

export type ImportProvenance = {
  candidateId: string;
  sourceId: string;
  reference: string;
  fingerprint: string;
  preparedAt: string;
};

export type ImportReport = {
  sourceId: string;
  checkedAt: string;
  found: number;
  created: number;
  updated: number;
  unchanged: number;
  conflicts: number;
  expired: number;
  removed?: number;
};

export const importSources = [
  {
    id: "mtc-cas",
    name: "MTC · Convocatorias CAS",
    url: "https://portal.mtc.gob.pe/ofertaslaborales/CAS/frmConvocatoriaCAS.aspx",
    organization: "Ministerio de Transportes y Comunicaciones",
    description:
      "Extrae código, puesto y periodo del listado público. Las bases se revisan en el portal de la entidad.",
  },
  {
    id: "proinversion",
    name: "ProInversión · Empleos públicos",
    url: "https://www.investinperu.pe/convocatorias-laborales/",
    organization: "ProInversión",
    description:
      "Consulta los procesos externos de la primera página, con puesto, ubicación y fechas de postulación. Excluye concursos internos.",
  },
] as const;

export type ImportJob = {
  leaseToken: string;
  leaseUntil: string;
  status: "running" | "success" | "partial" | "error";
  startedAt: string;
  finishedAt: string | null;
  nextRunAt: string;
  reports: ImportReport[];
  errors: { sourceId: string; message: string }[];
};

export type AutomationStatus = {
  enabled: boolean;
  scheduler: "local" | "vercel" | "missing";
  intervalMinutes: number;
  state: Omit<ImportJob, "leaseToken" | "leaseUntil"> | null;
};

export type Discovery = { id: string } & Pick<
  ImportCandidate,
  | "sourceId"
  | "reference"
  | "title"
  | "organization"
  | "sourceUrl"
  | "startsAt"
  | "endsAt"
  | "lastCheckedAt"
  | "type"
  | "location"
>;
