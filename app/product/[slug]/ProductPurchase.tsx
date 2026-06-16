"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { addCartItem, rememberCartProductImage } from "@/services/api/cart.api";
import { cartStore } from "@/store/cart.store";
import type {
  Product,
  ProductSwatchAttribute,
  ProductSwatchTerm,
  ProductVariation,
} from "@/types/product.types";
import styles from "./product-detail.module.scss";

type SelectedTerms = Record<string, ProductSwatchTerm>;

function normalize(value?: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/^attribute_/, "")
    .replace(/^pa_/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

function isStringKey(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getAttributeKey(attribute: ProductSwatchAttribute) {
  return (
    attribute.terms.find((term) => term.attribute)?.attribute ||
    attribute.taxonomy ||
    attribute.slug ||
    attribute.name
  );
}

function hasRealVariations(product: Product) {
  return Array.isArray(product.variations) && product.variations.length > 0;
}

function hasVariationAttributeData(product: Product) {
  return Boolean(
    product.variations?.some(
      (variation) =>
        variation.attributes && Object.keys(variation.attributes).length > 0,
    ),
  );
}

function getVariationAttributeValue(
  variation: ProductVariation,
  attribute: ProductSwatchAttribute,
) {
  const possibleKeys = [
    getAttributeKey(attribute),
    attribute.taxonomy,
    attribute.slug,
    attribute.name,
    attribute.taxonomy ? `attribute_${attribute.taxonomy}` : "",
    attribute.slug ? `attribute_pa_${attribute.slug}` : "",
    attribute.slug ? `pa_${attribute.slug}` : "",
  ].filter(isStringKey);

  for (const key of possibleKeys) {
    const directValue = variation.attributes?.[key];

    if (directValue) return directValue;
  }

  const normalizedKeys = possibleKeys.map(normalize);

  const matchedEntry = Object.entries(variation.attributes || {}).find(
    ([key]) => normalizedKeys.includes(normalize(key)),
  );

  return matchedEntry?.[1] || "";
}

function termMatchesValue(term: ProductSwatchTerm, value?: string) {
  return (
    normalize(term.slug) === normalize(value) ||
    normalize(term.name) === normalize(value)
  );
}

function variationMatchesSelection(
  variation: ProductVariation,
  swatches: ProductSwatchAttribute[],
  selectedTerms: SelectedTerms,
) {
  return swatches.every((attribute) => {
    const selectedTerm = selectedTerms[getAttributeKey(attribute)];

    if (!selectedTerm) return true;

    return termMatchesValue(
      selectedTerm,
      getVariationAttributeValue(variation, attribute),
    );
  });
}

function findSelectedVariation(
  product: Product,
  swatches: ProductSwatchAttribute[],
  selectedTerms: SelectedTerms,
) {
  if (!hasRealVariations(product) || !swatches.length) return undefined;

  const hasAllOptions = swatches.every((attribute) =>
    Boolean(selectedTerms[getAttributeKey(attribute)]),
  );

  if (!hasAllOptions) return undefined;

  return product.variations?.find((variation) =>
    variationMatchesSelection(variation, swatches, selectedTerms),
  );
}

function isOutOfStock(variation?: ProductVariation) {
  if (!variation) return false;

  const stock = normalize(variation.stockStatus);

  return (
    stock.includes("out-of-stock") ||
    stock.includes("outofstock") ||
    stock.includes("out-stock")
  );
}

function isTermAvailable(
  product: Product,
  swatches: ProductSwatchAttribute[],
  attribute: ProductSwatchAttribute,
  term: ProductSwatchTerm,
  selectedTerms: SelectedTerms,
) {
  if (!hasRealVariations(product)) return false;

  if (!hasVariationAttributeData(product)) return true;

  const nextSelectedTerms = {
    ...selectedTerms,
    [getAttributeKey(attribute)]: term,
  };

  return Boolean(
    product.variations?.some((variation) => {
      if (isOutOfStock(variation)) return false;

      return variationMatchesSelection(variation, swatches, nextSelectedTerms);
    }),
  );
}

function getFallbackSwatches(product: Product): ProductSwatchAttribute[] {
  return (product.attributes || [])
    .filter((attribute) => attribute.variation)
    .map((attribute) => ({
      name: attribute.name,
      slug: normalize(attribute.name),
      taxonomy: "",
      type: "button",
      terms: attribute.options.map((option) => ({
        id: null,
        name: option,
        slug: normalize(option),
        type: "button",
        color: "",
        image: "",
        taxonomy: "",
        attribute: attribute.name,
      })),
    }));
}

function getDisplayPrice(
  product: Product,
  selectedVariation?: ProductVariation,
) {
  return (
    selectedVariation?.salePrice ||
    selectedVariation?.price ||
    product.salePrice ||
    product.price
  );
}

function getDisplayRegularPrice(
  product: Product,
  selectedVariation?: ProductVariation,
) {
  return selectedVariation?.regularPrice || product.regularPrice || "";
}

function getDiscountPercent(price?: string, regularPrice?: string) {
  const current = Number(price);
  const regular = Number(regularPrice);

  if (
    !Number.isFinite(current) ||
    !Number.isFinite(regular) ||
    regular <= current
  ) {
    return null;
  }

  return Math.round(((regular - current) / regular) * 100);
}

export function ProductPurchase({ product }: { product: Product }) {
  const [selectedTerms, setSelectedTerms] = useState<SelectedTerms>({});
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  const isVariableProduct = product.type === "variable";
  const productHasRealVariations = hasRealVariations(product);

  const swatches = useMemo(() => {
    if (!isVariableProduct) return [];
    if (!productHasRealVariations) return [];
    if (product.swatches?.length) return product.swatches;

    return getFallbackSwatches(product);
  }, [isVariableProduct, product, productHasRealVariations]);

  const selectedVariation = useMemo(
    () => findSelectedVariation(product, swatches, selectedTerms),
    [product, selectedTerms, swatches],
  );

  const variationId = isVariableProduct ? selectedVariation?.id : undefined;

  const displayPrice = getDisplayPrice(product, selectedVariation);
  const displayRegularPrice = getDisplayRegularPrice(
    product,
    selectedVariation,
  );

  const shouldShowRegularPrice =
    displayRegularPrice && Number(displayRegularPrice) > Number(displayPrice);

  const discount = getDiscountPercent(displayPrice, displayRegularPrice);

  const canBuy =
    !isVariableProduct ||
    (productHasRealVariations &&
      Boolean(selectedVariation) &&
      !isOutOfStock(selectedVariation));

  const checkoutHref = `/checkout?productId=${product.id}${
    variationId ? `&variationId=${variationId}` : ""
  }&quantity=${quantity}`;

  function updateQuantity(value: number) {
    setQuantity(Math.max(1, Number.isFinite(value) ? value : 1));
  }

  function selectTerm(
    attribute: ProductSwatchAttribute,
    term: ProductSwatchTerm,
  ) {
    setError("");
    setAdded(false);

    setSelectedTerms((current) => ({
      ...current,
      [getAttributeKey(attribute)]: term,
    }));
  }

  function validateSelection() {
    if (!isVariableProduct) return true;

    if (!productHasRealVariations) {
      setError(
        "This variable product has no generated variations yet. Please generate variations from WooCommerce admin first.",
      );
      return false;
    }

    const missingAttribute = swatches.find(
      (attribute) => !selectedTerms[getAttributeKey(attribute)],
    );

    if (missingAttribute) {
      setError(`Please choose ${missingAttribute.name}.`);
      return false;
    }

    if (!selectedVariation) {
      setError(
        "This variation is not available. Please choose another option.",
      );
      return false;
    }

    if (isOutOfStock(selectedVariation)) {
      setError("This variation is out of stock.");
      return false;
    }

    return true;
  }

  async function handleAddToCart() {
    if (isAdding) return;
    if (!validateSelection()) return;

    setIsAdding(true);
    setAdded(false);
    setError("");

    cartStore.setState({
      ...cartStore.getSnapshot(),
      loading: true,
      error: undefined,
    });

    rememberCartProductImage(
      product.id,
      selectedVariation?.image || product.images?.[0],
      variationId,
    );

    const response = await addCartItem({
      productId: product.id,
      variationId,
      quantity,
      variation: selectedVariation?.attributes,
    });

    if (response.success) {
      cartStore.setState({
        ...cartStore.getSnapshot(),
        cart: response.data,
        loading: false,
        error: undefined,
      });

      setAdded(true);
      window.setTimeout(() => setAdded(false), 1400);
    } else {
      const message = response.message || "Could not add this product.";

      setError(message);
      cartStore.setState({
        ...cartStore.getSnapshot(),
        loading: false,
        error: message,
      });
    }

    setIsAdding(false);
  }

  return (
    <>
      <div className={styles.priceRow}>
        <span className={styles.price}>
          <Price value={displayPrice} />
        </span>

        {shouldShowRegularPrice ? (
          <span className={styles.regularPrice}>
            <Price value={displayRegularPrice} />
          </span>
        ) : null}

        {discount ? (
          <span className={styles.save}>Save {discount}%</span>
        ) : null}
      </div>

      {isVariableProduct && !productHasRealVariations ? (
        <p className={styles.actionMessage} role="alert">
          This variable product has no generated variations yet. Please generate
          variations from WooCommerce admin first.
        </p>
      ) : null}

      {swatches.length ? (
        <div className={styles.swatches}>
          {swatches.map((attribute) => {
            const attributeKey = getAttributeKey(attribute);
            const selectedTerm = selectedTerms[attributeKey];

            return (
              <div className={styles.swatchGroup} key={attributeKey}>
                <div className={styles.swatchHeader}>
                  <span>{attribute.name}</span>
                  {selectedTerm ? <strong>{selectedTerm.name}</strong> : null}
                </div>

                <div className={styles.swatchOptions}>
                  {attribute.type === "select" ? (
                    <select
                      className={styles.swatchSelect}
                      value={selectedTerm?.slug || ""}
                      onChange={(event) => {
                        const term = attribute.terms.find(
                          (item) => item.slug === event.target.value,
                        );

                        if (term) selectTerm(attribute, term);
                      }}
                    >
                      <option value="">Choose {attribute.name}</option>

                      {attribute.terms.map((term) => {
                        const available = isTermAvailable(
                          product,
                          swatches,
                          attribute,
                          term,
                          selectedTerms,
                        );

                        return (
                          <option
                            disabled={!available}
                            key={term.slug}
                            value={term.slug}
                          >
                            {term.name}
                          </option>
                        );
                      })}
                    </select>
                  ) : null}

                  {attribute.type !== "select"
                    ? attribute.terms.map((term) => {
                        const selected = selectedTerm?.slug === term.slug;
                        const available = isTermAvailable(
                          product,
                          swatches,
                          attribute,
                          term,
                          selectedTerms,
                        );

                        const className = [
                          styles.swatchOption,
                          attribute.type === "color" ? styles.swatchColor : "",
                          attribute.type === "image" ? styles.swatchImage : "",
                          attribute.type === "button"
                            ? styles.swatchButton
                            : "",
                          attribute.type === "radio" ? styles.swatchRadio : "",
                          selected ? styles.swatchSelected : "",
                          !available ? styles.swatchDisabled : "",
                        ]
                          .filter(Boolean)
                          .join(" ");

                        if (attribute.type === "radio") {
                          return (
                            <label
                              className={className}
                              key={term.slug}
                              title={term.name}
                            >
                              <input
                                checked={selected}
                                disabled={!available}
                                name={attributeKey}
                                type="radio"
                                value={term.slug}
                                onChange={() => selectTerm(attribute, term)}
                              />
                              <span>{term.name}</span>
                            </label>
                          );
                        }

                        return (
                          <button
                            className={className}
                            disabled={!available}
                            key={term.slug}
                            title={term.name}
                            type="button"
                            onClick={() => selectTerm(attribute, term)}
                          >
                            {attribute.type === "color" ? (
                              <>
                                <span
                                  className={styles.swatchColorInner}
                                  style={{
                                    backgroundColor: term.color || "#f3f3f3",
                                  }}
                                />
                                <span className={styles.visuallyHidden}>
                                  {term.name}
                                </span>
                              </>
                            ) : null}

                            {attribute.type === "image" ? (
                              term.image ? (
                                <img src={term.image} alt={term.name} />
                              ) : (
                                <span>{term.name}</span>
                              )
                            ) : null}

                            {attribute.type === "button" ? (
                              <span>{term.name}</span>
                            ) : null}
                          </button>
                        );
                      })
                    : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className={styles.quantityRow}>
        <label htmlFor="quantity">Quantity:</label>

        <div className={styles.quantityControl}>
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => updateQuantity(quantity - 1)}
          >
            -
          </button>

          <input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(event) => updateQuantity(Number(event.target.value))}
            aria-label="Quantity"
          />

          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => updateQuantity(quantity + 1)}
          >
            +
          </button>
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          type="button"
          onClick={handleAddToCart}
          loading={isAdding}
          disabled={!canBuy}
        >
          {added ? "Added" : "Add to Cart"}
        </Button>

        <Button
          href={canBuy ? checkoutHref : "#"}
          variant="secondary"
          disabled={!canBuy}
        >
          Buy Now
        </Button>
      </div>

      {error ? (
        <p className={styles.actionMessage} role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}
