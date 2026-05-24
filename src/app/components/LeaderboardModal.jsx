"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import PostIt from "./PostIt";

export default function LeaderboardModal({ notes, title = "Pódio", onClose }) {
  useEffect(() => {
    // Animação de confetes ao abrir
    const duration = 2500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#F1BB01", "#54A158", "#58D85E", "#ffffff"]
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#F1BB01", "#54A158", "#58D85E", "#ffffff"]
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  // Calcular MVP (mais mensagens recebidas)
  const mvpCounts = notes.reduce((acc, note) => {
    const to = (note.to || "Anônimo").toUpperCase().trim();
    // Excluir menções muito genéricas para destacar pessoas reais
    if (!["TIME TODO", "TEAM BRAZIL", "TIME BRAZIL", "TODOS"].includes(to)) {
      acc[to] = (acc[to] || 0) + 1;
    }
    return acc;
  }, {});

  const mvpEntries = Object.entries(mvpCounts).sort((a, b) => b[1] - a[1]);
  const mvp = mvpEntries.length > 0 ? mvpEntries[0] : null;

  // Calcular Post-it Destaque (mais reações)
  const topNote = notes.reduce((max, note) => {
    let currentCount = 0;
    if (note.reactions) {
      currentCount = Object.values(note.reactions).reduce((sum, val) => sum + val, 0);
    }
    const noteWithCount = { ...note, totalReactions: currentCount };

    if (!max || currentCount > max.totalReactions) {
      return noteWithCount;
    }
    return max;
  }, null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="animate-slide-up w-full max-w-2xl"
        style={{
          backgroundColor: "#081545",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(241,187,1,0.2)",
          overflow: "hidden",
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between px-8 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3">
            <span style={{ fontSize: "24px" }}>🏆</span>
            <h2
              className="font-barlow-condensed font-extrabold text-white uppercase tracking-wider"
              style={{ fontSize: "22px" }}
            >
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="transition-opacity"
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: "24px",
              lineHeight: 1,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col md:flex-row gap-8 items-stretch">

          {/* Coluna 1: MVP */}
          <div className="flex-1 flex flex-col items-center text-center justify-center p-6 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <h3 className="font-barlow uppercase tracking-widest mb-4" style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
              MVP do Amor
            </h3>
            {mvp ? (
              <>
                <div
                  className="mb-4 flex items-center justify-center rounded-full"
                  style={{ width: "80px", height: "80px", backgroundColor: "rgba(241,187,1,0.15)", border: "2px solid rgba(241,187,1,0.4)", fontSize: "40px" }}
                >
                  🥇
                </div>
                <p className="font-barlow-condensed font-extrabold uppercase text-white mb-2" style={{ fontSize: "32px", lineHeight: 1 }}>
                  {mvp[0]}
                </p>
                <p className="font-barlow" style={{ fontSize: "14px", color: "#58D85E" }}>
                  Recebeu {mvp[1]} agradecimentos!
                </p>
              </>
            ) : (
              <p className="font-barlow text-white opacity-50">Nenhum post-it registrado ainda.</p>
            )}
          </div>

          {/* Separador */}
          <div className="hidden md:block w-px bg-white opacity-10"></div>

          {/* Coluna 2: Post-it Destaque */}
          <div className="flex-1 flex flex-col items-center text-center justify-center p-6 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <h3 className="font-barlow uppercase tracking-widest mb-4" style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
              Mensagem Mais Reagida 🔥
            </h3>
            {topNote && topNote.totalReactions > 0 ? (
              <div className="scale-90 transform origin-top mt-5">
                {/* Reutilizamos o componente PostIt passando a index 0 e isModal para remover a rotação */}
                <div style={{ pointerEvents: "none" }}>
                  <PostIt note={topNote} index={0} isModal={true} />
                </div>
                <div className="mt-4 inline-flex items-center gap-2 bg-black bg-opacity-30 px-4 py-2 rounded-full border border-white border-opacity-10">
                  <span style={{ fontSize: "16px" }}>🏆</span>
                  <span className="font-barlow font-bold text-white" style={{ fontSize: "14px" }}>{topNote.totalReactions} reações</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center opacity-50">
                <span style={{ fontSize: "40px" }} className="mb-2">👻</span>
                <p className="font-barlow text-white text-sm">Ninguém reagiu a nenhum post-it ainda.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
