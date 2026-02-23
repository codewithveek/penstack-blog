/**
 * packages/themes/themes/default/components/MembersGate.tsx
 *
 * Shown below the excerpt when a post requires membership / payment
 * and the current reader is not signed in.
 */

import * as React from "react";

interface MembersGateProps {
  /** "members" = free subscription required, "paid" = paid plan required */
  visibility: "members" | "paid";
  siteUrl: string;
  paidMembershipsEnabled: boolean;
}

export function MembersGate({
  visibility,
  siteUrl,
  paidMembershipsEnabled,
}: MembersGateProps) {
  const isPaid = visibility === "paid" && paidMembershipsEnabled;

  return (
    <div className="theme-members-gate">
      <h2 className="theme-members-gate__title">
        {isPaid
          ? "This post is for paying members"
          : "This post is for members only"}
      </h2>
      <p className="theme-members-gate__desc">
        {isPaid
          ? "Upgrade to a paid plan to read the full post and support independent publishing."
          : "Subscribe for free to read the full post and get access to all member content."}
      </p>
      <a
        href={`${siteUrl}/portal${isPaid ? "?tab=plans" : ""}`}
        className="theme-btn"
      >
        {isPaid ? "View plans" : "Subscribe for free"}
      </a>{" "}
      <a
        href={`${siteUrl}/portal?tab=signin`}
        className="theme-btn theme-btn--outline"
        style={{ marginLeft: 8 }}
      >
        Sign in
      </a>
    </div>
  );
}
