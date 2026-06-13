"use client";

import { useEffect } from "react";

export function useOutsideClick<T extends HTMLElement>(ref: React.RefObject<T | null>, onOutsideClick: () => void) {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutsideClick();
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onOutsideClick, ref]);
}
