import axios from 'axios';
import * as cheerio from 'cheerio';
const htmlToText = require('html-to-text');
import { prisma } from '../config/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const knowledgeService = {
  /**
   * Scrape content from a URL and save it to Knowledge Base
   */
  async ingestUrl(knowledgeBaseId: string, url: string) {
    const source = await prisma.knowledgeSource.create({
      data: {
        knowledgeBaseId,
        type: 'URL',
        url,
        status: 'PROCESSING',
      },
    });

    try {
      const { data: html } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(html);
      
      // Remove noise
      $('script, style, nav, footer, iframe, header').remove();

      const text = htmlToText.convert($.html(), {
        wordwrap: 130,
        selectors: [
          { selector: 'a', options: { ignoreHref: true } },
          { selector: 'img', format: 'skip' },
        ],
      });

      await this.processContent(source.id, text);
      
      await prisma.knowledgeSource.update({
        where: { id: source.id },
        data: { status: 'COMPLETED' },
      });

      return { success: true, message: 'Source ingested successfully' };
    } catch (error: any) {
      console.error(`[Knowledge] Error ingesting ${url}:`, error.message);
      await prisma.knowledgeSource.update({
        where: { id: source.id },
        data: { status: 'FAILED' },
      });
      throw error;
    }
  },

  /**
   * Process raw text into chunks and generate embeddings
   */
  async processContent(sourceId: string, text: string) {
    // 1. Chunking (simple per-paragraph or fixed length)
    const chunks = this.createChunks(text, 1000); // 1000 chars per chunk

    for (const chunk of chunks) {
      // 2. Generate Embedding
      let embeddingJson = null;
      if (process.env.GEMINI_API_KEY) {
        try {
          const model = genAI.getGenerativeModel({ model: "embedding-001"});
          const result = await model.embedContent(chunk);
          embeddingJson = result.embedding.values;
        } catch (e) {
          console.error('[Knowledge] Embedding failed:', e);
        }
      }

      // 3. Save Chunk
      await prisma.knowledgeChunk.create({
        data: {
          knowledgeSourceId: sourceId,
          content: chunk,
          embedding: embeddingJson as any,
        },
      });
    }
  },

  createChunks(text: string, size: number): string[] {
    const chunks: string[] = [];
    const normalized = text.replace(/\n\s*\n/g, '\n\n').trim();
    const parts = normalized.split('\n\n');

    let current = '';
    for (const part of parts) {
      if ((current.length + part.length) > size) {
        if (current) chunks.push(current);
        current = part;
      } else {
        current += (current ? '\n\n' : '') + part;
      }
    }
    if (current) chunks.push(current);
    
    return chunks;
  },

  /**
   * Search for relevant context based on a query using Cosine Similarity
   */
  async getRelevantContext(knowledgeBaseId: string, query: string, limit = 3) {
    const chunks = await prisma.knowledgeChunk.findMany({
      where: {
        source: {
            knowledgeBaseId: knowledgeBaseId
        }
      },
    });

    if (chunks.length === 0) return '';

    // If query embedding is available, perform semantic search
    if (process.env.GEMINI_API_KEY) {
        try {
            const model = genAI.getGenerativeModel({ model: "embedding-001"});
            const result = await model.embedContent(query);
            const queryEmbedding = result.embedding.values;

            const scoredChunks = chunks
                .filter(c => c.embedding)
                .map(chunk => ({
                    ...chunk,
                    score: this.cosineSimilarity(queryEmbedding, chunk.embedding as number[])
                }))
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);

            return scoredChunks.map(c => c.content).join('\n\n---\n\n');
        } catch (e) {
            console.error('[Knowledge] Semantic search failed:', e);
        }
    }

    // Fallback: simple top-N chunks
    return chunks.slice(0, limit).map(c => c.content).join('\n\n---\n\n');
  },

  cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
};
