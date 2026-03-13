import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-border-glass bg-bg-tertiary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-all focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-accent-blue/50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
