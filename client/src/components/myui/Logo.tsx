interface Props {
  height?: number;
  className?: string;
}

export function Logo({
  height = 128,
  className = "",
}: Props) {
  return (
    <img
      src="/vibrarian.jpg"
      alt="Vibrarian Logo"
      style={{ height, width: height }}
      className={`rounded-full border-4 border-primary p-1 object-cover ${className}`}
    />
  );
}
