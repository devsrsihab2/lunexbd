import type { Metadata } from "next";
import { CartBootstrap } from "@/components/cart/CartBootstrap";
import { CartExperience } from "@/components/cart/CartExperience";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ToastContainer } from "@/components/ui/Toast";
import { getMenus, getSettings } from "@/services/api/content.api";
import { createMetadata } from "@/utils/seo";
import "./globals.scss";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  return createMetadata({
    siteName: settings.success ? settings.data.siteName : undefined,
    description: settings.success ? settings.data.tagline : undefined,
    favicon: settings.success ? settings.data.favicon : undefined,
  });
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [menus, settings] = await Promise.all([getMenus(), getSettings()]);

  return (
    <html lang="en">
      <body>
        <Header menu={menus.success ? menus.data.header : undefined} topMenu={menus.success ? menus.data.top : undefined} settings={settings.success ? settings.data : null} />
        <CartBootstrap />
        <CartExperience />
        <main>{children}</main>
        <Footer menu={menus.success ? menus.data.footer : undefined} settings={settings.success ? settings.data : null} />
        <ToastContainer />
      </body>
    </html>
  );
}
