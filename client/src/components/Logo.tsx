import React from 'react';

export const Logo = ({ className = "w-8 h-8", textClassName = "text-xl" }: { className?: string, textClassName?: string }) => {
  return (
    <div className="flex items-center gap-2 group">
      <div className={`relative ${className} flex items-center justify-center bg-primary rounded-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300 overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        <svg viewBox="0 0 512 512" className="w-2/3 h-2/3 text-white fill-current drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
          <path d="M256 160C203 160 160 203 160 256C160 309 203 352 256 352C309 352 352 309 352 256C352 203 309 160 256 160ZM300 280C285 305 255 315 230 300C205 285 195 255 210 230C220 215 235 205 250 205C240 215 235 230 235 245C235 275 260 300 290 300C294 300 297 300 300 299C298 299 299 300 300 280Z" />
        </svg>
      </div>
      <span className={`font-black tracking-tight bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent font-arabic ${textClassName}`}>
        رفيق المؤمن
      </span>
    </div>
  );
};
