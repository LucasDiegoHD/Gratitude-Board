"use client";

import { useState, useEffect, useRef } from "react";
import { useNotes } from "@/lib/useNotes";
import PostIt from "./components/PostIt";
import AddNoteModal from "./components/AddNoteModal";
import TeamBrShield from "./components/TeamBrShield";
import StickerPalette from "./components/StickerPalette";
import DrawingCanvas from "./components/DrawingCanvas";
import EmptyBoard from "./components/EmptyBoard";

const CATEGORY_SEARCH_MAP = {
  general: "geral",
  technical: "técnico tecnico mecanica codigo",
  idea: "ideia criativa",
  moral: "apoio moral",
};

export default function GratitudeBoardPage() {
  const [filterType, setFilterType] = useState("recent");
  const searchInputRef = useRef(null);
  // Setup Mobile Drag and Drop Polyfill
  useEffect(() => {
    import("mobile-drag-drop").then(({ polyfill }) => {
      import("mobile-drag-drop/scroll-behaviour").then(({ scrollBehaviourDragImageTranslateOverride }) => {
        polyfill({
          dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride,
        });
        // workaround for some mobile browsers
        window.addEventListener('touchmove', function() {}, {passive: false});
      });
    });
  }, []);

  const { notes, loading, error, addNote, removeNote } = useNotes(filterType);
  const [showModal, setShowModal] = useState(false);
  const [countBump, setCountBump] = useState(false);
  const prevCount = useRef(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupBy, setGroupBy] = useState("none");
  const [drawingTool, setDrawingTool] = useState("none"); // "none" | "pencil" | "eraser"
  const [selectedSticker, setSelectedSticker] = useState(null);

  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const noteCategory = note.category || "general";
    const categorySearchString = CATEGORY_SEARCH_MAP[noteCategory] || "";
    return (
      (note.to && note.to.toLowerCase().includes(query)) ||
      (note.from && note.from.toLowerCase().includes(query)) ||
      (note.message && note.message.toLowerCase().includes(query)) ||
      categorySearchString.includes(query)
    );
  })
  .sort((a, b) => {
    const aPinned = a.message && a.message.trim().toUpperCase().startsWith("[AVISO]");
    const bPinned = b.message && b.message.trim().toUpperCase().startsWith("[AVISO]");
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return 0;
  });

  useEffect(() => {
    if (notes.length > prevCount.current) {
      setCountBump(true);
      setTimeout(() => setCountBump(false), 450);
    }
    prevCount.current = notes.length;
  }, [notes.length]);

  const handleAddNote = async (noteData) => {
    await addNote(noteData);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── HEADER ────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 flex flex-wrap items-center justify-between px-6 py-4 gap-4"
        style={{
          backgroundColor: "#014627",
          boxShadow: "0 4px 24px -2px rgba(0,0,0,0.6), 0 2px 10px -2px rgba(0,0,0,0.4)",
          borderBottom: "1px solid rgba(88,216,94,0.1)",
          position: "relative",
        }}
      >
        {/* Left Side: Logo + Title */}
        <div className="flex items-center gap-4">
          <TeamBrShield size={40} />
          <div>
            <h1
              className="font-barlow-condensed font-extrabold uppercase text-white leading-none"
              style={{ fontSize: "22px", letterSpacing: "0.05em" }}
            >
              Gratitude Board
            </h1>
            <p
              className="font-barlow text-white uppercase tracking-widest"
              style={{ fontSize: "10px", opacity: 0.85, marginTop: "2px" }}
            >
              Team Brazil · First Global Challenge
            </p>
          </div>
        </div>

        {/* Right Side: Search & Filter Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full lg:w-auto min-w-0">
          {/* Search Input - Masking Tape style */}
          <div
            className="flex items-center px-3 py-1.5 w-full sm:w-auto"
            style={{
              backgroundColor: "rgba(245, 245, 220, 0.85)", // Cor de fita crepe (creme translúcido)
              backdropFilter: "blur(2px)",
              minWidth: "160px",
              maxWidth: "100%",
              transform: "rotate(-1.5deg)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              // Bordas picotadas simulando rasgo de fita nas laterais
              clipPath: "polygon(2% 0, 99% 0, 100% 15%, 98% 30%, 100% 50%, 99% 70%, 100% 85%, 98% 100%, 1% 100%, 0 85%, 2% 70%, 0 50%, 1% 30%, 0 15%)",
            }}
          >
            <span style={{ fontSize: "12px", opacity: 0.6, marginRight: "8px", filter: "grayscale(100%)" }}>🖊️</span>
            <input
              type="text"
              placeholder="Buscar no quadro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="font-barlow bg-transparent border-none outline-none w-full placeholder-gray-600"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#1c2e21", // Tinta de canetão escura
                letterSpacing: "0.02em",
              }}
            />
          </div>

          {/* Wrapper rolável para botões no mobile */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-3 w-full lg:w-auto pb-2 sm:pb-0 pt-1 sm:pt-0">
            {/* Filter Toggle */}
            <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => setFilterType("recent")}
              className="px-2 sm:px-4 py-1.5 rounded-sm font-barlow-condensed font-bold uppercase tracking-wider text-[11px] transition-all duration-200"
              style={{
                backgroundColor: filterType === "recent" ? "#F5F5F5" : "rgba(255,255,255,0.08)",
                color: filterType === "recent" ? "#014627" : "rgba(255,255,255,0.6)",
                boxShadow: filterType === "recent" ? "1px 2px 6px rgba(0,0,0,0.25)" : "none",
                border: filterType === "recent" ? "1px solid rgba(0,0,0,0.1)" : "1px dashed rgba(255,255,255,0.2)",
                transform: filterType === "recent" ? "scale(1.05) rotate(-1deg)" : "scale(0.95) rotate(0deg)",
                zIndex: filterType === "recent" ? 10 : 1,
              }}
            >
              <span className="hidden sm:inline">Últimos </span>7 dias
            </button>
            <button
              onClick={() => setFilterType("all")}
              className="px-2 sm:px-4 py-1.5 rounded-sm font-barlow-condensed font-bold uppercase tracking-wider text-[11px] transition-all duration-200"
              style={{
                backgroundColor: filterType === "all" ? "#F5F5F5" : "rgba(255,255,255,0.08)",
                color: filterType === "all" ? "#014627" : "rgba(255,255,255,0.6)",
                boxShadow: filterType === "all" ? "1px 2px 6px rgba(0,0,0,0.25)" : "none",
                border: filterType === "all" ? "1px solid rgba(0,0,0,0.1)" : "1px dashed rgba(255,255,255,0.2)",
                transform: filterType === "all" ? "scale(1.05) rotate(1deg)" : "scale(0.95) rotate(0deg)",
                zIndex: filterType === "all" ? 10 : 1,
              }}
            >
              Todos
            </button>
          </div>
          {/* Layout Toggle */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5 border-l border-white/10 pl-1.5 sm:pl-3">
            <button
              onClick={() => setGroupBy("none")}
              className="px-2 sm:px-4 py-1.5 rounded-sm font-barlow-condensed font-bold uppercase tracking-wider text-[11px] transition-all duration-200"
              style={{
                backgroundColor: groupBy === "none" ? "#F5F5F5" : "rgba(255,255,255,0.08)",
                color: groupBy === "none" ? "#014627" : "rgba(255,255,255,0.6)",
                boxShadow: groupBy === "none" ? "1px 2px 6px rgba(0,0,0,0.25)" : "none",
                border: groupBy === "none" ? "1px solid rgba(0,0,0,0.1)" : "1px dashed rgba(255,255,255,0.2)",
                transform: groupBy === "none" ? "scale(1.05) rotate(-0.5deg)" : "scale(0.95) rotate(0deg)",
                zIndex: groupBy === "none" ? 10 : 1,
              }}
            >
              Grid
            </button>
            <button
              onClick={() => setGroupBy("to")}
              className="px-2 sm:px-4 py-1.5 rounded-sm font-barlow-condensed font-bold uppercase tracking-wider text-[11px] transition-all duration-200"
              style={{
                backgroundColor: groupBy === "to" ? "#F5F5F5" : "rgba(255,255,255,0.08)",
                color: groupBy === "to" ? "#014627" : "rgba(255,255,255,0.6)",
                boxShadow: groupBy === "to" ? "1px 2px 6px rgba(0,0,0,0.25)" : "none",
                border: groupBy === "to" ? "1px solid rgba(0,0,0,0.1)" : "1px dashed rgba(255,255,255,0.2)",
                transform: groupBy === "to" ? "scale(1.05) rotate(1deg)" : "scale(0.95) rotate(0deg)",
                zIndex: groupBy === "to" ? 10 : 1,
              }}
            >
              Pessoas
            </button>
          </div>

          {/* Drawing Tools Toggle */}
          <div className="hidden sm:flex shrink-0 items-center gap-1 sm:gap-1.5 border-l border-white/10 pl-1.5 sm:pl-3">
            <button
              onClick={() => setDrawingTool(drawingTool === "pencil" ? "none" : "pencil")}
              className="w-8 h-8 sm:w-auto sm:px-4 sm:py-1.5 sm:font-barlow-condensed sm:font-bold sm:uppercase sm:tracking-wider sm:text-[11px] rounded-sm transition-all duration-200 flex items-center justify-center sm:gap-1.5"
              style={{
                backgroundColor: drawingTool === "pencil" ? "#58D85E" : "rgba(255, 255, 255, 0.05)",
                boxShadow: drawingTool === "pencil" ? "2px 3px 8px rgba(0,0,0,0.25)" : "none",
                border: drawingTool === "pencil" ? "1px solid rgba(0,0,0,0.05)" : "1px dashed rgba(255,255,255,0.2)",
                transform: drawingTool === "pencil" ? "rotate(-2deg) scale(1.05)" : "rotate(0deg) scale(1)",
                zIndex: drawingTool === "pencil" ? 10 : 1,
              }}
              title="Lápis"
            >
              <span style={{ fontSize: "16px", filter: drawingTool === "pencil" ? "none" : "grayscale(100%)", opacity: drawingTool === "pencil" ? 1 : 0.6 }}>✏️</span>
              <span className="hidden sm:inline" style={{ color: drawingTool === "pencil" ? "#014627" : "rgba(255, 255, 255, 0.6)" }}>Lápis</span>
            </button>
            <button
              onClick={() => setDrawingTool(drawingTool === "eraser" ? "none" : "eraser")}
              className="w-8 h-8 sm:w-auto sm:px-4 sm:py-1.5 sm:font-barlow-condensed sm:font-bold sm:uppercase sm:tracking-wider sm:text-[11px] rounded-sm transition-all duration-200 flex items-center justify-center sm:gap-1.5"
              style={{
                backgroundColor: drawingTool === "eraser" ? "#F1BB01" : "rgba(255, 255, 255, 0.05)",
                boxShadow: drawingTool === "eraser" ? "2px 3px 8px rgba(0,0,0,0.25)" : "none",
                border: drawingTool === "eraser" ? "1px solid rgba(0,0,0,0.05)" : "1px dashed rgba(255,255,255,0.2)",
                transform: drawingTool === "eraser" ? "rotate(2deg) scale(1.05)" : "rotate(0deg) scale(1)",
                zIndex: drawingTool === "eraser" ? 10 : 1,
              }}
              title="Borracha"
            >
              <span style={{ fontSize: "16px", filter: drawingTool === "eraser" ? "none" : "grayscale(100%)", opacity: drawingTool === "eraser" ? 1 : 0.6 }}>🧹</span>
              <span className="hidden sm:inline" style={{ color: drawingTool === "eraser" ? "#101010" : "rgba(255, 255, 255, 0.6)" }}>Borracha</span>
            </button>
          </div>
          </div>
        </div>
      </header>

      {/* ── BOARD CANVAS ──────────────────────────────────── */}
      <main className="flex-1 canvas-bg overflow-auto relative pb-[90px] sm:pb-0">
        <DrawingCanvas drawingTool={drawingTool} />
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4">
            <div
              className="live-dot rounded-full"
              style={{ width: "14px", height: "14px", backgroundColor: "#54A158" }}
            />
            <p
              className="font-barlow-condensed font-bold uppercase text-white tracking-widest"
              style={{ fontSize: "15px", opacity: 0.5 }}
            >
              Carregando board...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-5 px-6">
            <span style={{ fontSize: "48px" }}>⚙️</span>
            <p
              className="font-barlow-condensed font-extrabold uppercase text-center"
              style={{ fontSize: "22px", color: "#58D85E" }}
            >
              Configure o Firebase
            </p>
            <div
              className="font-barlow text-white text-center rounded-lg px-6 py-4 max-w-lg"
              style={{
                fontSize: "13px",
                lineHeight: "1.7",
                backgroundColor: "rgba(84,161,88,0.08)",
                border: "1px solid rgba(84,161,88,0.3)",
              }}
            >
              <p className="mb-3">
                Crie um arquivo <code className="font-bold">.env.local</code> na raiz do projeto com as credenciais do Firebase Realtime Database:
              </p>
              <pre
                className="text-left text-xs overflow-auto p-3 rounded"
                style={{ backgroundColor: "rgba(0,0,0,0.3)", color: "#58D85E" }}
              >
{`NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_DATABASE_URL=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...`}
              </pre>
            </div>
          </div>
        ) : (
          <div 
            className="p-4 sm:p-8 pt-6 sm:pt-10 min-h-full relative z-10"
            style={{ pointerEvents: drawingTool !== "none" ? "none" : "auto" }}
          >
            {notes.length === 0 ? (
              <EmptyBoard 
                onAdd={() => setShowModal(true)}
                title={filterType === "recent" ? "Nenhum agradecimento recente" : "Nenhuma mensagem ainda"}
                description={filterType === "recent" ? "Nenhum post-it foi adicionado nos últimos 7 dias. Seja o primeiro a agradecer alguém esta semana!" : "O quadro está limpo no momento. Que tal ser o primeiro a deixar uma mensagem especial para a equipe?"}
                buttonLabel={filterType === "recent" ? "Adicionar Post-it" : "Primeira Nota"}
              />
            ) : filteredNotes.length === 0 ? (
              <EmptyBoard 
                onAdd={() => setSearchQuery("")}
                title="Busca sem resultados"
                description={`Não encontramos nenhum post-it ou colega contendo "${searchQuery}". Tente usar outros termos!`}
                buttonLabel="Limpar Busca"
                icon="🧹"
              />
            ) : groupBy === "to" ? (
              /* Grouped Notes */
              <div className="flex flex-col gap-12">
                {Object.entries(
                  filteredNotes.reduce((acc, note) => {
                    const isPinned = note.message && note.message.trim().toUpperCase().startsWith("[AVISO]");
                    const to = isPinned ? "📌 AVISOS FIXADOS" : (note.to || "Time Todo").toUpperCase().trim();
                    if (!acc[to]) acc[to] = [];
                    acc[to].push(note);
                    return acc;
                  }, {})
                )
                  .sort(([a], [b]) => {
                    if (a.includes("AVISOS FIXADOS")) return -1;
                    if (b.includes("AVISOS FIXADOS")) return 1;
                    // Coloca "TIME TODO" e "TEAM BRAZIL" primeiro, depois ordem alfabética
                    if (a.includes("TIME") || a.includes("TEAM")) return -1;
                    if (b.includes("TIME") || b.includes("TEAM")) return 1;
                    return a.localeCompare(b);
                  })
                  .map(([person, personNotes]) => (
                    <div key={person} className="animate-pop-in">
                      <h2
                        className="font-barlow-condensed font-extrabold uppercase mb-5 pl-3 flex items-center gap-3"
                        style={{
                          fontSize: "24px",
                          color: "#fff",
                          borderLeft: "5px solid #58D85E",
                          letterSpacing: "0.05em",
                          lineHeight: 1,
                        }}
                      >
                        {person}
                        <span
                          style={{
                            fontSize: "12px",
                            backgroundColor: "rgba(255,255,255,0.1)",
                            padding: "3px 8px",
                            borderRadius: "12px",
                            opacity: 0.8,
                          }}
                        >
                          {personNotes.length} post-its
                        </span>
                      </h2>
                      <div 
                        className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-x-8 gap-y-16 sm:gap-x-7 sm:gap-y-14 items-start w-full px-2 sm:px-0"
                      >
                        {personNotes.map((note, index) => (
                          <PostIt key={note.id} note={note} index={index} selectedSticker={selectedSticker} onStickerPlaced={() => setSelectedSticker(null)} removeNote={removeNote} />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              /* Flat Notes grid */
              <div 
                className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-x-8 gap-y-16 sm:gap-x-7 sm:gap-y-14 items-start w-full px-2 sm:px-0"
              >
                {filteredNotes.map((note, index) => (
                  <PostIt key={note.id} note={note} index={index} selectedSticker={selectedSticker} onStickerPlaced={() => setSelectedSticker(null)} removeNote={removeNote} />
                ))}

                {/* Add slot */}
                {/* Add slot - Ghost Post-it */}
                <button
                  id="add-note-slot-btn"
                  onClick={() => setShowModal(true)}
                  aria-label="Adicionar novo agradecimento"
                  className="group relative flex flex-col items-center justify-center transition-all duration-300 hover:z-10 cursor-pointer w-full max-w-[280px] mx-auto sm:max-w-none p-[18px] pb-[14px] min-h-[170px]"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.03)",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                    border: "2px dashed rgba(255,255,255,0.2)",
                    transform: "rotate(-1.5deg)",
                    boxShadow: "inset 0 0 20px rgba(0,0,0,0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "rotate(0deg) scale(1.05)";
                    e.currentTarget.style.backgroundColor = "rgba(241, 187, 1, 0.08)";
                    e.currentTarget.style.borderColor = "rgba(241, 187, 1, 0.4)";
                    e.currentTarget.style.boxShadow = "2px 4px 12px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "rotate(-1.5deg) scale(1)";
                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                    e.currentTarget.style.boxShadow = "inset 0 0 20px rgba(0,0,0,0.1)";
                  }}
                >
                  {/* Fake Tape Outline */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-12px",
                      left: "50%",
                      transform: "translateX(-50%) rotate(2deg)",
                      width: "80px",
                      height: "24px",
                      backgroundColor: "rgba(255,255,255,0.05)",
                      backdropFilter: "blur(2px)",
                      border: "1px dashed rgba(255,255,255,0.3)",
                      clipPath: "polygon(2% 0, 98% 0, 100% 15%, 98% 30%, 100% 50%, 98% 70%, 100% 85%, 98% 100%, 2% 100%, 0 85%, 2% 70%, 0 50%, 2% 30%, 0 15%)",
                    }}
                  />
                  <div className="flex flex-col items-center opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                    <span style={{ fontSize: "32px", filter: "grayscale(100%)" }} className="group-hover:filter-none mb-2">
                      ✍️
                    </span>
                    <span
                      className="font-barlow-condensed font-bold uppercase tracking-widest text-center"
                      style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}
                    >
                      Escrever<br/>Post-it
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer
        className="flex items-center justify-between px-4 py-4 sm:px-8 sm:py-4 fixed sm:static bottom-0 left-0 right-0 z-50 w-full"
        style={{
          backgroundColor: "#014627",
          boxShadow: "0 -4px 24px -2px rgba(0,0,0,0.6), 0 -2px 10px -2px rgba(0,0,0,0.4)",
          borderTop: "1px solid rgba(88,216,94,0.1)",
        }}
      >
        <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center rounded-full flex-shrink-0"
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "rgba(255,255,255,0.08)",
                border: "1.5px solid rgba(255,255,255,0.15)",
              }}
            >
              <span style={{ fontSize: "18px", lineHeight: 1 }}>❤️</span>
            </div>

            {/* Number + label */}
            <div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`font-barlow-condensed font-extrabold text-white leading-none ${countBump ? "count-bump" : ""}`}
                  style={{ fontSize: "32px", lineHeight: 1 }}
                >
                  {filteredNotes.length}
                </span>
                <span
                  className="font-barlow-condensed font-semibold"
                  style={{ fontSize: "14px", color: "rgba(88,216,94,0.7)", letterSpacing: "0.02em" }}
                >
                  {filteredNotes.length === 1 ? "post-it" : "post-its"}
                </span>
              </div>
              <p
                className="font-barlow uppercase tracking-widest text-white"
                style={{ fontSize: "9px", opacity: 0.35, marginTop: "2px" }}
              >
                {filterType === "recent" ? "agradecimentos recentes (7 dias)" : "agradecimentos no total"}
              </p>
          </div>
        </div>

        {/* CTA button with Tape - Redesigned as a Post-it */}
        <div className="relative group" style={{ perspective: "1000px" }}>
          {/* Fita adesiva segurando o botão */}
          <div
            id="footer-tape"
            style={{
              position: "absolute",
              top: "-8px",
              left: "50%",
              transform: "translateX(-50%) rotate(3deg)",
              width: "45px",
              height: "16px",
              backgroundColor: "rgba(255, 255, 255, 0.25)",
              backdropFilter: "blur(2px)",
              WebkitBackdropFilter: "blur(2px)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1), inset 0 0 2px rgba(255,255,255,0.3)",
              clipPath: "polygon(5% 0%, 95% 0%, 93% 8%, 97% 16%, 92% 25%, 96% 38%, 92% 50%, 98% 62%, 93% 75%, 97% 88%, 95% 100%, 5% 100%, 8% 90%, 3% 80%, 7% 70%, 2% 58%, 8% 46%, 3% 34%, 7% 22%, 2% 10%)",
              zIndex: 50,
              pointerEvents: "none",
              transition: "all 0.3s ease",
            }}
          />
          <button
            id="add-note-footer-btn"
            onClick={() => setShowModal(true)}
            className="font-barlow-condensed font-extrabold uppercase flex items-center justify-center relative z-40 transition-all duration-300"
            style={{
              width: "140px",
              height: "45px",
              fontSize: "18px",
              letterSpacing: "0.08em",
              backgroundColor: "#F1BB01", // Amarelo Post-it
              color: "#014627", // Verde escuro para contraste
              border: "none",
              cursor: "pointer",
              transform: "rotate(-2deg)",
              boxShadow: "2px 4px 10px rgba(0,0,0,0.3), inset -2px -2px 6px rgba(0,0,0,0.05)",
              borderRadius: "2px 2px 12px 2px", // Cantinho levemente dobrado visualmente
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "rotate(0deg) scale(1.05) translateY(-2px)";
              e.currentTarget.style.boxShadow = "4px 8px 15px rgba(0,0,0,0.4), inset -2px -2px 6px rgba(0,0,0,0.05)";
              const tape = document.getElementById("footer-tape");
              if (tape) {
                tape.style.transform = "translateX(-50%) rotate(5deg) scale(1.05) translateY(-4px)";
                tape.style.boxShadow = "0 3px 6px rgba(0,0,0,0.2), inset 0 0 2px rgba(255,255,255,0.4)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "rotate(-2deg) scale(1) translateY(0)";
              e.currentTarget.style.boxShadow = "2px 4px 10px rgba(0,0,0,0.3), inset -2px -2px 6px rgba(0,0,0,0.05)";
              const tape = document.getElementById("footer-tape");
              if (tape) {
                tape.style.transform = "translateX(-50%) rotate(3deg) scale(1) translateY(0)";
                tape.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1), inset 0 0 2px rgba(255,255,255,0.3)";
              }
            }}
          >
            ESCREVER
          </button>
        </div>
      </footer>

      {/* ── MODAL DE ADICIONAR ──────────────────────────── */}
      {showModal && (
        <AddNoteModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleAddNote}
        />
      )}

      {/* ── PALETA DE ADESIVOS ────────────────────────────── */}
      <StickerPalette selectedSticker={selectedSticker} onSelectSticker={setSelectedSticker} />
    </div>
  );
}
