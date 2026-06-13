import Image from "next/image";

type ResponsiveImageProps = {
  src?: string;
  alt?: string;
  aspect?: string;
  sizes?: string;
  objectFit?: "cover" | "contain";
  priority?: boolean;
};

function shouldUsePlainImg(src: string) {
  return (
    src.includes("nexilup.test") ||
    src.includes("localhost") ||
    src.startsWith("http://")
  );
}

export function ResponsiveImage({
  src,
  alt,
  aspect = "1 / 1",
  sizes = "(min-width: 900px) 33vw, 100vw",
  objectFit = "cover",
  priority = false,
}: ResponsiveImageProps) {
  if (!src) {
    return (
      <div
        style={{
          aspectRatio: aspect,
          background: "#f8f3f1",
        }}
        aria-hidden="true"
      />
    );
  }

  if (shouldUsePlainImg(src)) {
    return (
      <div
        style={{
          position: "relative",
          aspectRatio: aspect,
          overflow: "hidden",
        }}
      >
        <img
          src={src}
          alt={alt || ""}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          style={{
            width: "100%",
            height: "100%",
            objectFit,
            display: "block",
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        aspectRatio: aspect,
        overflow: "hidden",
      }}
    >
      <Image
        src={src}
        alt={alt || ""}
        fill
        sizes={sizes}
        priority={priority}
        style={{ objectFit }}
      />
    </div>
  );
}
