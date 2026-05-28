"use client";

import { useState } from "react";

const COLORS = [
  { id: "yellow", bg: "#F1BB01", label: "Amarelo" },
  { id: "green", bg: "#54A158", label: "Verde" },
  { id: "blue", bg: "#477AAB", label: "Azul" },
  { id: "white", bg: "#F5F5F5", label: "Branco" },
];

const CATEGORIES = [
  { id: "general", label: "Geral", icon: "✨" },
  { id: "technical", label: "Técnico", icon: "🛠️" },
  { id: "idea", label: "Ideia", icon: "💡" },
  { id: "moral", label: "Agradecimento", icon: "🙌" },
];

export default function AddNoteModal({ onClose, onSubmit }) {
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [from, setFrom] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [color, setColor] = useState("yellow");
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [showNameWarning, setShowNameWarning] = useState(false);

  const isValid = to.trim() !== "" && message.trim() !== "";

  const fireConfetti = async () => {
    const { default: confetti } = await import("canvas-confetti");
    const teamColors = ["#F1BB01", "#54A158", "#58D85E", "#ffffff", "#014627"];
    const shared = {
      particleCount: 60,
      spread: 70,
      colors: teamColors,
      gravity: 0.8,
      scalar: 1.1,
    };
    confetti({ ...shared, origin: { x: 0.25, y: 0.85 }, angle: 65 });
    confetti({ ...shared, origin: { x: 0.75, y: 0.85 }, angle: 115 });
    setTimeout(() => {
      confetti({ ...shared, particleCount: 30, origin: { x: 0.5, y: 0.75 }, angle: 90 });
    }, 150);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    if (!anonymous && from.trim() === "") {
      setShowNameWarning(true);
      return;
    }

    setSubmitting(true);
    setShowNameWarning(false);

    await onSubmit({
      to: to.trim(),
      message: message.trim(),
      from: anonymous ? "Anônimo" : from.trim(),
      color,
      category,
    });
    setSubmitting(false);
    fireConfetti();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="animate-slide-up w-full max-w-md"
        style={{
          backgroundColor: "#081545",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(241,187,1,0.15)",
          overflow: "hidden",
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                width: "3px",
                height: "18px",
                backgroundColor: "#F1BB01",
                borderRadius: "2px",
              }}
            />
            <h2
              className="font-barlow-condensed font-bold text-white"
              style={{ fontSize: "18px", letterSpacing: "0.02em" }}
            >
              Novo Agradecimento
            </h2>
          </div>
          <button
            id="modal-close-btn"
            onClick={onClose}
            className="transition-opacity"
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: "20px",
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

        {/* Form body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

          {/* Para */}
          <div>
            <label
              className="font-barlow text-white block mb-2"
              style={{ fontSize: "12px", opacity: 0.45, letterSpacing: "0.04em" }}
              htmlFor="note-to"
            >
              Para quem?
            </label>
            <input
              id="note-to"
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder='Ex: "Ana" ou "Time Todo"'
              maxLength={50}
              autoComplete="off"
              className="w-full font-barlow text-white rounded-lg px-4 py-2.5 outline-none transition-all"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: "14px",
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
          </div>

          {/* Categoria */}
          <div>
            <label
              className="font-barlow text-white block mb-2"
              style={{ fontSize: "12px", opacity: 0.45, letterSpacing: "0.04em" }}
            >
              Categoria / Tag
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  id={`cat-${cat.id}`}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className="font-barlow flex flex-col items-center justify-center py-2 px-1 rounded-lg border transition-all"
                  style={{
                    backgroundColor: category === cat.id ? "rgba(84,161,88,0.15)" : "rgba(255,255,255,0.03)",
                    borderColor: category === cat.id ? "#58D85E" : "rgba(255,255,255,0.08)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (category !== cat.id) {
                      e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (category !== cat.id) {
                      e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    }
                  }}
                >
                  <span style={{ fontSize: "16px", marginBottom: "3px" }}>{cat.icon}</span>
                  <span style={{ fontSize: "10px", color: category === cat.id ? "#fff" : "rgba(255,255,255,0.6)", fontWeight: category === cat.id ? "bold" : "normal" }}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Mensagem */}
          <div>
            <label
              className="font-barlow text-white block mb-2"
              style={{ fontSize: "12px", opacity: 0.45, letterSpacing: "0.04em" }}
              htmlFor="note-message"
            >
              Mensagem
            </label>
            <textarea
              id="note-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escreva seu agradecimento..."
              rows={4}
              maxLength={300}
              className="w-full font-barlow text-white rounded-lg px-4 py-2.5 outline-none transition-all resize-none"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: "14px",
                lineHeight: "1.55",
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
            <p
              className="font-barlow text-right mt-1"
              style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}
            >
              {message.length}/300
            </p>
          </div>

          {/* Cor + Anônimo — mesma linha */}
          <div className="flex items-center justify-between">
            {/* Swatches */}
            <div className="flex items-center gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  id={`color-${c.id}`}
                  type="button"
                  aria-label={`Cor ${c.label}`}
                  onClick={() => setColor(c.id)}
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "6px",
                    backgroundColor: c.bg,
                    border: color === c.id ? "2px solid #fff" : "2px solid transparent",
                    outline: color === c.id ? "2px solid rgba(88,216,94,0.8)" : "none",
                    outlineOffset: "1px",
                    transform: color === c.id ? "scale(1.15)" : "scale(1)",
                    transition: "all 0.15s ease",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>

            {/* Anônimo toggle */}
            <label
              className="flex items-center gap-2 cursor-pointer select-none"
              htmlFor="anonymous-checkbox"
            >
              <div
                style={{
                  width: "32px",
                  height: "18px",
                  borderRadius: "9px",
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
                    top: "3px",
                    left: anonymous ? "15px" : "3px",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: anonymous ? "#fff" : "rgba(255,255,255,0.5)",
                    transition: "left 0.2s ease",
                  }}
                />
              </div>
              <input
                id="anonymous-checkbox"
                type="checkbox"
                checked={anonymous}
                onChange={(e) => {
                  setAnonymous(e.target.checked);
                  setShowNameWarning(false);
                }}
                className="sr-only"
              />
              <span
                className="font-barlow text-white"
                style={{ fontSize: "13px", opacity: 0.55 }}
              >
                Anônimo
              </span>
            </label>
          </div>

          {/* Nome — só quando não é anônimo */}
          {!anonymous && (
            <div>
              <label
                className="font-barlow text-white block mb-2"
                style={{ fontSize: "12px", opacity: 0.45, letterSpacing: "0.04em" }}
                htmlFor="note-from"
              >
                Seu nome
              </label>
              <input
                id="note-from"
                type="text"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setShowNameWarning(false);
                }}
                placeholder="Ex: Seu Nome"
                maxLength={40}
                autoComplete="off"
                className="w-full font-barlow text-white rounded-lg px-4 py-2.5 outline-none transition-all"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: showNameWarning ? "1px solid #F1BB01" : "1px solid rgba(255,255,255,0.1)",
                  fontSize: "14px",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid rgba(241,187,1,0.6)";
                  e.target.style.backgroundColor = "rgba(255,255,255,0.07)";
                }}
                onBlur={(e) => {
                  e.target.style.border = showNameWarning ? "1px solid #F1BB01" : "1px solid rgba(255,255,255,0.1)";
                  e.target.style.backgroundColor = "rgba(255,255,255,0.05)";
                }}
              />
              {showNameWarning && (
                <p className="font-barlow mt-2 text-[#F1BB01] animate-fade-in" style={{ fontSize: "12px", lineHeight: "1.4" }}>
                  ⚠️ Digite seu nome, ou ative a opção &quot;Anônimo&quot; para não se identificar.
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div
            className="flex gap-3 pt-1"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}
          >
            <button
              id="modal-cancel-btn"
              type="button"
              onClick={onClose}
              className="font-barlow font-semibold rounded-lg py-2.5 transition-all flex-1"
              style={{
                fontSize: "14px",
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "rgba(255,255,255,0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
                e.currentTarget.style.color = "rgba(255,255,255,0.5)";
              }}
            >
              Cancelar
            </button>
            <button
              id="modal-submit-btn"
              type="submit"
              disabled={!isValid || submitting}
              className="font-barlow-condensed font-extrabold uppercase rounded-lg py-2.5 transition-all flex-[2]"
              style={{
                fontSize: "15px",
                letterSpacing: "0.06em",
                backgroundColor: isValid && !submitting ? "#54A158" : "rgba(84,161,88,0.15)",
                color: isValid && !submitting ? "#fff" : "rgba(255,255,255,0.2)",
                cursor: isValid && !submitting ? "pointer" : "not-allowed",
                border: "none",
              }}
              onMouseEnter={(e) => {
                if (isValid && !submitting)
                  e.currentTarget.style.backgroundColor = "#58D85E";
              }}
              onMouseLeave={(e) => {
                if (isValid && !submitting)
                  e.currentTarget.style.backgroundColor = "#54A158";
              }}
            >
              {submitting ? "Postando..." : "Postar 🎉"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
