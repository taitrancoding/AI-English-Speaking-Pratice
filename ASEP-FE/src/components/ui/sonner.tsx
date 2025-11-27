// src/components/ui/sonner.tsx
import React, { useEffect, useState } from "react";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const useTheme = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system");

  useEffect(() => {
    // Cập nhật class cho HTML root để Tailwind nhận diện dark/light
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "dark") root.classList.add("dark");
    else if (theme === "light") root.classList.add("light");

    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme };
};

export const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { toast };
