import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolved, toggle } = useTheme();
  const isDark = resolved === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={cn(
        "relative w-9 h-9 rounded-lg transition-all duration-300",
        "hover:bg-primary/10 hover:text-primary",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <Sun className={cn(
        "absolute w-4 h-4 transition-all duration-300",
        isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-0"
      )} />
      <Moon className={cn(
        "absolute w-4 h-4 transition-all duration-300",
        isDark ? "opacity-0 -rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
      )} />
    </Button>
  );
}
