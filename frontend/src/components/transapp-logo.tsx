import { cn } from "@/lib/utils"

type TransappLogoProps = {
  className?: string
  showWordmark?: boolean
}

export function TransappLogo({ className, showWordmark = true }: TransappLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill="none"
        className="size-8 shrink-0"
        aria-hidden={showWordmark}
        role={showWordmark ? "presentation" : "img"}
      >
        <title>{showWordmark ? undefined : "Transapp"}</title>
        <rect width="32" height="32" rx="8" className="fill-primary" />
        <path
          d="M8.5 11.5c0-1.1.9-2 2-2h4.8c1.1 0 2 .9 2 2v1.2c0 1.1-.9 2-2 2h-2.1l-1.2 1.8h5.3"
          className="stroke-primary-foreground"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M23.5 20.5c0 1.1-.9 2-2 2h-4.8c-1.1 0-2-.9-2-2v-1.2c0-1.1.9-2 2-2h2.1l1.2-1.8h-5.3"
          className="stroke-primary-foreground"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M13.2 16h5.6M16 13.2v5.6"
          className="stroke-primary-foreground"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      {showWordmark ? (
        <span className="text-foreground text-lg font-semibold tracking-tight">Transapp</span>
      ) : null}
    </span>
  )
}
