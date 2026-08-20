import React from "react";

interface MaterialIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  className?: string;
  size?: number | string;
  fill?: boolean;
}

export function MaterialIcon({
  name,
  className = "",
  size,
  fill = false,
  style,
  ...props
}: MaterialIconProps) {
  const customStyle: React.CSSProperties = {
    fontVariationSettings: fill ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
    fontSize: typeof size === "number" ? `${size}px` : size,
    display: "inline-block",
    lineHeight: 1,
    ...style,
  };

  return (
    <span
      className={`material-symbols-outlined select-none align-middle ${className}`}
      style={customStyle}
      {...props}
    >
      {name}
    </span>
  );
}
