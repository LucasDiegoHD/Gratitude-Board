// Script one-shot para limpar todas as reações do Firebase
// Uso: node scripts/reset-reactions.mjs

import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Carrega variáveis de ambiente do .env.local
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

const envContent = readFileSync(envPath, "utf-8");
envContent.split("\n").forEach((line) => {
  const [key, ...val] = line.split("=");
  if (key && val.length) process.env[key.trim()] = val.join("=").trim();
});

// Firebase setup
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, remove } from "firebase/database";

const app = initializeApp({
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL:       process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

const db = getDatabase(app);

async function resetReactions() {
  const notesRef = ref(db, "sessions/sprint-current/notes");
  const snapshot = await get(notesRef);
  const notes = snapshot.val();

  if (!notes) {
    console.log("ℹ️  Nenhuma nota encontrada.");
    process.exit(0);
  }

  const noteIds = Object.keys(notes);
  console.log(`🔍 ${noteIds.length} post-its encontrados. Limpando reações...`);

  await Promise.all(
    noteIds.map((id) => remove(ref(db, `sessions/sprint-current/notes/${id}/reactions`)))
  );

  console.log(`✅ Reações limpas de ${noteIds.length} post-its!`);
  process.exit(0);
}

resetReactions().catch((err) => {
  console.error("❌ Erro:", err.message);
  process.exit(1);
});
