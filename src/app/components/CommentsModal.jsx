"use client";

import { useState, useEffect, useRef } from "react";
import { useComments } from "@/lib/useComments";
import PostIt from "./PostIt";

export default function CommentsModal({ note, onClose }) {
  const { comments, loading, addComment, removeComment } = useComments(note.id);
  
  const [commentText, setCommentText] = useState("");
  const [name, setName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [showNameWarning, setShowNameWarning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myComments, setMyComments] = useState([]);
  
  const commentListEndRef = useRef(null);

  // Carrega e monitora comentários criados localmente para permitir exclusão
  useEffect(() => {
    const checkOwnership = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("myComments") || "[]");
        setMyComments(stored);
      } catch (e) {
        console.error(e);
      }
    };
    checkOwnership();
    
    window.addEventListener("storage_myComments_updated", checkOwnership);
    return () => window.removeEventListener("storage_myComments_updated", checkOwnership);
  }, []);

  // Rola até o último comentário quando a lista for atualizada
  useEffect(() => {
    if (comments.length > 0) {
      commentListEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments.length]);

  const isValid = commentText.trim() !== "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    if (!anonymous && name.trim() === "") {
      setShowNameWarning(true);
      return;
    }

    setSubmitting(true);
    setShowNameWarning(false);

    try {
      await addComment(
        anonymous ? "Anônimo" : name.trim(),
        commentText.trim()
      );
      setCommentText("");
    } catch (err) {
      console.error("Erro ao adicionar comentário:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (commentId) => {
    if (window.confirm("Tem certeza que deseja apagar seu comentário?")) {
      try {
        await removeComment(commentId);
      } catch (err) {
        console.error("Erro ao deletar comentário:", err);
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="animate-slide-up w-full max-w-3xl flex flex-col md:flex-row relative"
        style={{
          backgroundColor: "#081545",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(241,187,1,0.15)",
          overflow: "hidden",
          height: "82vh",
          maxHeight: "580px",
        }}
      >
        {/* Botão de Fechar Geral (Top Right do Modal) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-all text-xl font-bold z-50 cursor-pointer"
          title="Fechar"
          style={{ background: "none", border: "none" }}
        >
          ✕
        </button>

        {/* LADO ESQUERDO: Visualização do Post-It (Top no mobile) */}
        <div 
          className="w-full md:w-[310px] shrink-0 flex items-center justify-center py-5 md:py-8 px-6 bg-black/25 border-b md:border-b-0 md:border-r"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="w-full max-w-[240px] md:max-w-[260px] scale-90 sm:scale-95 md:scale-100 origin-center">
            {/* Renderizado estático e sem cliques */}
            <div style={{ pointerEvents: "none" }}>
              <PostIt note={note} index={0} isModal={true} />
            </div>
          </div>
        </div>

        {/* LADO DIREITO: Comentários e Formulário */}
        <div className="flex-1 flex flex-col p-5 md:p-6 min-h-0 relative">
          {/* Header */}
          <div
            className="flex items-center justify-between pb-3 mb-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            {/* Efeito de Fita Crepe no Título */}
            <div
              className="px-4 py-1"
              style={{
                backgroundColor: "rgba(245, 245, 220, 0.95)",
                transform: "rotate(-1deg)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                clipPath: "polygon(2% 0, 98% 0, 100% 15%, 98% 30%, 100% 50%, 99% 70%, 100% 85%, 98% 100%, 2% 100%, 0 85%, 2% 70%, 0 50%, 1% 30%, 0 15%)",
              }}
            >
              <h2
                className="font-barlow-condensed font-extrabold uppercase text-[#1c2e21] tracking-wide text-xs"
              >
                Comentários
              </h2>
            </div>
          </div>

          {/* LISTA DE COMENTÁRIOS (Scrollable) */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0 scrollbar-thin">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 opacity-50">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mb-2" />
                <span className="font-barlow-condensed text-[12px] uppercase tracking-wider">Carregando...</span>
              </div>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                <span style={{ fontSize: "28px" }} className="mb-1">💬</span>
                <h4 className="font-barlow-condensed font-bold text-md text-white">Sem comentários</h4>
                <p className="font-barlow text-[11px] max-w-[180px] mt-0.5">Seja o primeiro a deixar um recado!</p>
              </div>
            ) : (
              comments.map((comment) => {
                const isCommentOwner = myComments.includes(comment.id);
                return (
                  <div
                    key={comment.id}
                    className="p-3 rounded-lg flex flex-col justify-between transition-all duration-200 bg-white/[0.03] border-y border-r border-white/[0.04] border-l-4 border-l-[#54A158] hover:bg-[#E54D42]/[0.06] hover:border-[#E54D42]/[0.15]"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="font-barlow-condensed font-extrabold uppercase text-[12px] text-[#58D85E] tracking-wider leading-none">
                        {comment.from}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-barlow text-[9px] text-white/40">
                          {formatDate(comment.createdAt)}
                        </span>
                        {isCommentOwner && (
                          <button
                            onClick={() => handleRemove(comment.id)}
                            className="text-white/30 hover:text-[#E54D42] transition-colors"
                            title="Apagar meu comentário"
                            style={{ fontSize: "11px", background: "none", border: "none", cursor: "pointer" }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="font-barlow text-[13px] text-white/90 leading-relaxed break-words">
                      {comment.message}
                    </p>
                  </div>
                );
              })
            )}
            <div ref={commentListEndRef} />
          </div>

          {/* FORMULÁRIO DE ENVIO */}
          <form onSubmit={handleSubmit} className="mt-3 pt-3 space-y-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {/* Input do comentário */}
            <div className="relative">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escreva um comentário..."
                maxLength={150}
                className="w-full font-barlow text-white rounded-lg px-3.5 py-2 outline-none transition-all pr-12"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: "13px",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid rgba(84,161,88,0.7)";
                  e.target.style.backgroundColor = "rgba(255,255,255,0.07)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgba(255,255,255,0.1)";
                  e.target.style.backgroundColor = "rgba(255,255,255,0.05)";
                }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-white/20">
                {commentText.length}/150
              </span>
            </div>

            {/* Nome + Anônimo Switch */}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              {/* Nome input */}
              {!anonymous ? (
                <div className="flex-1 min-w-[120px]">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setShowNameWarning(false);
                    }}
                    placeholder="Seu nome"
                    maxLength={30}
                    className="w-full font-barlow text-white rounded-lg px-3 py-1.5 outline-none transition-all"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.04)",
                      border: showNameWarning ? "1px solid #F1BB01" : "1px solid rgba(255,255,255,0.08)",
                      fontSize: "12px",
                    }}
                    onFocus={(e) => {
                      e.target.style.border = "1px solid rgba(241,187,1,0.6)";
                    }}
                    onBlur={(e) => {
                      e.target.style.border = showNameWarning ? "1px solid #F1BB01" : "1px solid rgba(255,255,255,0.08)";
                    }}
                  />
                </div>
              ) : (
                <div className="flex-1" />
              )}

              {/* Toggle Anônimo */}
              <div className="flex items-center gap-2 select-none">
                <label className="flex items-center gap-2 cursor-pointer" htmlFor="comment-anon-checkbox">
                  <div
                    style={{
                      width: "28px",
                      height: "16px",
                      borderRadius: "8px",
                      backgroundColor: anonymous ? "#54A158" : "rgba(255,255,255,0.12)",
                      position: "relative",
                      transition: "background 0.2s ease",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: anonymous ? "14px" : "2px",
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: anonymous ? "#fff" : "rgba(255,255,255,0.5)",
                        transition: "left 0.2s ease",
                      }}
                    />
                  </div>
                  <input
                    id="comment-anon-checkbox"
                    type="checkbox"
                    checked={anonymous}
                    onChange={(e) => {
                      setAnonymous(e.target.checked);
                      setShowNameWarning(false);
                    }}
                    className="sr-only"
                  />
                  <span className="font-barlow text-white/50 text-[11px]">
                    Anônimo
                  </span>
                </label>
              </div>

              {/* Botão Enviar */}
              <button
                type="submit"
                disabled={!isValid || submitting}
                className="font-barlow-condensed font-extrabold uppercase rounded-lg px-4 py-1.5 transition-all"
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.05em",
                  backgroundColor: isValid && !submitting ? "#54A158" : "rgba(84,161,88,0.15)",
                  color: isValid && !submitting ? "#fff" : "rgba(255,255,255,0.2)",
                  cursor: isValid && !submitting ? "pointer" : "not-allowed",
                  border: "none",
                }}
                onMouseEnter={(e) => {
                  if (isValid && !submitting) e.currentTarget.style.backgroundColor = "#58D85E";
                }}
                onMouseLeave={(e) => {
                  if (isValid && !submitting) e.currentTarget.style.backgroundColor = "#54A158";
                }}
              >
                {submitting ? "..." : "Enviar 🚀"}
              </button>
            </div>

            {showNameWarning && (
              <p className="font-barlow text-[#F1BB01] text-[10px] animate-fade-in mt-0.5">
                ⚠️ Digite seu nome, ou ative &quot;Anônimo&quot;.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
