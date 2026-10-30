"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function EditorLogin({ configured }: { configured: boolean }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/editor/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "No se pudo iniciar sesión.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="admin-card editor-login">
      <p className="eyebrow">ACCESO EDITORIAL</p>
      <h1>Gestiona tu portal.</h1>
      <p>
        Publica convocatorias, prepara guías y atiende las consultas de tus
        lectores.
      </p>
      {configured ? (
        <form
          className="admin-form"
          method="post"
          action="/api/editor/session"
          onSubmit={submit}
        >
          <label>
            Correo del administrador
            <input type="email" name="email" autoComplete="username" required />
          </label>
          <label>
            Contraseña
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={12}
              maxLength={256}
            />
          </label>
          {error && (
            <p role="alert" className="notice notice-error">
              {error}
            </p>
          )}
          <button className="button-primary" disabled={busy} type="submit">
            {busy ? "Entrando…" : "Entrar al panel"}
          </button>
        </form>
      ) : (
        <div className="notice">
          El acceso editorial necesita configurarse. En local, ejecuta{" "}
          <code>npm run setup:local</code>. En Vercel, configura las variables
          privadas indicadas en la guía de publicación.
        </div>
      )}
    </section>
  );
}
