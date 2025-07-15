import React from "react";

    //"#e40303", // Red
    //"#ff8c00", // Orange
    //"#ffed00", // Yellow
    //"#008026", // Green
    //"#004dff", // Blue
    //"#750787", // Purple
export function Loader({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <>
      <span className={`loader ${className}`} style={style}></span>
      <style>{`
        .loader {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 6rem;
          margin-top: 3rem;
          margin-bottom: 3rem;
        }
        .loader:before,
        .loader:after {
          content: "";
          position: absolute;
          border-radius: 50%;
          animation: pulsOut 1.8s ease-in-out infinite;
          filter: drop-shadow(0 0 1rem rgba(255, 255, 255, 0.75));
        }
        .loader:before {
          width: 100%;
          padding-bottom: 100%;
          box-shadow: inset 0 0 0 1rem #e40303;
          animation-name: pulsIn;
        }
        .loader:after {
          width: calc(100% - 2rem);
          padding-bottom: calc(100% - 2rem);
          box-shadow: 0 0 0 0 #e40303;
        }
        @keyframes pulsIn {
          0% {
            box-shadow: inset 0 0 0 1rem #008026;
            opacity: 1;
          }
          50%, 100% {
            box-shadow: inset 0 0 0 0 #fff;
            opacity: 0;
          }
        }
        @keyframes pulsOut {
          0%, 50% {
            box-shadow: 0 0 0 0 #e40303;
            opacity: 0;
          }
          100% {
            box-shadow: 0 0 0 1rem #750787;
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

