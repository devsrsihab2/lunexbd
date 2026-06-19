import { Suspense } from "react";
import { HeroBanner } from "@/components/home/HeroBanner";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { AllProductsSection } from "@/components/home/AllProductsSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductGridSkeleton } from "@/components/product/ProductGridSkeleton";
import { getCategories } from "@/services/api/categories.api";
import { getHome } from "@/services/api/content.api";
import { getProducts } from "@/services/api/products.api";
import type { HomeBanner, MenuItem } from "@/types/content.types";
import { organizationSchema, websiteSchema } from "@/utils/schema";
import styles from "./page.module.scss";

const fallbackBanners: HomeBanner[] = [
  {
    title: "Made for every moment",
    subtitle: "Premium quality. Timeless style. Bags for every occasion.",
    image: "/lunex/hero-products.png",
    href: "/products",
    buttonText: "Shop Now",
  },
];

function getDesignReadyBanners(homeBanners?: HomeBanner[]) {
  const banners = homeBanners
    ?.map((banner) => {
      const image =
        banner.image ||
        banner.imageUrl ||
        banner.image_url ||
        (banner.id === "settings-hero" ? fallbackBanners[0].image : "");

      const href = banner.href || banner.link || banner.url || "/products";
      const buttonText = banner.buttonText || banner.button_text || "Shop Now";
      const scriptText =
        banner.scriptText || banner.script_text || "Designed for You,";
      const badgeText =
        banner.badgeText ||
        banner.badge_text ||
        "Timeless Design Endless Elegance";

      return { ...banner, image, href, buttonText, scriptText, badgeText };
    })
    .filter((banner) => {
      const signature =
        `${banner.title || ""} ${banner.image || ""}`.toLowerCase();

      return (
        banner.image &&
        !signature.includes("pickaboo") &&
        !signature.includes("best selling gadgets")
      );
    });

  return banners?.length ? banners : fallbackBanners;
}

async function HomeHeroSection() {
  const [home, categories] = await Promise.all([getHome(), getCategories()]);

  const categoryItems = categories.success
    ? categories.data.filter((category) => category.count !== 0).slice(0, 8)
    : [];

  const banners = getDesignReadyBanners(
    home.success ? home.data.banners : undefined,
  );

  const megaMenu: MenuItem[] =
    home.success && home.data.menus?.mega?.length
      ? home.data.menus.mega
      : categoryItems.map((category) => ({
          label: category.name,
          href: `/category/${category.slug}`,
        }));

  return (
    <>
      <HeroBanner banners={banners} menu={megaMenu} />

      <FeaturedCategories
        categories={home.success ? home.data.featuredCategories || [] : []}
      />
    </>
  );
}

async function HomeProductSection({
  title,
  text,
  actionHref,
  query,
}: {
  title: string;
  text: string;
  actionHref: string;
  query: Parameters<typeof getProducts>[0];
}) {
  const products = await getProducts(query);

  return (
    <section className={`${styles.section} ${styles.productSection}`}>
      <SectionHeader
        title={title}
        text={text}
        action={
          <Button href={actionHref} variant="secondary">
            View all
          </Button>
        }
      />

      <ProductGrid products={products.data} />
    </section>
  );
}

async function HomeAllProductsSection() {
  const allProducts = await getProducts({
    sort: "latest",
    page: "1",
    per_page: "8",
  });

  return (
    <AllProductsSection
      initialProducts={allProducts.data}
      initialPagination={allProducts.pagination}
    />
  );
}

function HomeProductFallback({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <section className={`${styles.section} ${styles.productSection}`}>
      <SectionHeader title={title} text={text} />
      <ProductGridSkeleton count={8} />
    </section>
  );
}

export default function HomePage() {
  return (
    <div className={styles.home}>
      <JsonLd data={[websiteSchema(), organizationSchema()]} />

      <Suspense fallback={<HeroBanner banners={fallbackBanners} menu={[]} />}>
        <HomeHeroSection />
      </Suspense>

      <Suspense
        fallback={
          <HomeProductFallback
            title="Latest products"
            text="Freshly added products from your WordPress catalog."
          />
        }
      >
        <HomeProductSection
          title="Latest products"
          text="Freshly added products from your WordPress catalog."
          actionHref="/products"
          query={{ sort: "latest", page: "1", per_page: "8" }}
        />
      </Suspense>

      <Suspense
        fallback={
          <HomeProductFallback
            title="Best selling products"
            text="Popular products customers are buying the most."
          />
        }
      >
        <HomeProductSection
          title="Best selling products"
          text="Popular products customers are buying the most."
          actionHref="/products?sort=best_selling"
          query={{ sort: "best_selling", page: "1", per_page: "8" }}
        />
      </Suspense>

      <Suspense
        fallback={
          <HomeProductFallback
            title="All Products"
            text="Browse all available products from our latest collection."
          />
        }
      >
        <HomeAllProductsSection />
      </Suspense>
    </div>
  );
}
