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
  site_name: string;
  site_slug: string;
  site_description: string;
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
      <PasswordInput
        label="Password"
        value={data.password}
        onChange={(v) => onChange({ ...data, password: v })}
      />
      <PasswordInput
        label="Confirm password"
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
    if (!data.site_name.trim()) return "Site title is required.";
    if (!data.site_slug.trim()) return "Subdomain is required.";
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.site_slug))
      return "Subdomain must be lowercase letters, numbers, and hyphens only.";
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
        value={data.site_name}
        onChange={(v) => onChange({ ...data, site_name: v })}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subdomain
        </label>
        <div className="flex items-center">
          <input
            type="text"
            value={data.site_slug}
            onChange={(e) =>
              onChange({
                ...data,
                site_slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
              })
            }
            placeholder="my-blog"
            className="flex-1 rounded-l-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          <span className="inline-flex items-center rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500">
            .penstack.com
          </span>
        </div>
      </div>
      <Input
        label="Tagline (optional)"
        value={data.site_description}
        onChange={(v) => onChange({ ...data, site_description: v })}
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

function PasswordInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
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
    site_name: "",
    site_slug: "",
    site_description: "",
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
          site_name: siteData.site_name,
          site_slug: siteData.site_slug,
          site_description: siteData.site_description || undefined,
        },
        email:
          emailData.provider === "skip"
            ? undefined
            : {
                service_type: emailData.provider,
                api_key: emailData.apiKey,
                from_email: emailData.fromEmail,
                from_name: siteData.site_name,
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
