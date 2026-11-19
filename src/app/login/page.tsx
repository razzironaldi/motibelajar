import Link from "next/link";
import LoginForm from "./login-form";

export const metadata = {
  title: "Masuk — MotiBelajar",
  description: "Masuk ke ruang belajar MotiBelajar.",
};

export default function LoginPage() {
  return (
    <main className="auth-page">
      <Link className="brand auth-brand" href="/">
        <span className="brand-mark">M</span><span>MotiBelajar</span>
      </Link>
      <section className="auth-card" aria-labelledby="login-title">
        <p className="eyebrow"><span className="eyebrow-dot" /> Ruang tumbuh siswa</p>
        <h1 id="login-title">Selamat datang<br /><em>kembali.</em></h1>
        <p className="auth-intro">Masuk untuk melanjutkan perjalanan belajar kamu.</p>
        <LoginForm />
      </section>
    </main>
  );
}
