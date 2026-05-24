import { useEffect, useState, useCallback } from "react";
import { db } from "./firebase";
import { ref, onValue, push, remove } from "firebase/database";

const SESSION_ID = "sprint-current";

export function useStickers(noteId) {
  const [stickers, setStickers] = useState([]);

  useEffect(() => {
    if (!db || !noteId) return;
    const stickersRef = ref(
      db,
      `sessions/${SESSION_ID}/notes/${noteId}/stickers`
    );
    const unsubscribe = onValue(stickersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed = Object.entries(data).map(([id, val]) => ({
          id,
          ...val,
        }));
        setStickers(parsed);
      } else {
        setStickers([]);
      }
    });
    return () => unsubscribe();
  }, [noteId]);

  const addSticker = useCallback(
    async (emoji, xPct, yPct) => {
      if (!db || !noteId) return;
      const stickersRef = ref(
        db,
        `sessions/${SESSION_ID}/notes/${noteId}/stickers`
      );
      await push(stickersRef, {
        emoji,
        x: xPct,
        y: yPct,
        timestamp: Date.now(),
      });
    },
    [noteId]
  );

  const removeSticker = useCallback(
    async (stickerId) => {
      if (!db || !noteId) return;
      const stickerRef = ref(
        db,
        `sessions/${SESSION_ID}/notes/${noteId}/stickers/${stickerId}`
      );
      await remove(stickerRef);
    },
    [noteId]
  );

  return { stickers, addSticker, removeSticker };
}
