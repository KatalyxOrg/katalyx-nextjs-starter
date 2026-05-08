import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth, type Session } from "@/server/auth/auth";

export type AppRole = "admin" | "user";
export type OrgRole = "owner" | "admin" | "member";

/** Read the current session (or null) from cookies. Server-only. */
export async function getSession(): Promise<Session | null> {
  return auth.api.getSession({ headers: await headers() });
}

/** Require an authenticated session. Redirects to /sign-in if missing. */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }
  return session;
}

/**
 * Require the current user to hold one of the given application roles.
 * Default redirect target is `/dashboard` (use 403 page once available).
 */
export async function requireRole(role: AppRole | AppRole[]): Promise<Session> {
  const session = await requireSession();
  const allowed = Array.isArray(role) ? role : [role];
  const userRole = (session.user as { role?: string | null }).role ?? "user";
  if (!allowed.includes(userRole as AppRole)) {
    redirect("/dashboard");
  }
  return session;
}

/**
 * Require the user to be a member of `organizationId` with at least the given role.
 * Roles are ordered: owner > admin > member.
 */
export async function requireOrgRole(
  organizationId: string,
  role: OrgRole = "member"
): Promise<Session> {
  const session = await requireSession();
  const member = await auth.api.getActiveMember({
    headers: await headers(),
    query: { organizationId },
  });

  const order: Record<OrgRole, number> = { member: 0, admin: 1, owner: 2 };
  const memberRole = (member?.role ?? "") as OrgRole;
  if (!member || (order[memberRole] ?? -1) < order[role]) {
    redirect("/dashboard");
  }
  return session;
}
