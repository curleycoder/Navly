type NavlyLogoProps = {
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light";
};

const sizes = {
  sm: {
    icon: 32,
    text: "text-2xl",
  },
  md: {
    icon: 42,
    text: "text-3xl",
  },
  lg: {
    icon: 56,
    text: "text-5xl",
  },
};

export function NavlyLogo({ showWordmark = true, size = "md", variant = "dark" }: NavlyLogoProps) {
  const currentSize = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <svg
        width={currentSize.icon}
        height={currentSize.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Navly logo"
        role="img"
      >
        {/* Left stroke of N */}
        <path
          d="M14 82V18H31V82H14Z"
          fill="#D62828"
        />

        {/* Diagonal middle stroke */}
        <path
          d="M27 18H44L67 57V82H53L27 38V18Z"
          fill="#D62828"
        />

        {/* Right stroke continuing into arrow */}
        <path
          d="M63 82V18H80V82H63Z"
          fill="#D62828"
        />

        {/* Up arrow coming from final stroke */}
        <path
          d="M71.5 6L93 30H80V58H63V30H50L71.5 6Z"
          fill="#D62828"
        />
      </svg>
      {showWordmark && (
        <span
          className={`
            ${currentSize.text}
            select-none
            font-[700]
            leading-none
            tracking-[-0.075em]
            ${variant === "light" ? "text-white" : "text-[#0B1F3A]"}
          `}
        >
          Navly
        </span>
      )}
    </div>
  );
}