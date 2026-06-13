import Link from "next/link";
import styles from "./Button.module.scss";

type ButtonProps = {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  fullWidth?: boolean;
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ href, children, variant = "primary", fullWidth, loading, className = "", ...props }: ButtonProps) {
  const classes = [styles.button, styles[variant], fullWidth ? styles.full : "", className].filter(Boolean).join(" ");

  if (href) {
    return (
      <Link className={classes} href={href} aria-disabled={props.disabled || loading}>
        {loading ? "Loading..." : children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={props.disabled || loading} {...props}>
      {loading ? "Loading..." : children}
    </button>
  );
}
