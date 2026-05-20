import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../ThemeContext';

interface BrandedImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
}

export default function BrandedImage({ src, alt, className = "", aspectRatio = "aspect-[4/5]" }: BrandedImageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();

  const isLight = theme === 'light';

  return (
    <div 
      className={`relative group ${className} ${aspectRatio} w-full flex items-center justify-center`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Behind the Image: Large Soft Green Pulse Glow */}
      <div 
        className={`absolute inset-4 rounded-full filter blur-3xl transition-all duration-700 pointer-events-none opacity-60 ${
          isLight 
            ? 'bg-radial from-[#00C853]/20 via-[#00C853]/5 to-transparent' 
            : 'bg-radial from-[#00C853]/25 via-transparent to-transparent'
        } ${isHovered ? 'scale-125 opacity-100' : 'scale-100'}`} 
      />

      {/* 2. Free-floating Image Container with infinite floating motion */}
      <motion.div 
        className="relative w-full h-full z-10 flex items-center justify-center"
        animate={{
          y: isHovered ? -12 : [0, -8, 0],
        }}
        transition={{
          y: isHovered 
            ? { duration: 0.4, ease: "easeOut" } 
            : { repeat: Infinity, duration: 6, ease: "easeInOut" }
        }}
      >
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-contain filter transition-all duration-700 ease-out select-none pointer-events-none ${
            isHovered 
              ? 'scale-105 drop-shadow-[0_25px_35px_rgba(0,200,83,0.35)] contrast-105' 
              : isLight
                ? 'drop-shadow-[0_15px_20px_rgba(0,0,0,0.12)] hover:drop-shadow-[0_25px_30px_rgba(0,200,83,0.22)]'
                : 'drop-shadow-[0_15px_25px_rgba(0,200,83,0.18)] grayscale hover:grayscale-0'
          }`}
          style={{
            maxHeight: '100%',
          }}
        />

        {/* 3. Bottom very subtle soft mask shadow to ground the image nicely */}
        <div className={`absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t to-transparent pointer-events-none z-15 ${
          isLight ? 'from-[#F6F8FA]/90' : 'from-[#0A0A0A]/90'
        }`} />
      </motion.div>

      {/* Modern Status Badge overlaid elegantly (inspired by the spec bottom status badge) */}
      <div className={`absolute -bottom-3 -left-3 px-3.5 py-1.5 rounded-full shadow-lg z-20 flex items-center gap-2 border pointer-events-none backdrop-blur-md transition-all duration-500 ${
        isHovered ? 'scale-105 -translate-y-1' : ''
      } ${
        isLight ? 'bg-white/85 border-zinc-200 shadow-zinc-200' : 'bg-[#121212]/90 border-white/5'
      }`}>
        <div className="w-2.5 h-2.5 rounded-full bg-[#00C853] animate-pulse shrink-0" />
        <span className={`text-[9px] uppercase font-display font-black tracking-widest leading-none ${
          isLight ? 'text-zinc-900' : 'text-white'
        }`}>Active Innovator</span>
      </div>

      {/* Side floating specification coordinates */}
      <div className="absolute right-4 bottom-4 font-mono text-[9px] text-[#00C853]/60 z-20 tracking-wider hidden sm:block pointer-events-none transition-opacity duration-300 group-hover:text-[#00C853]/90">
        UR // SUSTAINABILITY.AI
      </div>
    </div>
  );
}
