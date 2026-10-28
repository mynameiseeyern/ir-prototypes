import {
  Home,
  Building2,
  Users,
  Box,
  CreditCard,
  MapPin,
  KeyRound,
  ShieldCheck,
  Network,
  ReceiptText,
  type LucideIcon,
} from "lucide-react"
import type { Permissions } from "@ir/mock-data/access"

/**
 * The Iris admin portal (client console) — RBAC strawman.
 *
 * One rule decides where things go: Administration is the organisation's (tenant
 * access levels govern it); each product's own records sit under that product
 * (product access levels govern them). So a Clarion admin limited to Sydney works
 * entirely under Products → Clarion and never opens Administration.
 *
 *   Administration   Home · Users (People, Groups, Access levels) · Locations · Sign-in · Organisation
 *   Products         Clarion (Overview, Widget users, Install) · Vantage
 *
 * Today's portal (admin.<env>.ir.com) stays reachable under its own group, so the
 * strawman can be compared with what ships. Old /admin/* and live-portal links
 * redirect (movedPaths).
 */
export type PageId =
  // Administration
  | "home" | "users" | "groups" | "roles" | "locations" | "sso" | "organisation"
  // Products
  | "clarion" | "widgetusers" | "install" | "vantage"
  // Today's portal, for comparison
  | "usermgmt" | "resources" | "account" | "billing"
  // Docs
  | "rbacdoc" | "groupsdoc" | "billingdoc"

export interface NavChild { id: PageId; label: string }
export interface NavItem { id: PageId; label: string; icon?: LucideIcon; children?: NavChild[] }

export const adminNav: NavItem[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "users", label: "Users", icon: Users, children: [
    { id: "users", label: "People" },
    { id: "groups", label: "Groups" },
    { id: "roles", label: "Access levels" },
  ] },
  { id: "locations", label: "Locations", icon: MapPin },
  { id: "sso", label: "Sign-in", icon: KeyRound },
  { id: "organisation", label: "Organisation", icon: Building2 },
]

/** Products the tenant has. Each owns its records and setup. */
export const productNav: NavItem[] = [
  { id: "clarion", label: "Clarion", children: [
    { id: "clarion", label: "Overview" },
    { id: "widgetusers", label: "Widget users" },
    { id: "install", label: "Install" },
  ] },
  { id: "vantage", label: "Vantage" },
]

/** The live portal as it ships today, kept for side-by-side comparison. */
export const todayNav: NavItem[] = [
  { id: "usermgmt", label: "User management", icon: Users },
  { id: "resources", label: "Resource centre", icon: Box },
  { id: "account", label: "Account", icon: Building2 },
  { id: "billing", label: "Billing & plans", icon: CreditCard },
]

export const docNav: NavItem[] = [
  { id: "rbacdoc", label: "Roles & permissions", icon: ShieldCheck },
  { id: "groupsdoc", label: "Groups & locations", icon: Network },
  { id: "billingdoc", label: "Subscription & billing", icon: ReceiptText },
]

/** Whether the signed-in person can open this page (RBAC). Docs are always open. */
export function pageAllowed(id: PageId, p: Permissions): boolean {
  switch (id) {
    case "home": return true
    case "users": case "groups": return p.seeAccess
    case "roles": return p.admin
    case "locations": return p.seeLocations
    case "sso": return p.seeSso
    case "organisation": case "account": case "billing": return p.seeTenant
    case "clarion": return p.seeClarion
    case "widgetusers": return p.manageWidgetUsers
    case "install": case "resources": return p.deployWidget
    case "vantage": return p.products.vantage.see
    case "usermgmt": return p.seeAccess || p.manageWidgetUsers
    default: return true
  }
}

/** A nav item's visible children, or the item itself when it has none. */
export const allowedChildren = (item: NavItem, p: Permissions): NavChild[] =>
  (item.children ?? [{ id: item.id, label: item.label }]).filter((c) => pageAllowed(c.id, p))

const sections = [
  { label: null, items: adminNav },
  { label: "Products", items: productNav },
  { label: "Today's portal", items: todayNav },
  { label: "Docs", items: docNav },
]

/** Breadcrumb levels between the tenant and the page, e.g. ["Users"] for Groups. */
export function pageTrail(id: PageId): string[] {
  for (const s of sections) for (const item of s.items) {
    const child = item.children?.find((c) => c.id === id)
    if (child) return [...(s.label && s.label !== "Products" ? [s.label] : []), item.label]
    if (item.id === id) return s.label && s.label !== "Products" ? [s.label] : []
  }
  return []
}

export const pageLabel = (id: PageId): string => {
  for (const s of sections) for (const item of s.items) {
    const child = item.children?.find((c) => c.id === id)
    if (child) return child.id === "clarion" ? "Clarion" : child.label
    if (item.id === id) return item.label
  }
  return "Home"
}

// One-line context under a page title. Only where it answers a question the title raises.
export const pageSubtitle: Partial<Record<PageId, string>> = {
  users: "Everyone who can sign in to Iris, and what they can access.",
  groups: "People get access through groups. Give a group an access level, then add people.",
  roles: "The access levels IR provides, and what each one allows. Give them to groups.",
  locations: "Shared by every product. Limit an access level to locations, and only those locations' records show.",
  sso: "Let people sign in with your company's identity provider, and give access from its groups.",
  clarion: "Insights Hub – access to the fleet dashboard, recommendations, tips and training content.",
  widgetusers: "Who can run the Clarion widget, where they work, and who uses a licence.",
  install: "Everything you and your team need to deploy the Clarion widget across your fleet.",
  vantage: "High-value payments monitoring: SWIFT, RTGS and the systems behind them. Placeholder product, to show how access scales.",
  usermgmt: "The live portal today, for comparison.",
  resources: "The live portal today, for comparison.",
  account: "The live portal today, for comparison.",
  billing: "The live portal today, for comparison.",
  rbacdoc: "How roles, scope and permissions work.",
  groupsdoc: "How groups and locations decide what each person sees.",
  billingdoc: "Plan entitlements, usage and payment model.",
}

// ---- URL routing (shareable per-page links) --------------------------------

export const pagePath: Record<PageId, string> = {
  home: "/",
  users: "/users",
  groups: "/users/groups",
  roles: "/users/access-levels",
  locations: "/locations",
  sso: "/sign-in",
  organisation: "/organisation",
  clarion: "/clarion",
  widgetusers: "/clarion/widget-users",
  install: "/clarion/install",
  vantage: "/vantage",
  usermgmt: "/today/users",
  resources: "/today/resource-centre",
  account: "/today/account",
  billing: "/today/billing",
  rbacdoc: "/admin/docs/roles",
  groupsdoc: "/admin/docs/groups",
  billingdoc: "/admin/docs/billing",
}

/** Paths that moved, and where they went. Covers old proposal links and the live portal's. */
const movedPaths: Record<string, PageId> = {
  "/admin": "home",
  "/admin/users": "users",
  "/admin/groups": "groups",
  "/admin/roles": "roles",
  "/admin/locations": "locations",
  "/admin/sso": "sso",
  "/admin/widget-users": "widgetusers",
  "/admin/subscription": "organisation",
  "/admin/widgets": "install",
  "/admin/audit": "home",
  "/account": "organisation",
  "/billing": "organisation",
  "/resource-centre": "install",
  "/product/clarion": "clarion",
  "/product/vantage": "vantage",
}

export const pageFromPath = (path: string, search = ""): PageId | null => {
  const clean = path.replace(/\/+$/, "") || "/"
  // The live portal's /users?tab=clarion is Clarion's widget users now.
  if (clean === "/users" && new URLSearchParams(search).get("tab") === "clarion") return "widgetusers"
  return (Object.keys(pagePath) as PageId[]).find((id) => pagePath[id] === clean) ?? movedPaths[clean] ?? null
}

// ---- Today's User management tabs (?tab=clarion, as in the live portal) -----

export type UserTab = "admins" | "clarion"
export const readUserTab = (search: string): UserTab =>
  new URLSearchParams(search).get("tab") === "clarion" ? "clarion" : "admins"

export const buildPath = (page: PageId, tab?: UserTab) =>
  page === "usermgmt" && tab === "clarion" ? `${pagePath[page]}?tab=clarion` : pagePath[page]
