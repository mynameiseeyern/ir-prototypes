import {
  Avatar, AvatarImage, AvatarFallback,
  Sidebar, SidebarBrand, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuLabel, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
} from "@ir/ui"
import { adminNav, allowedChildren, docNav, productNav, todayNav, type NavItem, type PageId } from "@/nav"
import { useViewer } from "@/lib/viewer"
import { clarionBrand, irisBrand } from "@/lib/brand"
import type { Permissions } from "@ir/mock-data/access"

/** Product marks for the Products group (each product's own brand artwork). */
const productArt: Partial<Record<PageId, string>> = { clarion: clarionBrand }

/**
 * The Iris admin portal's sidebar, on Picasso's Sidebar. Administration, then each
 * product with its own pages (one level of nesting, per Picasso's sidebar guidance),
 * then today's portal and docs for reference. Everything is filtered by the
 * signed-in person's access, so an empty group disappears.
 */
export function AdminSidebar({ active, onNavigate }: { active: PageId; onNavigate: (id: PageId) => void }) {
  const { perm } = useViewer()
  return (
    <Sidebar mobile="drawer" mobileLabel="Iris navigation">
      <SidebarHeader variant="brand">
        <SidebarBrand image={irisBrand} mark="I">Iris</SidebarBrand>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup label="Administration" items={adminNav} perm={perm} active={active} onNavigate={onNavigate} />
        <NavGroup label="Products" items={productNav} perm={perm} active={active} onNavigate={onNavigate} products />
        <NavGroup label="Today's portal" items={todayNav} perm={perm} active={active} onNavigate={onNavigate} className="mt-auto" />
        <NavGroup label="Docs" items={docNav} perm={perm} active={active} onNavigate={onNavigate} />
      </SidebarContent>

      <SidebarFooter>
        {/* IR logo, bottom-left (min 'i' height ≈20px per brand book) */}
        <div className="flex items-start p-2">
          <img src="/ir-logo.png" alt="Integrated Research" className="h-6 w-auto dark:hidden" />
          <img src="/ir-logo-white.png" alt="Integrated Research" className="hidden h-6 w-auto dark:block" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

function NavGroup({ label, items, perm, active, onNavigate, className, products }: {
  label: string
  items: NavItem[]
  perm: Permissions
  active: PageId
  onNavigate: (id: PageId) => void
  className?: string
  products?: boolean
}) {
  const shown = items.map((item) => ({ item, kids: allowedChildren(item, perm) })).filter((x) => x.kids.length)
  if (!shown.length) return null
  return (
    <SidebarGroup className={className}>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {shown.map(({ item, kids }) => {
          const nested = !!item.children
          const here = kids.some((k) => k.id === active)
          return (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton active={!nested && here} onClick={() => onNavigate(kids[0].id)} title={item.label}>
                {products ? (
                  <Avatar size="xs" className="size-4 text-[10px]">
                    {productArt[item.id] && <AvatarImage src={productArt[item.id]} alt="" />}
                    <AvatarFallback>{item.label[0]}</AvatarFallback>
                  </Avatar>
                ) : item.icon ? <item.icon aria-hidden /> : null}
                <SidebarMenuLabel>{item.label}</SidebarMenuLabel>
              </SidebarMenuButton>
              {nested && (
                <SidebarMenuSub variant="border">
                  {kids.map((k) => (
                    <SidebarMenuSubItem key={k.id}>
                      <SidebarMenuSubButton active={k.id === active} onClick={() => onNavigate(k.id)}>{k.label}</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              )}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
