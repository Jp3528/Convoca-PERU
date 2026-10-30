import type { Article, Opportunity } from "./data";
import type { ImportCandidate } from "./import-types";
export type Message = {
  name: string;
  email: string;
  subject: string;
  organization: string;
  sourceUrl: string;
  message: string;
  resolved: boolean;
};
export type ContentKind = "opportunity" | "article" | "message" | "import";
export type PortalRecord = {
  id: string;
  kind: ContentKind;
  slug: string;
  payload: Opportunity | Article | Message | ImportCandidate;
  status: "draft" | "published" | "archived";
  sample: boolean;
  verified: boolean;
  updated_at: string;
  created_at: string;
  revision: number;
};
export type Catalog = {
  opportunities: Opportunity[];
  articles: Article[];
  demo: boolean;
  available: boolean;
};
