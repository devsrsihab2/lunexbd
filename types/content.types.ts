export type SeoContent = {
  title?: string;
  description?: string;
  image?: string;
  robots?: string;
};

export type CmsPage = {
  id: number;
  slug: string;
  title: string;
  content: string;
  seo?: SeoContent;
};

export type BlogPost = CmsPage & {
  excerpt?: string;
  date?: string;
  author?: string;
  featuredImage?: string;
  categories?: string[];
};

export type BlogPostsQuery = {
  page?: string;
  per_page?: string;
  search?: string;
  category?: string;
  exclude?: string;
};

export type MenuItem = {
  label: string;
  href: string;
  children?: MenuItem[];
};

export type HomeBanner = {
  id?: number | string;
  title?: string;
  subtitle?: string;
  image?: string;
  imageUrl?: string;
  image_url?: string;
  href?: string;
  link?: string;
  url?: string;
  buttonText?: string;
  button_text?: string;
  scriptText?: string;
  script_text?: string;
  badgeText?: string;
  badge_text?: string;
};
export type FeaturedCategory = {
  id: number;
  name: string;
  slug: string;
  count?: number;
  href: string;
  image: string;
};
export type HomeContent = {
  banners: HomeBanner[];
  featuredCategories?: FeaturedCategory[];
  menus?: {
    top?: MenuItem[];
    header?: MenuItem[];
    mega?: MenuItem[];
    footer?: MenuItem[];
  };
};

export type SiteSettings = {
  siteName: string;
  logo?: string;
  footerLogo?: string;
  favicon?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  socialLinks?: { label: string; href: string }[];
  topBanner?: {
    text?: string;
    badge?: string;
    href?: string;
  };
  serviceBar?: {
    deliveryText?: string;
    deliveryHref?: string;
    returnsText?: string;
    returnsHref?: string;
    supportText?: string;
    supportHref?: string;
  };
  deals?: {
    label?: string;
    href?: string;
  };
};
