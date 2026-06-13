import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function NotFound() {
  return <div className="container page-shell stack"><h1>Page not found</h1><p>The page may have moved, or the product is no longer available.</p><form action="/search"><Input label="Search" name="q" type="search" placeholder="Search products" /></form><Button href="/">Back to home</Button><Button href="/products" variant="secondary">Browse categories</Button></div>;
}
