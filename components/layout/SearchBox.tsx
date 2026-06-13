"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getProducts } from "@/services/api/products.api";
import type { Product } from "@/types/product.types";
import { formatPrice } from "@/utils/formatPrice";
import styles from "./Header.module.scss";

type SearchBoxProps = {
  id: string;
  mobile?: boolean;
  icon: React.ReactNode;
};

export function SearchBox({ id, mobile = false, icon }: SearchBoxProps) {
  const router = useRouter();
  const [open, setOpen] = useState(mobile);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    const search = query.trim();

    if (search.length < 2) {
      requestId.current += 1;
      return;
    }

    const id = requestId.current + 1;
    requestId.current = id;

    const timeout = window.setTimeout(() => {
      if (id !== requestId.current) return;

      setLoading(true);

      void (async () => {
        const response = await getProducts({
          search,
          per_page: "5",
          sort: "latest",
        });

        if (id !== requestId.current) return;

        setLoading(false);
        setSuggestions(response.success ? response.data.slice(0, 5) : []);
      })();
    }, 220);

    return () => window.clearTimeout(timeout);
  }, [query]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const search = query.trim();

    if (!open || !search) {
      setOpen(true);
      window.requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }

    setSuggestions([]);
    router.push(`/products?search=${encodeURIComponent(search)}`);
  }

  return (
    <form
      className={`${mobile ? styles.mobileSearch : styles.searchForm} ${
        open ? styles.searchOpen : ""
      }`}
      onSubmit={submitSearch}
      onBlur={(event) => {
        if (!mobile && !event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <label className="sr-only" htmlFor={id}>
        Search products
      </label>
      <input
        ref={inputRef}
        id={id}
        name="search"
        type="search"
        placeholder={mobile ? "Search bags, wallets and accessories" : "Search products"}
        tabIndex={open ? 0 : -1}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      <button
        type="submit"
        aria-label={open ? "Search products" : "Open search"}
        onClick={() => {
          if (!open) {
            setOpen(true);
            window.requestAnimationFrame(() => inputRef.current?.focus());
          }
        }}
      >
        {icon}
      </button>

      {open && query.trim().length >= 2 ? (
        <div className={styles.suggestions} role="listbox" aria-label="Product suggestions">
          {loading ? (
            <p className={styles.suggestionState}>Searching...</p>
          ) : suggestions.length ? (
            <>
              {suggestions.map((product) => (
                <Link
                  className={styles.suggestionItem}
                  href={`/product/${product.slug}`}
                  key={product.id}
                  onClick={() => setSuggestions([])}
                >
                  <span className={styles.suggestionImage}>
                    {product.images?.[0]?.src ? (
                      <img
                        src={product.images[0].thumbnail || product.images[0].src}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <b>{product.name.slice(0, 1)}</b>
                    )}
                  </span>
                  <span className={styles.suggestionText}>
                    <strong>{product.name}</strong>
                    <small>{formatPrice(product.price)}</small>
                  </span>
                </Link>
              ))}
              <button className={styles.viewResults} type="submit">
                View all results
              </button>
            </>
          ) : (
            <p className={styles.suggestionState}>No products found</p>
          )}
        </div>
      ) : null}
    </form>
  );
}
