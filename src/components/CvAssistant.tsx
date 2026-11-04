"use client";
import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { analyzeCv, type CvJob } from "@/lib/cv-analysis";
import { readCvFile } from "@/lib/cv-file";
import { validateAdvice, type JobAdvice } from "@/lib/cv-coach-contract";
import { profileGuide } from "@/lib/cv-profile-guide";
import {
  CV_DAILY_PREPARATIONS,
  remainingCvPreparations,
  reserveCvPreparation,
} from "@/lib/cv-preparation-limit";
import { Icon } from "./Icon";

const quotaChanged = "convoca-cv-quota-changed";
function subscribeToQuota(refresh: () => void) {
  window.addEventListener("storage", refresh);
  window.addEventListener("focus", refresh);
  window.addEventListener(quotaChanged, refresh);
  const timer = window.setInterval(refresh, 60000);
  return () => {
    window.removeEventListener("storage", refresh);
    window.removeEventListener("focus", refresh);
    window.removeEventListener(quotaChanged, refresh);
    window.clearInterval(timer);
  };
}
function quotaSnapshot() {
  try {
    return remainingCvPreparations(window.localStorage);
  } catch {
    return null;
  }
}
const serverQuotaSnapshot = () => null;

export function CvAssistant({
  jobs,
  initialKey,
  aiEnabled,
}: {
  jobs: CvJob[];
  initialKey?: string;
  aiEnabled: boolean;
}) {
  const [selected, setSelected] = useState(
    jobs.some((j) => j.key === initialKey) ? initialKey! : jobs[0]?.key || "",
  );
  const [text, setText] = useState("");
  const [custom, setCustom] = useState("");
  const [result, setResult] = useState<ReturnType<typeof analyzeCv> | null>(
    null,
  );
  const [reading, setReading] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const remaining = useSyncExternalStore(
    subscribeToQuota,
    quotaSnapshot,
    serverQuotaSnapshot,
  );
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [adult, setAdult] = useState(false);
  const [advice, setAdvice] = useState<JobAdvice | null>(null);
  const [adviceSource, setAdviceSource] = useState<"gemini" | "profile">(
    "gemini",
  );
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const generation = useRef(0);
  const preparationRevision = useRef(0);
  const requestRef = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      generation.current++;
      preparationRevision.current++;
      requestRef.current?.abort();
    },
    [],
  );
  const publicJob = jobs.find((j) => j.key === selected);
  const job: CvJob = publicJob || {
    key: "local",
    title: "Puesto de tu elección",
    organization: "Análisis local",
    type: "Perfil personalizado",
    requirements: custom.trim() ? [custom] : [],
    summary: custom,
    href: "/convocatorias",
  };
  function clearResult() {
    preparationRevision.current++;
    setResult(null);
    setError("");
    setStatus("");
  }
  function changeJob(key: string) {
    requestRef.current?.abort();
    setAiBusy(false);
    setSelected(key);
    clearResult();
    setAdvice(null);
    setAiError("");
  }
  async function loadFile(file?: File) {
    if (!file) return;
    const current = ++generation.current;
    setReading(true);
    clearResult();
    try {
      const value = await readCvFile(file);
      if (current === generation.current) {
        setText(value);
        setStatus(
          "Texto extraído en tu dispositivo. Revísalo antes de analizarlo.",
        );
      }
    } catch (e) {
      if (current === generation.current)
        setError(
          e instanceof Error
            ? e.message
            : "No se pudo leer el archivo. Pega su texto.",
        );
    } finally {
      if (current === generation.current) setReading(false);
    }
  }
  async function analyze() {
    setError("");
    setStatus("");
    if (text.trim().length < 100) {
      setError("Añade al menos 100 caracteres de tu CV para poder revisarlo.");
      return;
    }
    if (text.length > 24000) {
      setError("El límite es de 24,000 caracteres.");
      return;
    }
    const revision = preparationRevision.current;
    function prepare() {
      if (revision !== preparationRevision.current) return;
      const available = reserveCvPreparation(window.localStorage);
      window.dispatchEvent(new Event(quotaChanged));
      if (available === null) {
        setError(
          "Ya usaste las 2 preparaciones de hoy. El cupo se renueva a medianoche, hora de Lima.",
        );
        return;
      }
      setResult(analyzeCv(text, job));
      setStatus(
        "Análisis terminado. Revisa los criterios y descarga tu borrador.",
      );
    }
    setPreparing(true);
    try {
      if (navigator.locks)
        await navigator.locks.request("convoca-cv-preparation", prepare);
      else prepare();
    } catch {
      if (revision === preparationRevision.current)
        setError(
          "No se pudo completar la preparación. Comprueba que tu navegador permita el almacenamiento local.",
        );
    } finally {
      setPreparing(false);
    }
  }
  function erase() {
    generation.current++;
    preparationRevision.current++;
    requestRef.current?.abort();
    setText("");
    setCustom("");
    setResult(null);
    setAdvice(null);
    setError("");
    setAiError("");
    setReading(false);
    setAiBusy(false);
    setStatus("Se borraron el CV y sus resultados de esta pantalla.");
    if (fileRef.current) fileRef.current.value = "";
  }
  async function getAdvice() {
    if (!publicJob || !adult || aiBusy) return;
    const controller = new AbortController();
    requestRef.current = controller;
    const current = selected;
    setAiBusy(true);
    setAiError("");
    setAdvice(null);
    try {
      const response = await fetch("/api/cv/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobKey: current, adult: true }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "No se pudieron obtener consejos.");
      setAdvice(validateAdvice(data.advice));
      setAdviceSource("gemini");
    } catch (e) {
      if (!controller.signal.aborted) {
        setAdvice(profileGuide(publicJob));
        setAdviceSource("profile");
        setAiError(
          (e instanceof Error ? e.message : "La IA no está disponible.") +
            " A continuación tienes una guía local basada en el perfil publicado.",
        );
      }
    } finally {
      if (!controller.signal.aborted) setAiBusy(false);
    }
  }
  function download() {
    if (!result) return;
    const blob = new Blob(
      [
        `Postulación a: ${job.title}\nEntidad: ${job.organization}\n\n${result.draft}`,
      ],
      { type: "text/plain;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mi-cv-revisado.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="container cv-workspace">
      <section className="cv-input-card" aria-labelledby="cv-input-title">
        <h2 id="cv-input-title">Prepara tu perfil</h2>
        <p>
          Elige el puesto, carga un archivo o pega tu CV. Podrás revisar su
          estructura y descargar un borrador con tus datos originales.
        </p>
        <div className="cv-field">
          <label htmlFor="cv-job">1. ¿A qué puesto quieres postular?</label>
          <select
            id="cv-job"
            value={selected}
            onChange={(e) => changeJob(e.target.value)}
          >
            <option value="">Otro puesto · introducir perfil</option>
            {jobs.map((j) => (
              <option key={j.key} value={j.key}>
                {j.title} · {j.organization}
                {j.sample ? " (muestra)" : ""}
              </option>
            ))}
          </select>
          {publicJob ? (
            <small>
              <Link className="text-link" href={publicJob.href}>
                Consultar requisitos y cómo postular →
              </Link>
            </small>
          ) : (
            <>
              <label htmlFor="cv-custom">Requisitos del puesto</label>
              <textarea
                id="cv-custom"
                value={custom}
                maxLength={6000}
                onChange={(e) => {
                  setCustom(e.target.value);
                  clearResult();
                }}
                placeholder="Pega los requisitos publicados por la entidad. Este texto se usa solo en tu navegador."
              />
              <small>El perfil personalizado no se envía a Gemini.</small>
            </>
          )}
        </div>
        <div className="cv-field">
          <label htmlFor="cv-file">2. Carga tu CV (opcional)</label>
          <input
            ref={fileRef}
            id="cv-file"
            className="cv-file-input"
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            disabled={reading}
            onChange={(e) => loadFile(e.target.files?.[0])}
          />
          <small>
            PDF con texto seleccionable o TXT UTF-8. Máximo 2 MB, 8 páginas y
            24,000 caracteres. No se sube el archivo.
          </small>
        </div>
        <div className="cv-field">
          <label htmlFor="cv-text">Texto de tu CV</label>
          <textarea
            id="cv-text"
            rows={12}
            value={text}
            disabled={reading}
            maxLength={24000}
            spellCheck={false}
            autoComplete="off"
            onChange={(e) => {
              setText(e.target.value);
              clearResult();
            }}
            aria-describedby="cv-text-help"
            placeholder="Pega tu perfil, formación, experiencia, habilidades y fechas…"
          />
          <small id="cv-text-help">
            {text.length.toLocaleString("es-PE")} / 24,000 caracteres. El
            contenido se mantiene en la memoria de esta pestaña y se pierde al
            recargar.
          </small>
        </div>
        <p className="cv-quota" id="cv-preparation-quota">
          {remaining === null
            ? `${CV_DAILY_PREPARATIONS} preparaciones al día en este navegador.`
            : `Preparaciones disponibles hoy: ${remaining} de ${CV_DAILY_PREPARATIONS}.`}{" "}
          El cupo se renueva a medianoche, hora de Lima.
        </p>
        <div className="cv-input-actions">
          <button
            className="button-primary"
            onClick={analyze}
            disabled={reading || preparing || remaining === 0}
            aria-describedby="cv-preparation-quota"
          >
            {reading
              ? "Leyendo en tu dispositivo…"
              : preparing
                ? "Preparando…"
                : remaining === 0
                  ? "Cupo diario agotado"
                  : "Analizar y preparar mi CV"}
            <Icon name="arrow" size={18} />
          </button>
          <button className="button-secondary" onClick={erase}>
            Borrar todo
          </button>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <p role="status" className="cv-disclaimer" aria-live="polite">
          {status ||
            "Privacidad: tu CV no se envía a Gemini, no se guarda en el servidor ni en el almacenamiento del navegador."}
        </p>
        <section className="cv-ai-panel" aria-labelledby="cv-ai-title">
          <h3 id="cv-ai-title">Orientación sobre el puesto con IA</h3>
          <p>
            Gemini puede explicar qué destacar a partir de los requisitos
            públicos. Solo se envían el título, entidad y perfil publicado; no
            tu CV ni el texto personalizado. Google puede utilizar esos datos
            públicos para mejorar sus servicios. Disponible para mayores de 18
            años.
          </p>
          <p>
            <a
              className="text-link"
              href="https://ai.google.dev/gemini-api/terms"
              target="_blank"
              rel="noopener noreferrer"
            >
              Condiciones del proveedor <Icon name="external" size={14} />
            </a>
          </p>
          <label className="cv-consent">
            <input
              type="checkbox"
              checked={adult}
              onChange={(e) => setAdult(e.target.checked)}
            />
            <span>
              Confirmo que soy mayor de 18 años y quiero consultar los
              requisitos públicos con Gemini.
            </span>
          </label>
          <button
            className="button-secondary"
            disabled={
              !aiEnabled ||
              !adult ||
              !publicJob ||
              publicJob.sample ||
              !publicJob.requirements.length ||
              aiBusy
            }
            onClick={getAdvice}
          >
            {aiBusy
              ? "Consultando requisitos…"
              : "Obtener consejos para este puesto"}
          </button>
          <p className="cv-disclaimer">
            {!aiEnabled
              ? "Los consejos de IA están desactivados por el momento."
              : !publicJob
                ? "Selecciona una convocatoria del portal para consultar a Gemini."
                : !publicJob.requirements.length
                  ? "Este puesto aún no tiene requisitos extraídos. Consulta primero las bases oficiales."
                  : "Gemini permite 2 consultas por conexión cada 24 horas y tiene un cupo diario compartido."}
          </p>
          <button
            className="text-link"
            type="button"
            disabled={!publicJob || aiBusy}
            onClick={() => {
              if (publicJob) {
                setAdvice(profileGuide(publicJob));
                setAdviceSource("profile");
                setAiError("");
              }
            }}
          >
            Ver guía del perfil sin usar IA <Icon name="arrow" size={16} />
          </button>
          {aiError && (
            <p role="status" className="cv-disclaimer">
              {aiError}
            </p>
          )}
          {advice && (
            <div aria-live="polite">
              <div className="cv-result-section">
                {adviceSource === "profile" && (
                  <p className="eyebrow">GUÍA LOCAL · REQUISITOS PUBLICADOS</p>
                )}
                <h3>Qué busca este perfil</h3>
                <p>{advice.overview}</p>
              </div>
              <div className="cv-result-section">
                <h3>Aspectos que puedes destacar si los acreditas</h3>
                <ul>
                  {advice.priorities.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                <div className="cv-keywords">
                  {advice.keywords.map((x) => (
                    <span key={x}>{x}</span>
                  ))}
                </div>
              </div>
              <div className="cv-result-section">
                <h3>Comprueba antes de postular</h3>
                <ul>
                  {advice.checklist.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
              <div className="cv-result-section">
                <h3>Preguntas para preparar tus ejemplos</h3>
                <ul>
                  {advice.questions.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
              <p className="cv-disclaimer">
                {adviceSource === "gemini"
                  ? "Contenido generado por IA: puede contener errores. No es una evaluación de tu candidatura. Confirma todo en las bases."
                  : "Guía local basada en los requisitos mostrados. No utiliza IA ni evalúa tu candidatura. Contrasta los datos con las bases vigentes."}
              </p>
            </div>
          )}
        </section>
      </section>
      <section className="cv-result-card" aria-labelledby="cv-result-title">
        {!result ? (
          <div className="cv-empty-result">
            <span className="assistant-symbol" aria-hidden="true">
              CV
            </span>
            <h2 id="cv-result-title">Una revisión clara, paso a paso</h2>
            <p>
              Recibirás una puntuación explicada, los términos del puesto que
              aparecen en tu texto y un borrador reorganizado para revisar.
            </p>
            <p className="cv-disclaimer">
              La puntuación orienta sobre estructura y coincidencias de texto.
              No reproduce un ATS real ni garantiza pasar filtros, cumplir
              requisitos o conseguir una entrevista.
            </p>
          </div>
        ) : (
          <>
            <p className="eyebrow">REVISIÓN LOCAL · {result.words} PALABRAS</p>
            <h2 id="cv-result-title">Tu CV, con criterios visibles</h2>
            <div className="cv-score">
              <div className="cv-score-number">
                <strong>{result.score}</strong>
                <small>sobre 100</small>
              </div>
              <div>
                <h3>Índice orientativo</h3>
                <p>
                  Estructura y lectura del texto extraído. Cada criterio aporta
                  los puntos que se muestran a continuación.
                </p>
              </div>
            </div>
            <ul className="cv-checklist">
              {result.checks.map((c) => (
                <li key={c.label}>
                  <div>
                    <span>{c.label}</span>
                    <span>
                      {c.points}/{c.possible}
                    </span>
                  </div>
                  <p>{c.advice}</p>
                </li>
              ))}
            </ul>
            {result.keywords.length > 0 && (
              <div className="cv-result-section">
                <h3>Palabras del puesto</h3>
                <p>
                  Coinciden {result.matched.length} de {result.keywords.length}{" "}
                  términos literales. Verde: presente. Ámbar: no identificado.
                  No se comprueban equivalencias ni nivel de dominio.
                </p>
                <div className="cv-keywords">
                  {result.keywords.map((k) => (
                    <span
                      key={k}
                      className={result.missing.includes(k) ? "is-missing" : ""}
                    >
                      {result.missing.includes(k)
                        ? "Por revisar: "
                        : "Presente: "}
                      {k}
                    </span>
                  ))}
                </div>
                {!job.requirements.length && (
                  <p>
                    Sin requisitos extraídos: se usan términos del título como
                    referencia y esta coincidencia no aporta puntos.
                  </p>
                )}
              </div>
            )}
            <div className="cv-result-section">
              <h3>Adapta el contenido con evidencias reales</h3>
              <p>
                Prioriza experiencias que demuestren los requisitos del puesto.
                En cada una explica qué hiciste, con qué herramienta y qué
                resultado puedes acreditar. Conserva tus cargos, empleadores,
                fechas y nivel de formación reales. Si falta un requisito, no lo
                añadas como si lo cumplieras.
              </p>
              <h3>Borrador para revisar y completar</h3>
              <p>
                Se reordenan secciones reconocidas; no se reescriben logros ni
                se comprueban tus antecedentes. Revisa saltos de línea,
                asociación entre empleadores y funciones, y el orden de fechas.
              </p>
              <div
                className="cv-generated-text"
                tabIndex={0}
                aria-label="Borrador reorganizado del CV"
              >
                Postulación a: {job.title}
                <br />
                Entidad: {job.organization}
                <br />
                <br />
                {result.draft}
              </div>
              <div className="cv-input-actions">
                <button className="button-primary" onClick={download}>
                  <Icon name="download" size={17} />
                  Descargar borrador TXT
                </button>
              </div>
            </div>
            <p className="cv-disclaimer">
              Los ATS varían por empresa. No se verifica el diseño original,
              tablas, columnas, certificaciones ni el cumplimiento legal de las
              bases. Usa el formato de CV y anexos exigido por la entidad.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
