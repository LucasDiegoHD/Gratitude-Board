import { useEffect, useState, useCallback } from "react";
import { db } from "./firebase";
import { ref, onValue, push, serverTimestamp, remove } from "firebase/database";

const SESSION_ID = "sprint-current";

export function useComments(noteId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !noteId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const commentsRef = ref(db, `sessions/${SESSION_ID}/notes/${noteId}/comments`);
    
    const unsubscribe = onValue(
      commentsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const parsed = Object.entries(data).map(([id, val]) => ({
            id,
            ...val,
          }));
          // Ordena por data de criação crescente
          parsed.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
          setComments(parsed);
        } else {
          setComments([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error("[useComments] Firebase error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [noteId]);

  const addComment = useCallback(
    async (from, message) => {
      if (!db || !noteId) return;
      const commentsRef = ref(db, `sessions/${SESSION_ID}/notes/${noteId}/comments`);
      const newCommentRef = push(commentsRef);

      try {
        const myComments = JSON.parse(localStorage.getItem("myComments") || "[]");
        myComments.push(newCommentRef.key);
        localStorage.setItem("myComments", JSON.stringify(myComments));
        // Dispara um evento para atualizar o estado de autoria dos botões de apagar do comentário
        window.dispatchEvent(new Event("storage_myComments_updated"));
      } catch (e) {
        console.error("Erro ao salvar autoria do comentário no localStorage", e);
      }

      const { set } = await import("firebase/database");
      await set(newCommentRef, {
        from: from || "Anônimo",
        message: message.trim(),
        createdAt: serverTimestamp(),
      });
    },
    [noteId]
  );

  const removeComment = useCallback(
    async (commentId) => {
      if (!db || !noteId) return;
      const commentRef = ref(db, `sessions/${SESSION_ID}/notes/${noteId}/comments/${commentId}`);
      await remove(commentRef);
    },
    [noteId]
  );

  return { comments, loading, addComment, removeComment };
}
