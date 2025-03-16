import { embedMany } from "ai";
import { groq } from "@ai-sdk/groq";
import { prisma } from "@/lib/db";

const embeddingModel = groq.textEmbeddingModel("text-embedding-ada-002");

const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split(".")
    .filter((i) => i !== "");
};

export const generateEmbeddings = async (
  value: string
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll("\\n", " ");
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
};

export const findRelevantContent = async (userQuery: string) => {
  try {
    // Generate embedding for user query
    const userQueryEmbedded = await generateEmbedding(userQuery);

    // Retrieve all stored embeddings from the database
    const storedEmbeddings = await prisma.embeddings.findMany({
      include: {
        resource: true, // Assuming a relation to KnowledgeBase
      },
    });

    // Compute cosine similarity for each stored embedding
    const results = storedEmbeddings
      .map(({ vector, resource }) => {
        const storedVector = JSON.parse(vector.toString()) as number[]; // Convert VARBINARY back to array
        const similarity = cosineSimilarity(userQueryEmbedded, storedVector);
        return { content: resource.content, similarity };
      })
      .filter(({ similarity }) => similarity > 0.5) // Filter based on threshold
      .sort((a, b) => b.similarity - a.similarity) // Sort descending by similarity
      .slice(0, 4); // Limit to top 4 results

    return results.length > 0 ? results : "Sorry, I don't know.";
  } catch (error) {
    console.error("Error finding relevant content:", error);
    return "Error retrieving relevant content.";
  }
};

// Function to calculate cosine similarity
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b ** 2, 0));
  return dotProduct / (magnitudeA * magnitudeB);
};
