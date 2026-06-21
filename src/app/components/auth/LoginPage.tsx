import { useState, type FormEvent } from "react";
import { Shield, UserPlus, LogIn } from "lucide-react";
import afspLogo from "../../../assets/afsp-logo.png";

type Role = "athlete" | "coach" | "admin";

interface LoginPayload {
  role: Role;
  email: string;
  password: string;
}

interface AthleteSignupPayload {
  name: string;
  email: string;
  password: string;
  sport: string;
}

interface AuthResult {
  success: boolean;
  message: string;
}

interface LoginPageProps {
  onLogin: (payload: LoginPayload) => AuthResult;
  onAthleteSignUp: (payload: AthleteSignupPayload) => AuthResult;
}

const roleLabels: Record<Role, string> = {
  athlete: "Athlete",
  coach: "Coach",
  admin: "Admin",
};

export function LoginPage({ onLogin, onAthleteSignUp }: LoginPageProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<Role>("athlete");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [sport, setSport] = useState("");
  const [feedback, setFeedback] = useState<AuthResult | null>(null);

  const clearAuthFields = () => {
    setEmail("");
    setPassword("");
  };

  const handleLogin = (event: FormEvent) => {
    event.preventDefault();
    const result = onLogin({
      role,
      email: email.trim(),
      password,
    });
    setFeedback(result);
    if (!result.success) return;
    clearAuthFields();
  };

  const handleSignup = (event: FormEvent) => {
    event.preventDefault();
    const result = onAthleteSignUp({
      name: name.trim(),
      email: email.trim(),
      password,
      sport: sport.trim(),
    });
    setFeedback(result);
    if (!result.success) return;
    setName("");
    setSport("");
    clearAuthFields();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card border border-border p-6 space-y-5">
        <div>
          <div className="mb-4 border border-border bg-secondary/40 p-3">
            <img src={afspLogo} alt="Authentikos Athletix Club" className="w-full h-auto object-contain" />
          </div>
          <div
            className="text-muted-foreground uppercase mb-1"
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.12em" }}
          >
            Authentication
          </div>
          <h1
            className="text-foreground uppercase"
            style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, lineHeight: 1, letterSpacing: "0.04em" }}
          >
            AFSP
            <br />
            <span className="text-primary">Access Portal</span>
          </h1>
          <p className="text-muted-foreground mt-2" style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem" }}>
            Athletes can sign up here. Coach and admin accounts are provisioned by administration.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setFeedback(null);
            }}
            className={`py-2 border uppercase transition-all cursor-pointer ${
              mode === "login" ? "bg-primary border-primary text-white" : "border-border text-muted-foreground hover:text-foreground"
            }`}
            style={{ fontFamily: "var(--font-display)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em" }}
          >
            <LogIn size={14} className="inline mr-1.5 -mt-0.5" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setRole("athlete");
              setFeedback(null);
            }}
            className={`py-2 border uppercase transition-all cursor-pointer ${
              mode === "signup" ? "bg-primary border-primary text-white" : "border-border text-muted-foreground hover:text-foreground"
            }`}
            style={{ fontFamily: "var(--font-display)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em" }}
          >
            <UserPlus size={14} className="inline mr-1.5 -mt-0.5" />
            Athlete Sign Up
          </button>
        </div>

        {mode === "login" ? (
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-muted-foreground uppercase mb-2" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.1em" }}>
                Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(roleLabels) as Role[]).map((targetRole) => (
                  <button
                    key={targetRole}
                    type="button"
                    onClick={() => setRole(targetRole)}
                    className={`py-2 border uppercase transition-all cursor-pointer ${
                      role === targetRole ? "bg-primary border-primary text-white" : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                    style={{ fontFamily: "var(--font-display)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em" }}
                  >
                    {roleLabels[targetRole]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-muted-foreground uppercase mb-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.1em" }}>
                Email
              </label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                className="w-full bg-secondary border border-border px-3 py-2 text-foreground focus:outline-none"
                style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem" }}
              />
            </div>
            <div>
              <label className="block text-muted-foreground uppercase mb-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.1em" }}>
                Password
              </label>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                className="w-full bg-secondary border border-border px-3 py-2 text-foreground focus:outline-none"
                style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem" }}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-primary text-white hover:opacity-90 transition-opacity cursor-pointer uppercase"
              style={{ fontFamily: "var(--font-display)", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.08em" }}
            >
              Continue as {roleLabels[role]}
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleSignup}>
            <div>
              <label className="block text-muted-foreground uppercase mb-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.1em" }}>
                Full Name
              </label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                type="text"
                className="w-full bg-secondary border border-border px-3 py-2 text-foreground focus:outline-none"
                style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem" }}
              />
            </div>
            <div>
              <label className="block text-muted-foreground uppercase mb-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.1em" }}>
                Sport
              </label>
              <input
                value={sport}
                onChange={(event) => setSport(event.target.value)}
                required
                type="text"
                className="w-full bg-secondary border border-border px-3 py-2 text-foreground focus:outline-none"
                style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem" }}
              />
            </div>
            <div>
              <label className="block text-muted-foreground uppercase mb-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.1em" }}>
                Email
              </label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                className="w-full bg-secondary border border-border px-3 py-2 text-foreground focus:outline-none"
                style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem" }}
              />
            </div>
            <div>
              <label className="block text-muted-foreground uppercase mb-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.1em" }}>
                Password
              </label>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                type="password"
                className="w-full bg-secondary border border-border px-3 py-2 text-foreground focus:outline-none"
                style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem" }}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-primary text-white hover:opacity-90 transition-opacity cursor-pointer uppercase"
              style={{ fontFamily: "var(--font-display)", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.08em" }}
            >
              Create Athlete Account
            </button>
          </form>
        )}

        {feedback && (
          <div
            className={`border px-3 py-2 ${feedback.success ? "border-[#4ade80]/30 text-[#4ade80] bg-[#4ade80]/10" : "border-destructive/30 text-destructive bg-destructive/10"}`}
            style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem" }}
          >
            <Shield size={14} className="inline mr-1.5 -mt-0.5" />
            {feedback.message}
          </div>
        )}
      </div>
    </div>
  );
}
