import * as React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const variants = {
    default: "btn-primary",
    destructive: "bg-risk-critical text-white hover:opacity-90 shadow-lg shadow-risk-critical/20",
    outline: "btn-secondary text-text-primary",
    ghost: "text-text-secondary hover:bg-bg-glass hover:text-text-primary",
    accent: "bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20 border border-accent-blue/20",
    purple: "bg-accent-purple/10 text-accent-purple hover:bg-accent-purple/20 border border-accent-purple/20",
  }
  const sizes = {
    default: "h-11 px-6 rounded-xl",
    sm: "h-9 px-4 rounded-lg text-xs",
    lg: "h-14 px-10 rounded-2xl text-base",
    icon: "h-10 w-10 rounded-xl",
  }
  
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-bold tracking-tight ring-offset-bg-primary transition-all duration-200 active:scale-[0.98] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-30",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
