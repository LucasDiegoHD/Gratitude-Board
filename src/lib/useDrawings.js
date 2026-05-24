import { useState } from "react";

export function useDrawings() {
  const [strokes, setStrokes] = useState([]);

  const addStroke = (points, color = "rgba(255, 255, 255, 0.4)", width = 5) => {
    if (!points || points.length === 0) return;
    
    const newStroke = {
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      points,
      color,
      width,
      timestamp: Date.now()
    };
    
    setStrokes((prev) => [...prev, newStroke]);
  };

  const clearDrawings = () => {
    setStrokes([]);
  };

  const removeStroke = (id) => {
    setStrokes((prev) => prev.filter((stroke) => stroke.id !== id));
  };

  return { strokes, addStroke, clearDrawings, removeStroke };
}
