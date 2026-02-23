"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setupApi, ApiRequestError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AdminStep {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface SiteStep {
  title: string;
  description: string;
  url: string;
}

interface EmailStep {
  provider: "resend" | "smtp" | "skip";
  apiKey: string;
  fromEmail: string;
}

// ---------------------------------------------------------------------------
// Step indicators
// ---------------------------------------------------------------------------

const STEPS = ["Admin Account", "Site Info", "Email"] as const;

function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <li key={label} className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
              i < current
                ? "bg-indigo-600 text-white"
                : i === current
                  ? "border-2 border-indigo-600 text-indigo-600"
                  : "border-2 border-gray-200 text-gray-400"
            )}
          >
            {i < current ? "✓" : i + 1}
          </span>
          <span
            className={cn(
              "text-sm font-medium",
              i === current ? "text-gray-900" : "text-gray-400"
            )}
          >
            {label}
          </span>
          {i < STEPS.length - 1 && (
            <span className="mx-1 text-gray-300">›</span>
          )}
        </li>
      ))}
    </ol>
  );
}

// ---------------------------------------------------------------------------
// Step 1 – Admin account
// ---------------------------------------------------------------------------

function AdminStepForm({
  data,
  onChange,
  onNext,
}: {
  data: AdminStep;
  onChange: (d: AdminStep) => void;
  onNext: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  function validate() {
    if (!data.name.trim()) return "Name is required.";
    if (!data.email.includes("@")) return "Enter a valid email.";
    if (data.password.length < 8)
      return "Password must be at least 8 characters.";
    if (data.password !== data.confirmPassword)
      return "Passwords do not match.";
    return null;
  }

  function handleNext() {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    onNext();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Create your admin account
      </h2>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
      <Input
        label="Full name"
        value={data.name}
        onChange={(v) => onChange({ ...data, name: v })}
      />
      <Input
        label="Email"
        type="email"
        value={data.email}
        onChange={(v) => onChange({ ...data, email: v })}
      />
      <Input
        label="Password"
        type="password"
        value={data.password}
        onChange={(v) => onChange({ ...data, password: v })}
      />
      <Input
        label="Confirm password"
        type="password"
        value={data.confirmPassword}
        onChange={(v) => onChange({ ...data, confirmPassword: v })}
      />
      <NextButton onClick={handleNext} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 – Site info
// ---------------------------------------------------------------------------

function SiteStepForm({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: SiteStep;
  onChange: (d: SiteStep) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  function validate() {
    if (!data.title.trim()) return "Site title is required.";
    if (!data.url.startsWith("http"))
      return "Enter a valid URL (include https://).";
    return null;
  }

  function handleNext() {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    onNext();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Tell us about your site
      </h2>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
      <Input
        label="Site title"
        value={data.title}
        onChange={(v) => onChange({ ...data, title: v })}
      />
      <Input
        label="Tagline (optional)"
        value={data.description}
        onChange={(v) => onChange({ ...data, description: v })}
      />
      <Input
        label="Site URL"
        type="url"
        value={data.url}
        onChange={(v) => onChange({ ...data, url: v })}
        placeholder="https://yoursite.com"
      />
      <div className="flex gap-3">
        <BackButton onClick={onBack} />
        <NextButton onClick={handleNext} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3 – Email
// ---------------------------------------------------------------------------

function EmailStepForm({
  data,
  onChange,
  onSubmit,
  onBack,
  loading,
  error,
}: {
  data: EmailStep;
  onChange: (d: EmailStep) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Email settings</h2>
      <p className="text-sm text-gray-500">
        Configure how transactional emails are sent. You can change this later.
      </p>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email provider
        </label>
        <select
          value={data.provider}
          onChange={(e) =>
            onChange({
              ...data,
              provider: e.target.value as EmailStep["provider"],
            })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="resend">Resend</option>
          <option value="smtp">SMTP</option>
          <option value="skip">Skip for now</option>
        </select>
      </div>

      {data.provider !== "skip" && (
        <>
          <Input
            label={
              data.provider === "resend"
                ? "Resend API key"
                : "SMTP connection string"
            }
            value={data.apiKey}
            onChange={(v) => onChange({ ...data, apiKey: v })}
            placeholder={
              data.provider === "resend"
                ? "re_..."
                : "smtp://user:pass@host:587"
            }
          />
          <Input
            label="From email"
            type="email"
            value={data.fromEmail}
            onChange={(v) => onChange({ ...data, fromEmail: v })}
            placeholder="hello@yoursite.com"
          />
        </>
      )}

      <div className="flex gap-3">
        <BackButton onClick={onBack} />
        <button
          onClick={onSubmit}
          disabled={loading}
          className={cn(
            "flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition",
            loading ? "opacity-60 cursor-not-allowed" : "hover:bg-indigo-700"
          )}
        >
          {loading ? "Setting up…" : "Finish setup"}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared field components
// ---------------------------------------------------------------------------

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      />
    </div>
  );
}

function NextButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
    >
      Continue →
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
    >
      ← Back
    </button>
  );
}

// ---------------------------------------------------------------------------
// Wizard root
// ---------------------------------------------------------------------------

export function SetupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [adminData, setAdminData] = useState<AdminStep>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [siteData, setSiteData] = useState<SiteStep>({
    title: "",
    description: "",
    url: "",
  });

  const [emailData, setEmailData] = useState<EmailStep>({
    provider: "skip",
    apiKey: "",
    fromEmail: "",
  });

  async function handleFinish() {
    setLoading(true);
    setSubmitError(null);
    try {
      await setupApi.complete({
        admin: {
          name: adminData.name,
          email: adminData.email,
          password: adminData.password,
        },
        site: {
          title: siteData.title,
          description: siteData.description,
          url: siteData.url,
        },
        email:
          emailData.provider === "skip"
            ? null
            : {
                provider: emailData.provider,
                apiKey: emailData.apiKey,
                fromEmail: emailData.fromEmail,
              },
      });
      router.replace("/admin/login");
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Setup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-lg">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome to PenStack
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Let&apos;s get your site up and running
        </p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <StepIndicator current={step} />
        {step === 0 && (
          <AdminStepForm
            data={adminData}
            onChange={setAdminData}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && (
          <SiteStepForm
            data={siteData}
            onChange={setSiteData}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <EmailStepForm
            data={emailData}
            onChange={setEmailData}
            onSubmit={() => void handleFinish()}
            onBack={() => setStep(1)}
            loading={loading}
            error={submitError}
          />
        )}
      </div>
    </div>
  );
}
