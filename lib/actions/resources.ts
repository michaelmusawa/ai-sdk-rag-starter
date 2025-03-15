"use server";

import { prisma } from "@/lib/db";
import { nanoid } from "@/lib/utils";
import { generateEmbeddings } from "../ai/embedding";
import { embeddings as embeddingsTable } from "../db/schema/embeddings";

export const createResource = async (input: any) => {
  try {
    await prisma.resource.create({
      data: {
        id: nanoid(),
        content: input.content,
      },
    });

    // const embeddings = await generateEmbeddings(content);
    // await db.insert(embeddingsTable).values(
    //   embeddings.map(embedding => ({
    //     resourceId: resource.id,
    //     ...embedding,
    //   })),
    // );

    const embeddings = await generateEmbeddings(input.content);

    await prisma.resource.create({
      data: {
        id: nanoid(),
        content: input.content,
      },
    });

    return "Resource successfully created.";
  } catch (e) {
    if (e instanceof Error)
      return e.message.length > 0 ? e.message : "Error, please try again.";
  }
};
