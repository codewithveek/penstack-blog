"use client";

import { use, useState, type FormEvent } from "react";
import { authApi, ApiRequestError } from "@/lib/api-client";

export function MemberPortal({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ tab?: string }>;
}) {
  const { tab } = use(searchParamsPromise);
  const showPlans = tab === "plans";

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendLink(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Enter a valid email.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await authApi.sendMagicLink(email);
      setSent(true);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {showPlans ? (
          <PlansView />
        ) : sent ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="text-4xl mb-4">✉️</div>
            <h2 className="text-xl font-bold text-gray-900">
              Check your inbox
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              We sent a sign-in link to <strong>{email}</strong>. It expires in
              15 minutes.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h1 className="text-xl font-bold text-gray-900 mb-1">Sign in</h1>
            <p className="text-sm text-gray-500 mb-6">
              Enter your email to receive a sign-in link.
            </p>
            {error && (
              <p className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}
            <form
              onSubmit={(e) => void handleSendLink(e)}
              className="space-y-4"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition"
              >
                {loading ? "Sending…" : "Send sign-in link"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function PlansView() {
  const plans = [
    {
      name: "Free",
      price: "$0/mo",
      features: ["Read free posts", "Newsletter access"],
      cta: "Get started free",
      href: "/portal",
    },
    {
      name: "Paid",
      price: "$7/mo",
      features: [
        "Everything in Free",
        "Read members-only posts",
        "Support the publication",
      ],
      cta: "Subscribe",
      href: "/portal?tab=checkout",
      featured: true,
    },
  ];

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
        Choose a plan
      </h1>
      <div className="space-y-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-xl border p-6 ${plan.featured ? "border-indigo-300 bg-indigo-50" : "border-gray-200 bg-white"}`}
          >
            <h2 className="text-lg font-semibold text-gray-900">{plan.name}</h2>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {plan.price}
            </p>
            <ul className="mt-3 space-y-1">
              {plan.features.map((f) => (
                <li key={f} className="text-sm text-gray-600 flex gap-2">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
            <a
              href={plan.href}
              className={`mt-4 block w-full rounded-lg px-4 py-2 text-center text-sm font-semibold transition ${plan.featured ? "bg-indigo-600 text-white hover:bg-indigo-700" : "border border-gray-300 text-gray-700 hover:bg-gray-50"}`}
            >
              {plan.cta}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
