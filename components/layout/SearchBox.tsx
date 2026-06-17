"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getProducts } from "@/services/api/products.api";
import type { Product } from "@/types/product.types";
import { formatPrice } from "@/utils/formatPrice";
import styles from "./Header.module.scss";

type SearchBoxProps = {
  id: string;
  mobile?: boolean;
  icon: React.ReactNode;
  alwaysOpen?: boolean;
};

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SearchBox({
  id,
  mobile = false,
  icon,
  alwaysOpen = false,
}: SearchBoxProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);
  const closeTimerRef = useRef<number | null>(null);

  const panelVisible = alwaysOpen || open || closing;
  const activeOpen = alwaysOpen || open;

  const resetSearchState = useCallback(() => {
    requestId.current += 1;
    setQuery("");
    setSuggestions([]);
    setLoading(false);
  }, []);

  const closeSearch = useCallback(() => {
    if (alwaysOpen) {
      resetSearchState();
      return;
    }

    if (!open && !closing) return;

    setOpen(false);
    setClosing(true);

    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = window.setTimeout(() => {
      setClosing(false);
      resetSearchState();
      closeTimerRef.current = null;
    }, 220);
  }, [alwaysOpen, closing, open, resetSearchState]);

  const openSearch = useCallback(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setClosing(false);
    setOpen(true);

    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!panelVisible) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Node)) return;
      if (formRef.current?.contains(target)) return;

      closeSearch();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeSearch();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeSearch, panelVisible]);

  useEffect(() => {
    const search = query.trim();

    if (search.length < 2) {
      requestId.current += 1;
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;

    const timeout = window.setTimeout(() => {
      if (currentRequestId !== requestId.current) return;

      setLoading(true);

      void (async () => {
        const response = await getProducts({
          search,
          per_page: "5",
          sort: "latest",
        });

        if (currentRequestId !== requestId.current) return;

        setLoading(false);
        setSuggestions(response.success ? response.data.slice(0, 5) : []);
      })();
    }, 220);

    return () => window.clearTimeout(timeout);
  }, [query]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const search = query.trim();

    if (!activeOpen) {
      openSearch();
      return;
    }

    if (!search) {
      inputRef.current?.focus();
      return;
    }

    router.push(`/products?search=${encodeURIComponent(search)}`);
    closeSearch();
  }

  return (
    <form
      ref={formRef}
      className={`${mobile ? styles.mobileSearch : styles.searchForm} ${
        alwaysOpen ? styles.searchDocked : ""
      } ${open ? styles.searchOpen : ""} ${
        closing ? styles.searchClosing : ""
      }`}
      onSubmit={submitSearch}
    >
      {!alwaysOpen && panelVisible ? (
        <div className={styles.mobileSearchHead}>
          <strong>Search Products</strong>

          <button
            className={styles.mobileSearchClose}
            type="button"
            aria-label="Close search"
            onClick={closeSearch}
          >
            <CloseIcon />
          </button>
        </div>
      ) : null}

      <label className="sr-only" htmlFor={id}>
        Search products
      </label>

      <input
        ref={inputRef}
        id={id}
        name="search"
        type="search"
        placeholder={
          mobile ? "Search bags, wallets and accessories" : "Search in..."
        }
        tabIndex={activeOpen ? 0 : -1}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        autoComplete="off"
      />

      <button
        className={styles.searchSubmitButton}
        type="submit"
        aria-label={activeOpen ? "Search products" : "Open search"}
        onClick={() => {
          if (!activeOpen) openSearch();
        }}
      >
        {icon}
      </button>

      {panelVisible && query.trim().length >= 2 ? (
        <div
          className={styles.suggestions}
          role="listbox"
          aria-label="Product suggestions"
        >
          {loading ? (
            <p className={styles.suggestionState}>Searching...</p>
          ) : suggestions.length ? (
            <>
              {suggestions.map((product) => (
                <Link
                  className={styles.suggestionItem}
                  href={`/product/${product.slug}`}
                  key={product.id}
                  onClick={closeSearch}
                >
                  <span className={styles.suggestionImage}>
                    {product.images?.[0]?.src ? (
                      <img
                        src={
                          product.images[0].thumbnail || product.images[0].src
                        }
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