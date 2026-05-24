"use client";

import React, { useRef, useEffect, useState } from "react";

export default function DrawingCanvas({ drawingTool }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const committedCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const currentPathRef = useRef([]);

  // Ajusta o tamanho do canvas para cobrir todo o container (que acompanha o scroll)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!committedCanvasRef.current) {
      committedCanvasRef.current = document.createElement("canvas");
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const canvas = canvasRef.current;
      const committed = committedCanvasRef.current;
      if (!canvas || !committed) return;
      
      const { width, height } = entries[0].contentRect;
      if (canvas.width === width && canvas.height === height) return;
      
      // Salva o desenho antigo
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = committed.width || 1;
      tempCanvas.height = committed.height || 1;
      tempCanvas.getContext("2d").drawImage(committed, 0, 0);

      // Redimensiona
      canvas.width = width;
      canvas.height = height;
      committed.width = width;
      committed.height = height;

      // Restaura o desenho antigo
      committed.getContext("2d").drawImage(tempCanvas, 0, 0);
      canvas.getContext("2d").drawImage(tempCanvas, 0, 0);
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Previne seleção acidental de texto durante o desenho
  useEffect(() => {
    if (drawingTool !== "none") {
      document.body.style.userSelect = "none";
      document.body.style.webkitUserSelect = "none";
    } else {
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
    }
    
    return () => {
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
    };
  }, [drawingTool]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e) => {
    if (drawingTool === "none") return;
    e.target.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    
    const currentPos = getCoordinates(e);
    lastPos.current = currentPos;
    currentPathRef.current = [currentPos];

    if (drawingTool === "eraser") {
      eraseSegment(currentPos, currentPos);
    } else {
      renderActivePath();
    }
  };

  const handlePointerMove = (e) => {
    if (drawingTool === "none" || !isDrawing) return;
    const currentPos = getCoordinates(e);

    if (drawingTool === "eraser") {
      eraseSegment(lastPos.current, currentPos);
      lastPos.current = currentPos;
    } else {
      currentPathRef.current.push(currentPos);
      renderActivePath();
    }
  };

  const handlePointerUp = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    e.target.releasePointerCapture(e.pointerId);

    if (drawingTool === "pencil") {
      commitActivePath();
    }
    currentPathRef.current = [];
  };

  // Renderiza a linha contínua do lápis (sem sobreposição de opacidade nas juntas)
  const renderActivePath = () => {
    const canvas = canvasRef.current;
    const committed = committedCanvasRef.current;
    const ctx = canvas.getContext("2d");

    // Limpa a tela principal e restaura a arte definitiva para evitar "sombreamento" cumulativo
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(committed, 0, 0);

    const path = currentPathRef.current;
    if (path.length === 0) return;

    ctx.beginPath();
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"; // Brilho perfeito
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (path.length === 1) {
      // Pinguinho
      ctx.arc(path[0].x, path[0].y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
  };

  // Salva a linha ativa na arte definitiva quando o mouse levanta
  const commitActivePath = () => {
    const committed = committedCanvasRef.current;
    const ctx = committed.getContext("2d");
    const path = currentPathRef.current;
    if (path.length === 0) return;

    ctx.beginPath();
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (path.length === 1) {
      ctx.arc(path[0].x, path[0].y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
  };

  // Apaga pixels definitivamente
  const eraseSegment = (from, to) => {
    const canvas = canvasRef.current;
    const committed = committedCanvasRef.current;
    
    [canvas.getContext("2d"), committed.getContext("2d")].forEach(ctx => {
      ctx.beginPath();
      // Mágica da Borracha
      ctx.globalCompositeOperation = "destination-out";
      // Alpha 1 garante que 100% da opacidade seja removida (não deixa rastros)
      ctx.strokeStyle = "rgba(0, 0, 0, 1)"; 
      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      ctx.lineWidth = 40;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (from.x === to.x && from.y === to.y) {
        ctx.arc(from.x, from.y, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }
    });
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: drawingTool !== "none" ? "auto" : "none",
        touchAction: drawingTool !== "none" ? "none" : "auto",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ display: "block" }}
      />
    </div>
  );
}
