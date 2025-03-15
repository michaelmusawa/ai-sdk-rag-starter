import { Resource } from "@prisma/client";
import { prisma } from "@/lib/db";
import { nanoid } from "@/lib/utils";

// Type definition
export type Embedding = {
  id: string;
  resourceId: string;
  content: string;
  embedding: Buffer;
  createdAt: Date;
};

// Helper function to create embeddings
export const createEmbeddings = async (
  resourceId: string,
  chunks: Array<{
    content: string;
    embedding: number[];
  }>
) => {
  return prisma.$transaction(
    chunks.map((chunk) =>
      prisma.embedding.create({
        data: {
          id: nanoid(),
          resourceId,
          content: chunk.content,
          embedding: Buffer.from(new Float32Array(chunk.embedding).buffer),
          createdAt: new Date(),
        },
      })
    )
  );
};

// Query helper for similarity search
export const findSimilarEmbeddings = async (
  embedding: number[],
  threshold: number = 0.78,
  limit: number = 5
) => {
  const embeddingBuffer = Buffer.from(new Float32Array(embedding).buffer);

  return prisma.$queryRaw<Embedding[]>`
      SELECT TOP ${limit} 
        e.content,
        e.resource_id,
        CAST(1 - ( 
          SQRT( 
            SUM( 
              POWER( 
                CAST(JSON_VALUE(e.embedding, '$[${prisma.raw(
                  Array.from({ length: 1536 }, (_, i) => i)
                    .map((i) => `$${i}`)
                    .join(",")
                )}]') AS FLOAT) - ${embeddingBuffer}
              , 2)
          ) 
        ) AS similarity
      FROM embeddings e
      WHERE similarity > ${threshold}
      ORDER BY similarity DESC
    `;
};
