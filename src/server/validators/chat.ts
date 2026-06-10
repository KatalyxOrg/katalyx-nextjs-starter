import { z } from "zod";

const uiMessagePartSchema = z.object({
  type: z.string(),
}).passthrough();

const uiMessageSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["user", "assistant", "system"]),
  parts: z.array(uiMessagePartSchema),
}).passthrough();

export const chatRequestSchema = z.object({
  conversationId: z.string().cuid(),
  agentId: z.string().min(1),
  messages: z.array(uiMessageSchema).min(1),
});

export const renameConversationSchema = z.object({
  conversationId: z.string().cuid(),
  title: z.string().trim().min(1).max(120),
});

export const deleteConversationSchema = z.object({
  conversationId: z.string().cuid(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
