"use server";

import sql from "mssql";
import { pool } from "@/lib/db";
import { generateEmbeddings } from "../ai/embedding";

// Define the input type
interface NewResourceParams {
  content: string;
}

// Function to add a new resource with embeddings
export const createResource = async (input: NewResourceParams) => {
  try {
    const { content } = input;

    // Insert resource content into the database
    const result = await pool.request().input("content", sql.NVarChar, content)
      .query(`
        INSERT INTO KnowledgeBase (content) 
        OUTPUT INSERTED.id 
        VALUES (@content)
      `);

    const resourceId = result.recordset[0].id;

    // Generate embeddings for the content
    const embeddings = await generateEmbeddings(content);

    // Store embeddings in the database
    for (const embedding of embeddings) {
      await pool
        .request()
        .input("resourceId", sql.Int, resourceId)
        .input("vector", sql.VarBinary, Buffer.from(JSON.stringify(embedding)))
        .query(`
          INSERT INTO Embeddings (resourceId, vector) 
          VALUES (@resourceId, @vector)
        `);
    }

    return "Resource successfully created and embedded.";
  } catch (error) {
    console.error("Error adding resource:", error);
    return error instanceof Error && error.message.length > 0
      ? error.message
      : "Error, please try again.";
  }
};
