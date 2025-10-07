interface Props {
  size?: number;
  className?: string;
}

export function RainbowSpinner({
  size = 48,
  className = "",
}: Props) {
  // Rainbow Pride colors (classic 6-color flag)
  const prideColors = [
    "#e40303", // Red
    "#ff8c00", // Orange
    "#ffed00", // Yellow
    "#008026", // Green
    "#004dff", // Blue
    "#750787", // Purple
  ];

  // Each "circle" is positioned like a box-shadow at different angles
  // We'll use absolutely positioned colored dots around the circumference
  const dotCount = prideColors.length;
  const radius = size * 0.4;
  const dotSize = size * 0.22;

  const dots = prideColors.map((color, i) => {
    const angle = (i / dotCount) * 2 * Math.PI - Math.PI / 2; // start at top
    const x = size / 2 + radius * Math.cos(angle) - dotSize / 2;
    const y = size / 2 + radius * Math.sin(angle) - dotSize / 2;
    return (
      <span
        key={color}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          background: color,
          filter: "drop-shadow(0 0 6px " + color + "55)",
          opacity: 0.93,
          animation: `pride-spinner-dot 1.2s cubic-bezier(.7,0,.3,1) infinite`,
          animationDelay: `${(i / dotCount) * 1.2}s`,
        }}
      />
    );
  });

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          width: size,
          height: size,
          animation: "pride-spinner-rotate 1.2s linear infinite",
        }}
      >
        {dots}
      </div>
      <style>{`
        @keyframes pride-spinner-rotate {
          100% { transform: rotate(360deg);}
        }
        @keyframes pride-spinner-dot {
          0%, 100% { opacity: 0.4; }
          30%      { opacity: 1; }
          60%      { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
