"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    // Get button position
    const button = buttonRef.current
    if (!button) {
      setTheme(theme === "dark" ? "light" : "dark")
      return
    }

    const rect = button.getBoundingClientRect()
    const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100
    const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100

    const styleId = `theme-transition-${Date.now()}`
    const style = document.createElement("style")
    style.id = styleId

    // Circle Blur animation from button position
    const css = `
      @supports (view-transition-name: root) {
        ::view-transition-old(root) {
          animation: none;
          z-index: -1;
        }
        ::view-transition-new(root) {
          animation: scale 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
      }
      @keyframes scale {
        from {
          clip-path: circle(0% at ${x}% ${y}%);
          filter: blur(8px);
        }
        to {
          clip-path: circle(200% at ${x}% ${y}%);
          filter: blur(0);
        }
      }
    `

    style.textContent = css
    document.head.appendChild(style)

    // @ts-ignore
    if (!document.startViewTransition) {
      setTheme(theme === "dark" ? "light" : "dark")
      return
    }

    // @ts-ignore
    document.startViewTransition(() => {
      setTheme(theme === "dark" ? "light" : "dark")
    }).finished.finally(() => {
      document.getElementById(styleId)?.remove()
    })
  }, [theme, setTheme])

  return (
    <Button
      ref={buttonRef}
      variant="outline"
      size="icon"
      onClick={handleClick}
      aria-label="Toggle theme"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
