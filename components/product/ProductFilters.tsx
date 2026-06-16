"use client";

import type { FormEvent, MouseEvent } from "react";
import { useMemo, useState } from "react";
import { Select } from "@/components/ui/Select";
import type { ProductFilterOption, ProductQuery } from "@/types/product.types";
import styles from "./ProductFilters.module.scss";

type ProductFiltersProps = {
  action?: string;
  values?: ProductQuery;
  q?: string;
  categories?: ProductFilterOption[];
  brands?: ProductFilterOption[];
  onChange?: (values: ProductQuery) => void;
  onReset?: () => void;
  isDrawer?: boolean;
};

const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 13500;
const FILTER_VISIBLE_LIMIT = 8;

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  );
}

function normalizePrice(value?: string, fallback = 0) {
  if (!value) return fallback;

  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

function formatPrice(value: number) {
  return `৳ ${value.toLocaleString("en-US")}`;
}

function clampPrice(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function buildSingleOrEmpty(current: string | undefined, selected: string) {
  return current === selected ? "" : selected;
}

function FilterCheckboxList({
  title,
  name,
  value,
  options,
  onSelect,
}: {
  title: string;
  name: keyof ProductQuery;
  value?: string;
  options?: ProductFilterOption[];
  onSelect: (name: keyof ProductQuery, value: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const visibleOptions = expanded
    ? options || []
    : (options || []).slice(0, FILTER_VISIBLE_LIMIT);
  const hasMore = Boolean(options && options.length > FILTER_VISIBLE_LIMIT);

  if (!options?.length) return null;

  return (
    <section className={styles.group}>
      <div className={styles.groupHead}>
        <h2>{title}</h2>
        <span aria-hidden="true" />
      </div>

      <div className={styles.checkboxList}>
        {visibleOptions.map((option) => {
          const checked = value === option.slug;

          return (
            <label
              className={styles.checkboxItem}
              key={`${name}-${option.slug}`}
            >
              <input
                type="checkbox"
                name={String(name)}
                value={option.slug}
                checked={checked}
                onChange={() =>
                  onSelect(name, buildSingleOrEmpty(value, option.slug))
                }
              />
              <span className={styles.fakeCheckbox} aria-hidden="true" />
              <strong>{option.name}</strong>
              {typeof option.count === "number" ? (
                <small>{option.count}</small>
              ) : null}
            </label>
          );
        })}
      </div>

      {hasMore ? (
        <button
          className={styles.seeMore}
          type="button"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "See less" : `See more ${title.toLowerCase()}`}
        </button>
      ) : null}
    </section>
  );
}
function hasAnyActiveFilter(values: ProductQuery, defaultSort = "latest") {
  return Boolean(
    values.search ||
    values.category ||
    values.brand ||
    values.min_price ||
    values.max_price ||
    values.stock_status ||
    (values.sort && values.sort !== defaultSort),
  );
}

function ClearFilterIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 5h18" />
      <path d="M6 12h12" />
      <path d="M10 19h4" />
      <path d="m17 7 4-4" />
      <path d="m21 7-4-4" />
    </svg>
  );
}
export function ProductFilters({
  action = "/products",
  values = {},
  q,
  categories = [],
  brands = [],
  onChange,
  onReset,
  isDrawer = false,
}: ProductFiltersProps) {
  const searchValue = values.search || q || "";
  const hasActiveFilters = hasAnyActiveFilter(values);
  const minPrice = normalizePrice(values.min_price, DEFAULT_MIN_PRICE);
  const maxPrice = normalizePrice(values.max_price, DEFAULT_MAX_PRICE);

  const safePrices = useMemo(() => {
    const min = clampPrice(minPrice, DEFAULT_MIN_PRICE, DEFAULT_MAX_PRICE);
    const max = clampPrice(maxPrice, DEFAULT_MIN_PRICE, DEFAULT_MAX_PRICE);

    return {
      min: Math.min(min, max),
      max: Math.max(min, max),
    };
  }, [minPrice, maxPrice]);

  const minPercent =
    ((safePrices.min - DEFAULT_MIN_PRICE) /
      (DEFAULT_MAX_PRICE - DEFAULT_MIN_PRICE)) *
    100;
  const maxPercent =
    ((safePrices.max - DEFAULT_MIN_PRICE) /
      (DEFAULT_MAX_PRICE - DEFAULT_MIN_PRICE)) *
    100;

  function updateValue(name: keyof ProductQuery, value: string) {
    onChange?.({
      ...values,
      [name]: value,
    });
  }

  function updatePriceRange(name: "min_price" | "max_price", value: string) {
    const nextValue = clampPrice(
      Number(value),
      DEFAULT_MIN_PRICE,
      DEFAULT_MAX_PRICE,
    );

    if (name === "min_price") {
      const nextMin = Math.min(nextValue, safePrices.max);
      updateValue(
        "min_price",
        nextMin === DEFAULT_MIN_PRICE ? "" : String(nextMin),
      );
      return;
    }

    const nextMax = Math.max(nextValue, safePrices.min);
    updateValue(
      "max_price",
      nextMax === DEFAULT_MAX_PRICE ? "" : String(nextMax),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (onChange) {
      event.preventDefault();
    }
  }

  function handleReset(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    onReset?.();
  }

  return (
    <form
      className={`${styles.form} ${isDrawer ? styles.drawerForm : ""}`}
      action={action}
      onSubmit={handleSubmit}
    >
      {isDrawer && hasActiveFilters ? (
        <button type="button" className={styles.clearAll} onClick={handleReset}>
          <span aria-hidden="true">
            <ClearFilterIcon />
          </span>
          Clear Filter
        </button>
      ) : null}

      <section className={styles.group}>
        <div className={styles.groupHead}>
          <h2>Search products</h2>
          <span aria-hidden="true" />
        </div>

        <label className={styles.searchField}>
          <span className="sr-only">Search products</span>
          <SearchIcon />
          <input
            name="search"
            value={searchValue}
            onChange={(event) =>
              updateValue("search", event.currentTarget.value)
            }
            placeholder="Search bags, wallets..."
            type="search"
            autoComplete="off"
          />
        </label>
      </section>

      <section className={styles.group}>
        <div className={styles.groupHead}>
          <h2>Sort products</h2>
          <span aria-hidden="true" />
        </div>

        <Select
          label="Sort"
          name="sort"
          {...(onChange
            ? {
                value: values.sort || "latest",
                onChange: (event) =>
                  updateValue("sort", event.currentTarget.value),
              }
            : { defaultValue: values.sort || "latest" })}
          options={[
            { label: "Latest", value: "latest" },
            { label: "Price low to high", value: "price_asc" },
            { label: "Price high to low", value: "price_desc" },
            { label: "Best selling", value: "best_selling" },
          ]}
        />
      </section>

      <section className={styles.group}>
        <div className={styles.groupHead}>
          <h2>Price range</h2>
          <span aria-hidden="true" />
        </div>

        <div className={styles.priceRangeBox}>
          <div className={styles.priceLabels}>
            <span>{formatPrice(safePrices.min)}</span>
            <span>{formatPrice(safePrices.max)}</span>
          </div>

          <div className={styles.rangeSlider}>
            <div className={styles.rangeTrack} aria-hidden="true" />
            <div
              className={styles.rangeProgress}
              style={{
                left: `${minPercent}%`,
                right: `${100 - maxPercent}%`,
              }}
              aria-hidden="true"
            />

            <input
              aria-label="Minimum price"
              type="range"
              min={DEFAULT_MIN_PRICE}
              max={DEFAULT_MAX_PRICE}
              step="50"
              value={safePrices.min}
              onChange={(event) =>
                updatePriceRange("min_price", event.currentTarget.value)
              }
            />
            <input
              aria-label="Maximum price"
              type="range"
              min={DEFAULT_MIN_PRICE}
              max={DEFAULT_MAX_PRICE}
              step="50"
              value={safePrices.max}
              onChange={(event) =>
                updatePriceRange("max_price", event.currentTarget.value)
              }
            />
          </div>

          <div className={styles.priceInputs}>
            <label>
              <span>Min</span>
              <input
                name="min_price"
                value={safePrices.min}
                onChange={(event) =>
                  updatePriceRange("min_price", event.currentTarget.value)
                }
                inputMode="numeric"
              />
            </label>
            <label>
              <span>Max</span>
              <input
                name="max_price"
                value={safePrices.max}
                onChange={(event) =>
                  updatePriceRange("max_price", event.currentTarget.value)
                }
                inputMode="numeric"
              />
            </label>
          </div>
        </div>
      </section>

      <FilterCheckboxList
        title="Category"
        name="category"
        value={values.category}
        options={categories}
        onSelect={updateValue}
      />

      <FilterCheckboxList
        title="Brand"
        name="brand"
        value={values.brand}
        options={brands}
        onSelect={updateValue}
      />

      <section className={styles.group}>
        <div className={styles.groupHead}>
          <h2>Availability</h2>
          <span aria-hidden="true" />
        </div>

        <Select
          label="Stock"
          name="stock_status"
          {...(onChange
            ? {
                value: values.stock_status || "",
                onChange: (event) =>
                  updateValue("stock_status", event.currentTarget.value),
              }
            : { defaultValue: values.stock_status || "" })}
          options={[
            { label: "Any", value: "" },
            { label: "In stock", value: "instock" },
            { label: "Out of stock", value: "outofstock" },
          ]}
        />
      </section>

      <div className={styles.actions}>
        {onChange ? (
          <button type="button" onClick={handleReset}>
            Reset filters
          </button>
        ) : (
          <>
            <button type="submit">Apply filters</button>
            <a href={action}>Reset</a>
          </>
        )}
      </div>
    </form>
  );
}
