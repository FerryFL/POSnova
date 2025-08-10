import * as React from "react"

// Simple utility function to combine class names
const combineClasses = (...classes: (string | undefined | boolean)[]): string => {
  return classes.filter(Boolean).join(" ")
}

interface SwitchProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  size?: "default" | "sm" | "lg"
  className?: string
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, disabled = false, size = "default" }, ref) => {
    let sizeClass: string
    let thumbSizeClass: string
    let translateClass: string

    // Determine size classes
    switch (size) {
      case "sm":
        sizeClass = "h-4 w-7"
        thumbSizeClass = "h-3 w-3"
        translateClass = checked ? "translate-x-3" : "translate-x-0"
        break
      case "lg":
        sizeClass = "h-7 w-12"
        thumbSizeClass = "h-6 w-6"
        translateClass = checked ? "translate-x-5" : "translate-x-0"
        break
      default:
        sizeClass = "h-6 w-11"
        thumbSizeClass = "h-5 w-5"
        translateClass = checked ? "translate-x-5" : "translate-x-0"
    }

    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked)
      }
    }

    const baseClasses = "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
    const backgroundClass = checked ? "bg-primary" : "bg-input"
    const thumbClasses = "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform"

    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        ref={ref}
        disabled={disabled}
        onClick={handleClick}
        className={combineClasses(baseClasses, backgroundClass, sizeClass, className)}
      >
        <div
          className={combineClasses(thumbClasses, thumbSizeClass, translateClass)}
        />
      </button>
    )
  }
)

Switch.displayName = "Switch"

export { Switch }
