-- Run after 002_portal_documents.sql. Import candidates remain private drafts.
alter table public.portal_documents drop constraint if exists portal_documents_kind_check;
alter table public.portal_documents add constraint portal_documents_kind_check
  check (kind in ('opportunity','article','message','import'));
alter table public.portal_documents add constraint portal_import_never_published
  check (kind <> 'import' or (status <> 'published' and verified = false and sample = false));
