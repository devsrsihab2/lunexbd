"use client";

import type { FormEvent, MouseEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { ProductQuery } from "@/types/product.types";
import styles from "./ProductFilters.module.scss";

type ProductFiltersProps = {
  action?: string;
  values?: ProductQuery;
  q?: string;
  onChange?: (values: ProductQuery) => void;
  onReset?: () => void;
};

export function ProductFilters({ action = "/products", values = {}, q, onChange, onReset }: ProductFiltersProps) {
  const searchValue = values.search || q || "";

  function updateValue(name: keyof ProductQuery, value: string) {
    onChange?.({
      ...values,
      [name]: value,
    });
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
    <form className={styles.form} action={action} onSubmit={handleSubmit}>
      <section className={styles.group}>
        <div className={styles.groupHead}>
          <h2>Filter by keyword</h2>
          <span aria-hidden="true" />
        </div>
        <Input
          label="Search"
          name="search"
          {...(onChange
            ? {
                value: searchValue,
                onChange: (event) => updateValue("search", event.currentTarget.value),
              }
            : { defaultValue: searchValue })}
          placeholder="Search products"
        />
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
                onChange: (event) => updateValue("sort", event.currentTarget.value),
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
        <div className={styles.range}>
          <Input
            label="Min price"
            name="min_price"
            {...(onChange
              ? {
                  value: values.min_price || "",
                  onChange: (event) => updateValue("min_price", event.currentTarget.value),
                }
              : { defaultValue: values.min_price || "" })}
            inputMode="numeric"
          />
          <Input
            label="Max price"
            name="max_price"
            {...(onChange
              ? {
                  value: values.max_price || "",
                  onChange: (event) => updateValue("max_price", event.currentTarget.value),
                }
              : { defaultValue: values.max_price || "" })}
            inputMode="numeric"
          />
        </div>
      </section>

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
                onChange: (event) => updateValue("stock_status", event.currentTarget.value),
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
          <button type="button" onClick={handleReset}>Reset filters</button>
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
