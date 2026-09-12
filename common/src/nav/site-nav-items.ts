export interface SiteNavItem {
  readonly id: string;
  readonly label: string;
  readonly path: string;
  readonly icon: string;
  readonly spa: boolean; // use in-app routing (`to`); false for full navigation (`href`), e.g. /guides/.
  readonly adminOnly?: boolean;
  readonly dividerBefore?: boolean; // insert a divider row before this item.
}

// keep labels, paths, icons, and flags in one place so SPA and guides stay aligned.
export const SITE_NAV_ITEMS: readonly SiteNavItem[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    icon: 'mdi-home',
    spa: true
  },
  {
    id: 'calculator',
    label: 'Calculator',
    path: '/calculator',
    icon: 'mdi-calculator',
    spa: true
  },
  {
    id: 'compare',
    label: 'Compare',
    path: '/compare',
    icon: 'mdi-compare-horizontal',
    spa: true
  },
  // {
  //   id: 'tierlist',
  //   label: 'Tier lists',
  //   path: '/tierlist',
  //   icon: 'mdi-podium',
  //   spa: true
  // },
  {
    id: 'recipes',
    label: 'Recipes',
    path: '/recipes',
    icon: 'mdi-food',
    spa: true
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: 'mdi-cog',
    spa: true
  },
  // {
  //   id: 'guides',
  //   label: 'Guides',
  //   path: '/guides/',
  //   icon: 'mdi-book-open-variant-outline',
  //   spa: false,
  //   dividerBefore: true
  // },
  {
    id: 'admin',
    label: 'Admin',
    path: '/admin',
    icon: 'mdi-shield-account',
    spa: true,
    adminOnly: true,
    dividerBefore: true
  }
];

export function siteNavItemsForFrontend(isAdmin: boolean): readonly SiteNavItem[] {
  return SITE_NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);
}

export function siteNavItemsForGuides(): readonly SiteNavItem[] {
  return SITE_NAV_ITEMS.filter((item) => !item.adminOnly);
}
