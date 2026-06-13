import type { HTMLAttributes, ReactNode } from "react";
import styles from "./MaxWidthContainer.module.scss";

type MaxWidthContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  fluid?: boolean;
};

export default function MaxWidthContainer({
  children,
  fluid = false,
  className = "",
  ...props
}: MaxWidthContainerProps) {
  return (
    <div
      className={`${fluid ? styles.containerFluid : styles.container} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
