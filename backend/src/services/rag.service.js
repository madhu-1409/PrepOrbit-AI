const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

const EMBEDDING_MODEL = "gemini-embedding-001";
const CHUNK_SIZE = 250;   // approx characters per chunk
const TOP_K = 6;          // chunks kept after retrieval
const MAX_CHUNKS = 90;    // safety cap for one batch call

// 1. Split resume text into chunks (by lines, merged up to CHUNK_SIZE)
function chunkResume(text) {
    const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

    const chunks = [];
    let current = "";

    for (const line of lines) {
        if ((current + " " + line).length > CHUNK_SIZE && current) {
            chunks.push(current.trim());
            current = line;
        } else {
            current += (current ? "\n" : "") + line;
        }
    }
    if (current.trim()) chunks.push(current.trim());

    return chunks.slice(0, MAX_CHUNKS);
}

// 2. Embed a list of texts with Gemini
async function embedTexts(texts) {
    const response = await ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: texts
    });
    return response.embeddings.map((e) => e.values);
}

// 3. Cosine similarity
function cosine(a, b) {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }
    return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

// 4. Main function: returns the most relevant resume chunks, or null on any failure
async function retrieveRelevantResume(resume, jobDescription) {
    try {
        if (!resume || !jobDescription) return null;

        const chunks = chunkResume(resume);
        if (chunks.length < 2) return null;

        const vectors = await embedTexts([...chunks, jobDescription]);
        const jdVector = vectors[vectors.length - 1];

        const scored = chunks.map((chunk, i) => ({
            chunk,
            index: i,
            score: cosine(vectors[i], jdVector)
        }));

        const top = scored
            .sort((a, b) => b.score - a.score)
            .slice(0, TOP_K)
            .sort((a, b) => a.index - b.index); // keep original resume order

        console.log(`RAG: retrieved ${top.length} of ${chunks.length} resume chunks`);
        return top.map((t) => t.chunk).join("\n\n");
    } catch (err) {
        console.log("RAG failed, using full resume instead:", err.message);
        return null;
    }
}

module.exports = { retrieveRelevantResume };
