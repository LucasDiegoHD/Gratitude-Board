import { useEffect, useState, useCallback } from "react";
import { db } from "./firebase";
import { ref, onValue, runTransaction } from "firebase/database";

const SESSION_ID = "sprint-current";

export const REACTION_EMOJIS = ["❤️", "🔥", "👏", "🎉", "🙌", "😲"];

function encodeEmoji(emoji) {
  return [...emoji].map((c) => c.codePointAt(0).toString(16)).join("_");
}

/** Chave no localStorage — 1 por post-it */
function localKey(noteId) {
  return `gr_rxn_${noteId}`;
}

export function useReactions(noteId) {
  const [reactions, setReactions] = useState({});
  const [myReaction, setMyReaction] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined" || !noteId) return;
    const stored = localStorage.getItem(localKey(noteId));
    setMyReaction(stored || null);
  }, [noteId]);

  useEffect(() => {
    if (!db || !noteId) return;
    const reactionsRef = ref(
      db,
      `sessions/${SESSION_ID}/notes/${noteId}/reactions`
    );
    const unsubscribe = onValue(reactionsRef, (snapshot) => {
      setReactions(snapshot.val() || {});
    });
    return () => unsubscribe();
  }, [noteId]);

  const addReaction = useCallback(
    (emoji) => {
      if (!db || !noteId) return;

      const previousEmoji = localStorage.getItem(localKey(noteId));

      // ── Toggle: clicou no mesmo emoji → remove a reação ───────────
      if (previousEmoji === emoji) {
        const emojiRef = ref(
          db,
          `sessions/${SESSION_ID}/notes/${noteId}/reactions/${encodeEmoji(emoji)}`
        );
        runTransaction(emojiRef, (current) => Math.max((current || 0) - 1, 0));
        localStorage.removeItem(localKey(noteId));
        setMyReaction(null);
        return;
      }

      // ── Troca: tinha outro emoji → decrementa o antigo ────────────
      if (previousEmoji) {
        const oldRef = ref(
          db,
          `sessions/${SESSION_ID}/notes/${noteId}/reactions/${encodeEmoji(previousEmoji)}`
        );
        runTransaction(oldRef, (current) => Math.max((current || 0) - 1, 0));
      }

      // ── Adiciona o novo emoji ─────────────────────────────────────
      const newRef = ref(
        db,
        `sessions/${SESSION_ID}/notes/${noteId}/reactions/${encodeEmoji(emoji)}`
      );
      runTransaction(newRef, (current) => (current || 0) + 1);
      localStorage.setItem(localKey(noteId), emoji);
      setMyReaction(emoji);
    },
    [noteId]
  );

  const reactionList = REACTION_EMOJIS.map((emoji) => ({
    emoji,
    count: reactions[encodeEmoji(emoji)] || 0,
    isMyReaction: emoji === myReaction,
    hasReacted: myReaction !== null,
  }));

  return { reactionList, addReaction };
}
