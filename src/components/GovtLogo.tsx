import React from 'react';

interface GovtLogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'emblem-only';
  inverted?: boolean;
}

/**
 * Official Ministry of Youth Affairs and Sports + My Bharat Logo
 * Matching the authentic Government of India branding
 */
export const GovtLogo: React.FC<GovtLogoProps> = ({
  className = 'h-12 w-auto',
  variant = 'full',
  inverted = false,
}) => {
  const textColor = inverted ? '#FFFFFF' : '#1A1A1A';
  const subTextColor = inverted ? '#E0E0E0' : '#2D2D2D';
  const dividerColor = inverted ? 'rgba(255,255,255,0.4)' : '#A0A0A0';

  if (variant === 'emblem-only') {
    return (
      <svg
        viewBox="0 0 100 135"
        className={className}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="State Emblem of India"
      >
        {/* Ashoka Lion Capital Emblem Vector */}
        <g fill={textColor}>
          {/* Top Lions */}
          <path d="M50 8c-3 0-6 2-7 5-1 3 0 7 2 9-3 1-6 4-6 8 0 5 4 9 9 9s9-4 9-9c0-4-3-7-6-8 2-2 3-6 2-9-1-3-4-5-7-5zm-16 18c-3 0-5 2-6 5-1 4 1 7 4 9-2 2-4 5-3 8 1 5 6 8 11 7 0-4 2-7 5-9-3-2-5-5-5-8 0-4-3-7-6-7zm32 0c-3 0-6 3-6 7 0 3-2 6-5 8 3 2 5 5 5 9 5 1 10-2 11-7 1-3-1-6-3-8 3-2 5-5 4-9-1-3-3-5-6-5z" />
          <path d="M38 42c-2 2-3 5-3 8 0 7 7 13 15 13s15-6 15-13c0-3-1-6-3-8-3 3-7 5-12 5s-9-2-12-5z" />
          {/* Main Body */}
          <path d="M36 52c-1 3-2 7-1 11 1 5 4 9 8 11-3 2-6 5-7 9-1 3-1 7 1 10h26c2-3 2-7 1-10-1-4-4-7-7-9 4-2 7-6 8-11 1-4 0-8-1-11-4 3-8 5-14 5s-10-2-14-5z" />
          {/* Abacus / Base Platform */}
          <rect x="22" y="96" width="56" height="5" rx="1.5" />
          {/* Ashoka Chakra Wheel */}
          <circle cx="50" cy="107" r="6" fill="none" stroke={textColor} strokeWidth="1.5" />
          <circle cx="50" cy="107" r="1.5" />
          {/* Galloping Horse and Bull Silhouettes */}
          <path d="M32 104c-2 0-4 1-5 3h10c-1-2-3-3-5-3zm36 0c-2 0-4 1-5 3h10c-1-2-3-3-5-3z" />
          {/* Lower Base */}
          <rect x="18" y="115" width="64" height="4" rx="1" />
          <path d="M24 119l4 4h44l4-4z" />
        </g>
        {/* Satyameva Jayate Inscription */}
        <text
          x="50"
          y="132"
          textAnchor="middle"
          fontSize="7"
          fontWeight="bold"
          fontFamily="'Noto Sans Devanagari', 'Mangal', sans-serif"
          fill={textColor}
          letterSpacing="0.5"
        >
          सत्यमेव जयते
        </text>
      </svg>
    );
  }

  return (
    <div className={`flex items-center justify-center gap-3 select-none ${className}`}>
      {/* 1. Left: National Emblem of India + Ministry Text */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Lion Capital SVG */}
        <svg
          viewBox="0 0 80 115"
          className="h-11 w-auto shrink-0"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill={textColor}>
            {/* Lions Heads & Manes */}
            <path d="M40 5c-3 0-5 2-6 4-1 3 0 5 2 7-3 1-5 3-5 6 0 4 3 7 7 7s7-3 7-7c0-3-2-5-5-6 2-2 3-4 2-7-1-2-3-4-5-4zm-13 14c-2 0-4 2-5 4-1 3 1 6 3 7-2 2-3 4-2 7 1 4 5 6 9 6 0-3 2-6 4-7-2-2-4-4-4-6 0-3-2-5-5-5zm26 0c-3 0-5 2-5 5 0 2-2 4-4 6 2 1 4 4 4 7 4 0 8-2 9-6 1-3-1-5-2-7 2-1 4-4 3-7-1-2-3-4-5-4z" />
            <path d="M30 31c-2 2-2 4-2 6 0 6 5 10 12 10s12-4 12-10c0-2-1-4-2-6-2 2-5 4-10 4s-8-2-10-4z" />
            {/* Central Pillar Body */}
            <path d="M29 39c-1 3-1 6 0 9 1 4 3 7 7 9-2 2-5 4-6 7-1 3-1 6 1 8h18c2-2 2-5 1-8-1-3-4-5-6-7 4-2 6-5 7-9 1-3 1-6 0-9-3 2-6 4-11 4s-8-2-11-4z" />
            {/* Abacus */}
            <rect x="18" y="74" width="44" height="4" rx="1" />
            {/* Ashoka Wheel (Dharma Chakra) */}
            <circle cx="40" cy="83" r="5" fill="none" stroke={textColor} strokeWidth="1.2" />
            <circle cx="40" cy="83" r="1.2" />
            <path d="M25 80c-2 0-3 1-4 2.5h8c-1-1.5-2-2.5-4-2.5zm30 0c-2 0-3 1-4 2.5h8c-1-1.5-2-2.5-4-2.5z" />
            {/* Base */}
            <rect x="15" y="89" width="50" height="3.5" rx="0.8" />
            <path d="M20 92.5l3 3.5h34l3-3.5z" />
          </g>
          {/* Satyameva Jayate Motto */}
          <text
            x="40"
            y="107"
            textAnchor="middle"
            fontSize="6.5"
            fontWeight="bold"
            fontFamily="'Noto Sans Devanagari', 'Mangal', system-ui, sans-serif"
            fill={textColor}
            letterSpacing="0.4"
          >
            सत्यमेव जयते
          </text>
        </svg>

        {/* Ministry of Youth Affairs and Sports Text */}
        <div className="flex flex-col text-left leading-[1.12]">
          <span
            className="text-[10px] sm:text-[11px] font-bold tracking-tight"
            style={{ color: textColor, fontFamily: "'Noto Sans Devanagari', system-ui, sans-serif" }}
          >
            युवा कार्यक्रम
          </span>
          <span
            className="text-[9px] sm:text-[10px] font-bold tracking-tight -mt-0.5"
            style={{ color: textColor, fontFamily: "'Noto Sans Devanagari', system-ui, sans-serif" }}
          >
            एवं खेल मंत्रालय
          </span>
          <span
            className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider mt-0.5"
            style={{ color: subTextColor, fontFamily: "system-ui, sans-serif" }}
          >
            MINISTRY OF
          </span>
          <span
            className="text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-tight -mt-0.5"
            style={{ color: textColor, fontFamily: "system-ui, sans-serif" }}
          >
            YOUTH AFFAIRS
          </span>
          <span
            className="text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-tight -mt-0.5"
            style={{ color: textColor, fontFamily: "system-ui, sans-serif" }}
          >
            AND SPORTS
          </span>
        </div>
      </div>

      {/* 2. Middle: Thin Vertical Divider Bar */}
      <div
        className="w-[1.5px] h-11 shrink-0 mx-0.5"
        style={{ backgroundColor: dividerColor }}
      />

      {/* 3. Right: Official "my भारत" (MY BHARAT) Brand Emblem */}
      <div className="flex items-center gap-1 shrink-0">
        <svg
          viewBox="0 0 160 70"
          className="h-11 w-auto"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* "my" in vibrant saffron-orange */}
          <text
            x="4"
            y="48"
            fontSize="32"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            fill="#E65100"
            letterSpacing="-1.5"
          >
            m
          </text>

          {/* Dynamic Human Figure in Center (Joyous youth reaching upward) */}
          <g transform="translate(32, 4)">
            {/* Sun / Aura in Saffron & Green */}
            <circle cx="16" cy="18" r="6" fill="#F57C00" />
            <path
              d="M7 16 A12 12 0 0 1 25 16"
              fill="none"
              stroke="#2E7D32"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M4 13 A16 16 0 0 1 28 13"
              fill="none"
              stroke="#EF6C00"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            {/* Uplifted arms and body of youth */}
            <path
              d="M5 28 C7 20, 11 20, 16 28 C21 20, 25 20, 27 28 C26 38, 20 46, 16 52 C12 46, 6 38, 5 28 Z"
              fill="#E65100"
            />
            {/* Green left accent flourish */}
            <circle cx="1" cy="38" r="2.8" fill="#1B5E20" />
          </g>

          {/* "भारत" in Devnagari Calligraphy with Indian Tricolor Accent */}
          <text
            x="64"
            y="47"
            fontSize="34"
            fontWeight="bold"
            fontFamily="'Noto Sans Devanagari', 'Mangal', 'Samarkan', system-ui, sans-serif"
            fill="#E65100"
          >
            भारत
          </text>

          {/* Tricolor Swash Tail Flowing to the Right */}
          <path
            d="M102 46 C115 52, 126 56, 138 52 C146 49, 150 44, 156 46 C150 49, 142 58, 132 58 C120 58, 110 50, 102 46 Z"
            fill="url(#tricolorGradient)"
          />

          <defs>
            <linearGradient id="tricolorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E65100" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#2E7D32" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};
