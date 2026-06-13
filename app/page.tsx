import { connection } from "next/server";
import { HeroBanner } from "@/components/home/HeroBanner";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { AllProductsSection } from "@/components/home/AllProductsSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProductGrid } from "@/components/product/ProductGrid";
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

export default async function HomePage() {
  await connection();

  const [home, categories, latest, bestSelling, allProducts] =
    await Promise.all([
      getHome(),
      getCategories(),
      getProducts({ sort: "latest", page: "1", per_page: "8" }),
      getProducts({ sort: "best_selling", page: "1", per_page: "8" }),
      getProducts({ sort: "latest", page: "1", per_page: "8" }),
    ]);

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
    <div className={styles.home}>
      <JsonLd data={[websiteSchema(), organizationSchema()]} />

      <HeroBanner banners={banners} menu={megaMenu} />

      <FeaturedCategories
        categories={home.success ? home.data.featuredCategories || [] : []}
      />

      <section className={`${styles.section} ${styles.productSection}`}>
        <SectionHeader
          title="Latest products"
          text="Freshly added products from your WordPress catalog."
          action={
            <Button href="/products" variant="secondary">
              View all
            </Button>
          }
        />

        <ProductGrid products={latest.data} />
      </section>

      <section className={`${styles.section} ${styles.productSection}`}>
        <SectionHeader
          title="Best selling products"
          text="Popular products customers are buying the most."
          action={
            <Button href="/products?sort=best_selling" variant="secondary">
              View all
            </Button>
          }
        />

        <ProductGrid products={bestSelling.data} />
      </section>

      <AllProductsSection
        initialProducts={allProducts.data}
        initialPagination={allProducts.pagination}
      />
    </div>
  );
}
