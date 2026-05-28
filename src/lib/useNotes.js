import { useEffect, useState, useCallback } from "react";
import { db } from "./firebase";
import { ref, onValue, push, serverTimestamp, query, orderByChild, startAt, remove } from "firebase/database";

const SESSION_ID = "sprint-current";

export function useNotes(filterType = "recent") {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If Firebase wasn't initialized (missing env vars), stop loading
    if (!db) {
      setLoading(false);
      setError("Firebase não configurado. Adicione as variáveis de ambiente no arquivo .env.local");
      return;
    }

    setLoading(true);

    const notesRef = ref(db, `sessions/${SESSION_ID}/notes`);
    let notesQuery = notesRef;

    if (filterType === "recent") {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      notesQuery = query(
        notesRef,
        orderByChild("createdAt"),
        startAt(sevenDaysAgo)
      );
    }

    const unsubscribe = onValue(
      notesQuery,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const parsed = Object.entries(data).map(([id, val]) => ({
            id,
            ...val,
          }));
          parsed.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
          setNotes(parsed);
        } else {
          setNotes([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error("[useNotes] Firebase error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filterType]);

  const addNote = useCallback(async ({ to, message, from, color, category }) => {
    if (!db) {
      console.warn("Firebase não disponível — nota não salva.");
      return;
    }
    const notesRef = ref(db, `sessions/${SESSION_ID}/notes`);
    const newNoteRef = push(notesRef); // Gera a chave de forma síncrona localmente

    try {
      const myNotes = JSON.parse(localStorage.getItem("myNotes") || "[]");
      myNotes.push(newNoteRef.key);
      localStorage.setItem("myNotes", JSON.stringify(myNotes));
      // Dispara um evento customizado para os Post-its montados verificarem a autoria novamente
      window.dispatchEvent(new Event("storage_myNotes_updated"));
    } catch (e) {
      console.error("Erro ao salvar autoria no localStorage", e);
    }

    // Só depois de salvar no navegador, enviamos pro Firebase
    const { set } = await import("firebase/database");
    await set(newNoteRef, {
      to,
      message,
      from: from || "Anônimo",
      color,
      category: category || "general",
      createdAt: serverTimestamp(),
    });
  }, []);

  const removeNote = useCallback(async (noteId) => {
    if (!db) return;
    const noteRef = ref(db, `sessions/${SESSION_ID}/notes/${noteId}`);
    await remove(noteRef);
  }, []);

  return { notes, loading, error, addNote, removeNote };
}
