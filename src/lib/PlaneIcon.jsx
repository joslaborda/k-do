import React from 'react';

/**
 * PlaneIcon — avión vista superior (top-view silhouette)
 * Icono custom Kōdo para vuelos.
 */
export function PlaneIcon({ size = 24, color = 'currentColor', strokeWidth = 1.6, style, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className={className}
    >
      {/* fuselaje central */}
      <path d="M12 3 C13 3 14 4 14 6 L14 18 C14 20 13 21 12 21 C11 21 10 20 10 18 L10 6 C10 4 11 3 12 3Z"/>
      {/* alas principales */}
      <path d="M10 9 L3 13 L3 15 L10 13"/>
      <path d="M14 9 L21 13 L21 15 L14 13"/>
      {/* cola izquierda */}
      <path d="M10 17 L7 19 L7 20 L10 19"/>
      {/* cola derecha */}
      <path d="M14 17 L17 19 L17 20 L14 19"/>
    </svg>
  );
}

export default PlaneIcon;
