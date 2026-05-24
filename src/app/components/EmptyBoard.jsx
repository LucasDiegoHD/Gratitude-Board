"use client";

export default function EmptyBoard({ 
  onAdd, 
  title = "Nenhuma mensagem encontrada", 
  description = "O quadro parece um pouco vazio no momento. Que tal preencher esse espaço com um agradecimento especial?",
  buttonLabel = "Adicionar Note",
  icon = "✍️"
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[50vh] px-6 text-center animate-pop-in relative z-10">
      {/* Ghost Post-it Drawing */}
      <button 
        onClick={onAdd}
        className="group relative flex flex-col items-center justify-center p-8 mb-6 rounded-sm transition-all duration-300 hover:scale-105"
        style={{
          width: "220px",
          height: "220px",
          backgroundColor: "rgba(255,255,255,0.02)",
          border: "2px dashed rgba(255,255,255,0.2)",
          transform: "rotate(-2deg)",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-12px",
            width: "60px",
            height: "24px",
            backgroundColor: "rgba(255,255,255,0.1)",
            border: "1px dashed rgba(255,255,255,0.3)",
            transform: "rotate(-3deg)",
          }}
        />
        <span className="text-4xl mb-4 opacity-50 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0">{icon}</span>
        <span className="font-barlow-condensed font-bold uppercase tracking-wider text-white opacity-40 group-hover:opacity-100 transition-opacity">
          {buttonLabel}
        </span>
      </button>

      <h3 className="font-barlow-condensed font-bold text-2xl text-white mb-2" style={{ letterSpacing: "0.02em" }}>
        {title}
      </h3>
      <p className="font-barlow text-white/60 max-w-sm" style={{ fontSize: "15px", lineHeight: "1.6" }}>
        {description}
      </p>
    </div>
  );
}
