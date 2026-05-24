"use client";

import { useState } from "react";

const STICKERS = ["💖", "🔥", "🏆", "👀", "🚀", "🇧🇷", "⭐", "🎉"];

export default function StickerPalette({ selectedSticker, onSelectSticker }) {
  const [isOpen, setIsOpen] = useState(true);

  const handleDragStart = (e, emoji) => {
    e.dataTransfer.setData("sticker/emoji", emoji);
    // Para dar feedback visual sutil durante o drag
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      className="fixed left-0 sm:left-6 bottom-32 sm:bottom-24 z-50 flex flex-col gap-2 transition-transform duration-300"
      style={{ transform: isOpen ? "translateX(0)" : "translateX(-120%)" }}
    >
      <div
        className="relative flex flex-col items-center gap-4 p-3 rounded-md pt-8"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f4f4f4 100%)", // Textura de papel glossy
          border: "1px solid rgba(0,0,0,0.05)",
          boxShadow: "2px 4px 15px rgba(0,0,0,0.3), inset 0 0 4px rgba(255,255,255,1)",
        }}
      >
        {/* Furo da cartela (para pendurar na papelaria) */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "12px",
            height: "12px",
            backgroundColor: "#014627", // A cor do fundo por trás da cartela
            borderRadius: "50%",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)",
          }}
        />

        {/* Marca d'água / Logo da cartela */}
        <div className="font-barlow-condensed font-bold text-gray-400 text-[11px] uppercase tracking-widest mt-1 mb-2">
          Stickers
        </div>
        
        {STICKERS.map((emoji) => (
          <div
            key={emoji}
            draggable
            onDragStart={(e) => handleDragStart(e, emoji)}
            onClick={() => onSelectSticker && onSelectSticker(selectedSticker === emoji ? null : emoji)}
            className={`cursor-pointer transition-transform duration-150 hover:scale-125 ${selectedSticker === emoji ? 'scale-125' : ''}`}
            style={{
              touchAction: "none",
              fontSize: "30px",
              lineHeight: 1,
              color: "#014627", // Para o fallback do Windows (BR) não ficar invisível na borda branca
              textShadow: selectedSticker === emoji 
                ? "0 0 10px rgba(88,216,94,1), -2px -2px 0 #fff, 0 -2.5px 0 #fff, 2px -2px 0 #fff, 2.5px 0 0 #fff, 2px 2px 0 #fff, 0 2.5px 0 #fff, -2px 2px 0 #fff, -2.5px 0 0 #fff"
                : "-2px -2px 0 #fff, 0 -2.5px 0 #fff, 2px -2px 0 #fff, 2.5px 0 0 #fff, 2px 2px 0 #fff, 0 2.5px 0 #fff, -2px 2px 0 #fff, -2.5px 0 0 #fff",
              filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.25))",
            }}
            title="Arraste para um post-it"
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Botão para recolher/expandir (Aba lateral) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-8 top-1/2 -translate-y-1/2 w-8 h-14 flex items-center justify-center rounded-r-lg transition-colors"
        style={{
          background: "linear-gradient(to right, #f4f4f4, #e0e0e0)",
          border: "1px solid rgba(0,0,0,0.1)",
          borderLeft: "none",
          boxShadow: "4px 2px 8px rgba(0,0,0,0.2)",
          cursor: "pointer",
        }}
        title={isOpen ? "Esconder stickers" : "Mostrar stickers"}
      >
        <span className="text-gray-500 font-bold text-xs" style={{ textShadow: "0 1px 0 #fff" }}>
          {isOpen ? "◀" : "▶"}
        </span>
      </button>
    </div>
  );
}
