"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());

    try {
      const response = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        if (body.error === "email_in_use") throw new Error("Este e-mail já está cadastrado.");
        if (body.error === "invalid_credentials") throw new Error("E-mail ou senha inválidos.");
        throw new Error("Revise os dados informados.");
      }
      router.replace("/dashboard");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível autenticar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell auth-shell">
      <section className="auth-intro">
        <Link href="/" className="eyebrow">VINSETT FORGE AI</Link>
        <h1>Projetos com contexto, propriedade e histórico.</h1>
        <p>Entre para acessar seu workspace. Cada projeto fica isolado pelo usuário autenticado.</p>
      </section>

      <section className="auth-card">
        <div className="auth-tabs" role="tablist" aria-label="Autenticação">
          <button className={mode === "login" ? "tab active" : "tab"} onClick={() => setMode("login")} type="button">Entrar</button>
          <button className={mode === "register" ? "tab active" : "tab"} onClick={() => setMode("register")} type="button">Criar conta</button>
        </div>

        <form className="brief-form auth-form" onSubmit={submit}>
          {mode === "register" && (
            <label>Nome<input name="displayName" minLength={2} maxLength={80} required placeholder="Seu nome" autoComplete="name" /></label>
          )}
          <label>E-mail<input name="email" type="email" required placeholder="voce@exemplo.com" autoComplete="email" /></label>
          <label>Senha<input name="password" type="password" minLength={mode === "register" ? 10 : 1} required autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
          {mode === "register" && <p className="form-hint">Use ao menos 10 caracteres, com letras e números.</p>}
          <button className="primary button" disabled={loading}>{loading ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta"}</button>
          {error && <p className="error" role="alert">{error}</p>}
        </form>
      </section>
    </main>
  );
}
