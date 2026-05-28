"use client";

import { useRef, useState, useEffect, memo } from "react";
import { useReactions } from "@/lib/useReactions";
import { useStickers } from "@/lib/useStickers";

const COLOR_MAP = {
  yellow: {
    bg: "#F1BB01",
    text: "#101010",
    accent: "#c99500",
    shadow: "rgba(241,187,1,0.35)",
    label: "Amarelo",
  },
  green: {
    bg: "#54A158",
    text: "#fff",
    accent: "#3d7a41",
    shadow: "rgba(84,161,88,0.4)",
    label: "Verde",
  },
  blue: {
    bg: "#477AAB",
    text: "#fff",
    accent: "#2f5a80",
    shadow: "rgba(71,122,171,0.4)",
    label: "Azul",
  },
  white: {
    bg: "#F5F5F5",
    text: "#101010",
    accent: "#cccccc",
    shadow: "rgba(255,255,255,0.25)",
    label: "Branco",
  },
};

// Parceria removida a pedido do usuário
const CATEGORIES = {
  general: { label: "Geral", icon: "✨" },
  technical: { label: "Técnico", icon: "🛠️" },
  idea: { label: "Ideia", icon: "💡" },
  moral: { label: "Agradecimento", icon: "🙌" },
};



const PostIt = memo(function PostIt({ note, index, isModal = false, selectedSticker, onStickerPlaced, removeNote, onOpenComments }) {
  let colors = COLOR_MAP[note.color] || COLOR_MAP["yellow"];
  const categoryInfo = CATEGORIES[note.category] || CATEGORIES["general"];
  const cardRef = useRef(null);
  const [showReactions, setShowReactions] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const checkOwnership = () => {
      try {
        const myNotes = JSON.parse(localStorage.getItem("myNotes") || "[]");
        if (myNotes.includes(note.id)) {
          setIsOwner(true);
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    checkOwnership();

    // Ouve eventos disparados logo após a criação
    window.addEventListener("storage_myNotes_updated", checkOwnership);
    return () => window.removeEventListener("storage_myNotes_updated", checkOwnership);
  }, [note.id]);

  // Lógica de Mensagem Fixada
  const isPinned = note.message && note.message.trim().toUpperCase().startsWith("[AVISO]");
  const displayMessage = isPinned ? note.message.replace(/^\[AVISO\]\s*/i, "") : note.message;

  // Override brutal de cores para o Aviso Fixado (Estilo Dark/Premium)
  if (isPinned) {
    colors = {
      bg: "#E54D42", // Um vermelho alegre e saturado, no mesmo padrão do azul e verde
      text: "#FFFFFF",
      accent: "#B83A31",
      shadow: "rgba(229, 77, 66, 0.4)",
      label: "Fixado",
    };
  }

  const { reactionList, addReaction } = useReactions(note.id);
  const { stickers, addSticker } = useStickers(note.id);

  const rotations = [-2.5, 1.8, -1.2, 2.8, -0.6, 2.2, -1.8, 1.2, -3, 0.8];
  const baseRotation = isModal ? 0 : rotations[index % rotations.length];
  const rotation = isPinned ? 0 : baseRotation;

  const tapeRotations = [-2.5, 1.5, -1, 2.2];
  const tapeRotation = isPinned ? 0 : tapeRotations[index % tapeRotations.length];



  const totalReactions = reactionList.reduce((sum, r) => sum + r.count, 0);

  // Emoji com mais reações (aparece no badge do card)
  const dominantReaction = reactionList
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)[0] || null;

  // ── Drag and Drop handlers ──────────────────────────────────────────
  const handleDragOver = (e) => {
    e.preventDefault(); // Permite o drop
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const emoji = e.dataTransfer.getData("sticker/emoji");
    if (!emoji || !cardRef.current) return;

    // Calcula coordenadas relativas ao cartão
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Converte para porcentagem para manter coerência em qualquer tamanho
    const xPct = (x / rect.width) * 100;
    const yPct = (y / rect.height) * 100;

    // Estratégia Anti-Sobreposição:
    // Limita a altura máxima do adesivo a 72% do post-it. 
    // Se jogar no rodapé, ele gruda automaticamente acima da linha do remetente.
    const safeYPct = Math.min(yPct, 72);
    addSticker(emoji, xPct, safeYPct);
  };

  const handleClick = (e) => {
    if (selectedSticker && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xPct = (x / rect.width) * 100;
      const yPct = (y / rect.height) * 100;
      const safeYPct = Math.min(yPct, 72);
      addSticker(selectedSticker, xPct, safeYPct);
      if (onStickerPlaced) onStickerPlaced();
    } else {
      setShowReactions(!showReactions);
    }
  };

  return (
    <div
      className="animate-pop-in w-full max-w-[280px] mx-auto sm:max-w-none"
      style={{
        animationDelay: `${(index % 8) * 0.06}s`,
        opacity: 0,
      }}
    >
      {/* Wrapper com named group para reações */}
      <div className="relative group/postit">

        {/* Badge com emoji dominante + total de reações */}
        {totalReactions > 0 && dominantReaction && (
          <div
            className="transition-all duration-200 ease-out group-hover/postit:scale-125 group-hover/postit:-translate-y-1"
            title={`${dominantReaction.emoji} é a reação mais popular · ${totalReactions} no total`}
            style={{
              position: "absolute",
              top: "-10px",
              right: "-10px",
              backgroundColor: "#F1BB01",
              color: "#101010",
              borderRadius: "9999px",
              fontSize: "10px",
              fontWeight: 800,
              lineHeight: 1,
              padding: "4px 7px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
              zIndex: 20,
              pointerEvents: "none",
              fontFamily: "'Barlow Condensed', sans-serif",
              display: "flex",
              alignItems: "center",
              gap: "3px",
            }}
          >
            <span style={{ fontSize: "13px", lineHeight: 1 }}>{dominantReaction.emoji}</span>
            {totalReactions > 1 && (
              <span style={{ fontSize: "10px", fontWeight: 800 }}>{totalReactions}</span>
            )}
          </div>
        )}

        {/* ── Post-it Card ─────────────────────────────────────── */}
        <div
          ref={cardRef}
          onClick={handleClick}
          className={`relative select-none p-[18px] pb-[14px] min-h-[170px] ${selectedSticker ? 'cursor-crosshair' : 'cursor-default'}`}
          style={{
            backgroundColor: colors.bg,
            color: colors.text,
            transform: `rotate(${rotation}deg)`,
            transition:
              "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderRadius: "2px",
            boxShadow: `3px 4px 12px ${colors.shadow}, 0 1px 3px rgba(0,0,0,0.3)`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = `rotate(${rotation * 0.3}deg) scale(1.06) translateY(-4px)`;
            e.currentTarget.style.boxShadow = `6px 10px 24px ${colors.shadow}, 0 2px 8px rgba(0,0,0,0.35)`;
            e.currentTarget.style.zIndex = "10";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = `rotate(${rotation}deg) scale(1) translateY(0)`;
            e.currentTarget.style.boxShadow = `3px 4px 12px ${colors.shadow}, 0 1px 3px rgba(0,0,0,0.3)`;
            e.currentTarget.style.zIndex = "auto";
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Fita Adesiva Clássica */}
          <div
            style={{
              position: "absolute",
              top: "-11px",
              left: "50%",
              transform: `translateX(-50%) rotate(${tapeRotation}deg)`,
              width: "80px",
              height: "24px",
              backgroundColor: "rgba(255,255,255,0.4)",
              backdropFilter: "blur(2px)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              border: "none",
              clipPath:
                "polygon(5% 0%, 95% 0%, 93% 8%, 97% 16%, 92% 25%, 96% 38%, 92% 50%, 98% 62%, 93% 75%, 97% 88%, 95% 100%, 5% 100%, 8% 90%, 3% 80%, 7% 70%, 2% 58%, 8% 46%, 3% 34%, 7% 22%, 2% 10%)",
              zIndex: 10,
              pointerEvents: "none",
            }}
          />

          {/* Canto dobrado */}
          <div
            className="absolute top-0 right-0 z-20 pointer-events-none"
            style={{
              width: 0,
              height: 0,
              borderStyle: "solid",
              borderWidth: "0 22px 22px 0",
              borderColor: `transparent ${colors.accent} transparent transparent`,
              filter: "drop-shadow(-1px 1px 2px rgba(0,0,0,0.2))",
            }}
          />

          {/* Botão de excluir movido para o rodapé */}

          {/* Conteúdo */}
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex flex-col gap-1">
                <span
                  className="font-barlow-condensed font-bold uppercase tracking-widest"
                  style={{ fontSize: "10px", opacity: 0.6 }}
                >
                  Para
                </span>
                <div className="flex items-center gap-2">
                  <h3
                    className="font-barlow-condensed font-black uppercase tracking-wide leading-none text-[22px]"
                    style={{
                      textShadow: `1px 1px 0 ${colors.shadow}`,
                    }}
                  >
                    {note.to}
                  </h3>
                  {isPinned && (
                    <span
                      className="font-barlow-condensed font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                      style={{
                        fontSize: "9px",
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        border: "1px solid rgba(255, 255, 255, 0.6)",
                        color: "#FFFFFF",
                        lineHeight: 1,
                      }}
                    >
                      AVISO
                    </span>
                  )}
                </div>
              </div>

              {/* Categoria Badge */}
              {categoryInfo && !isPinned && (
                <span
                  className="font-barlow-condensed font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                  style={{
                    fontSize: "9px",
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3.5px",
                    color: colors.text,
                    opacity: 0.8,
                    lineHeight: 1,
                    marginTop: "2px",
                  }}
                  title={categoryInfo.label}
                >
                  <span style={{ fontSize: "10px" }}>{categoryInfo.icon}</span>
                  <span>{categoryInfo.label}</span>
                </span>
              )}
            </div>

            <p
              className="font-barlow mt-3 text-[13.5px] relative z-40"
              style={{
                lineHeight: "1.55",
                fontWeight: 600,
                wordBreak: "break-word",
                textShadow: `
                  -2px -2px 2px ${colors.bg}, 
                  2px -2px 2px ${colors.bg}, 
                  -2px 2px 2px ${colors.bg}, 
                  2px 2px 2px ${colors.bg},
                  0 0 6px ${colors.bg}
                `, // Efeito "halo" da cor do post-it para legibilidade máxima
              }}
            >
              {displayMessage}
            </p>
          </div>

          {/* De */}
          <div
            className="mt-4 pt-2 flex items-center min-w-0"
            style={{
              borderTop: `1.5px solid ${colors.accent}`,
              paddingRight: (isOwner && removeNote && !isModal) ? "98px" : (!isModal && onOpenComments ? "56px" : "0px"),
            }}
          >
            <span style={{ fontSize: "16px", opacity: 0.7, marginRight: "8px", flexShrink: 0 }}>✍️</span>
            <p
              className="font-barlow-condensed font-bold uppercase tracking-wider truncate flex-1 min-w-0"
              style={{ fontSize: "15px", opacity: 0.95 }}
            >
              {note.from}
            </p>
          </div>

          {/* Botão de Excluir Notas (Lixeira com posição absoluta fixa no post-it) */}
          {isOwner && removeNote && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("Tem certeza que deseja apagar este agradecimento?")) {
                  removeNote(note.id);
                }
              }}
              className="absolute bottom-[12px] right-[68px] opacity-60 hover:opacity-100 transition-all duration-300 bg-[#E54D42] text-white hover:bg-[#B83A31] rounded flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 z-40"
              style={{
                fontSize: "12px",
                lineHeight: 1,
                cursor: "pointer",
                border: "none",
                width: "28px",
                height: "28px",
              }}
              title="Apagar meu post-it"
            >
              🗑️
            </button>
          )}

          {/* Botão de Comentários (Posição absoluta fixa no post-it) */}
          {!isModal && onOpenComments && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenComments(note);
              }}
              className="absolute bottom-[12px] right-[18px] flex items-center gap-1.5 py-0.5 px-2 rounded hover:bg-black/10 hover:scale-110 active:scale-95 transition-all duration-200 z-40"
              style={{
                fontFamily: "var(--font-barlow-condensed)",
                fontSize: "12px",
                fontWeight: "bold",
                color: colors.text,
                opacity: 0.8,
                cursor: "pointer",
                border: "none",
                backgroundColor: "transparent",
                height: "28px",
              }}
              title="Ver e adicionar comentários"
            >
              <span>💬</span>
              <span>{note.comments ? Object.keys(note.comments).length : 0}</span>
            </button>
          )}

          {/* Adesivos Colados */}
          {stickers.map((stk) => (
            <div
              key={stk.id}
              className="absolute animate-pop-in select-none text-[20px] sm:text-[26px]"
              style={{
                left: `${stk.x}%`,
                top: `${stk.y}%`,
                transform: "translate(-50%, -50%)",
                lineHeight: 1,
                zIndex: 30,
                pointerEvents: "none",
                color: "#014627", // Para o fallback do Windows (BR)
                // Efeito de adesivo recortado (contorno arredondado em 8 direções)
                textShadow: "-2px -2px 0 #fff, 0 -2.5px 0 #fff, 2px -2px 0 #fff, 2.5px 0 0 #fff, 2px 2px 0 #fff, 0 2.5px 0 #fff, -2px 2px 0 #fff, -2.5px 0 0 #fff",
                filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.35))",
              }}
            >
              {stk.emoji}
            </div>
          ))}
        </div>

        {/* ── Painel de Reações — aparece no hover ────────── */}
        <div
          className={`transition-opacity duration-200 absolute sm:left-1/2 sm:-translate-x-1/2 sm:bottom-[-34px] sm:top-auto sm:right-auto sm:translate-y-0 sm:flex-row -right-12 top-1/2 -translate-y-1/2 flex-col ${showReactions ? 'opacity-100' : 'opacity-0 sm:group-hover/postit:opacity-100'}`}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "4px",
            width: "max-content",
            zIndex: 40,
          }}
        >
          {/* Botões de emoji */}
          {reactionList.map(({ emoji, count, hasReacted, isMyReaction }) => (
            <button
              key={emoji}
              onClick={() => addReaction(emoji)}
              title={
                isMyReaction
                  ? `Remover sua reação ${emoji}`
                  : `Reagir com ${emoji}`
              }
              className="reaction-btn flex items-center justify-center gap-1 rounded-full transition-all duration-150 flex-shrink-0"
              style={{
                padding: "3px 6px",
                fontSize: "13px",
                border: isMyReaction
                  ? "1.5px solid rgba(84,161,88,0.75)"
                  : count > 0
                  ? "1.5px solid rgba(255,255,255,0.2)"
                  : "1.5px solid rgba(255,255,255,0.08)",
                backgroundColor: isMyReaction
                  ? "rgba(84,161,88,0.25)"
                  : count > 0
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(255,255,255,0.05)",
                // Emoji não selecionado fica levemente mais apagado quando já reagiu
                opacity: hasReacted && !isMyReaction ? 0.5 : 1,
                // Todos os emojis não selecionados são clicavéis (para trocar)
                cursor: isMyReaction ? "default" : "pointer",
                lineHeight: 1,
                color: isMyReaction ? "#58D85E" : "#fff",
                backdropFilter: "blur(4px)",
              }}
              onMouseEnter={(e) => {
                if (!isMyReaction) {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.22)";
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "scale(1.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isMyReaction) {
                  e.currentTarget.style.backgroundColor =
                    count > 0 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)";
                  e.currentTarget.style.opacity = hasReacted ? "0.5" : "1";
                  e.currentTarget.style.transform = "scale(1)";
                }
              }}
            >
              <span>{emoji}</span>
              {count > 0 && (
                <span
                  className="font-barlow-condensed font-bold"
                  style={{ fontSize: "11px", opacity: 0.85 }}
                >
                  {count}
                </span>
              )}
            </button>
          ))}

        </div>
      </div>
    </div>
  );
});

export default PostIt;
export { COLOR_MAP };
