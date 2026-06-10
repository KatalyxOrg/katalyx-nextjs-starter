import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

import { env } from "@/server/env";

export type ModelProvider = "openai" | "anthropic";

export type ModelCatalogEntry = {
  id: string;
  provider: ModelProvider;
  modelId: string;
  label: string;
};

export const MODEL_CATALOG: ModelCatalogEntry[] = [
  { id: "openai/gpt-5.4", provider: "openai", modelId: "gpt-5.4", label: "GPT-5.4" },
  { id: "openai/gpt-5.4-mini", provider: "openai", modelId: "gpt-5.4-mini", label: "GPT-5.4 Mini" },
  { id: "openai/gpt-4o", provider: "openai", modelId: "gpt-4o", label: "GPT-4o" },
  { id: "openai/gpt-4o-mini", provider: "openai", modelId: "gpt-4o-mini", label: "GPT-4o Mini" },
  {
    id: "anthropic/claude-sonnet-4-6",
    provider: "anthropic",
    modelId: "claude-sonnet-4-6",
    label: "Claude Sonnet 4.6",
  },
  {
    id: "anthropic/claude-haiku-4-5",
    provider: "anthropic",
    modelId: "claude-haiku-4-5",
    label: "Claude Haiku 4.5",
  },
];

const openaiProvider = env.OPENAI_API_KEY
  ? createOpenAI({ apiKey: env.OPENAI_API_KEY })
  : null;

const anthropicProvider = env.ANTHROPIC_API_KEY
  ? createAnthropic({ apiKey: env.ANTHROPIC_API_KEY })
  : null;

function getCatalogEntry(modelId: string): ModelCatalogEntry | undefined {
  return MODEL_CATALOG.find((entry) => entry.id === modelId);
}

export function listAvailableModels(): ModelCatalogEntry[] {
  return MODEL_CATALOG.filter((entry) => {
    if (entry.provider === "openai") return openaiProvider !== null;
    if (entry.provider === "anthropic") return anthropicProvider !== null;
    return false;
  });
}

export function hasConfiguredProvider(): boolean {
  return listAvailableModels().length > 0;
}

export function getDefaultModelId(): string | null {
  const available = listAvailableModels();
  if (available.length === 0) return null;

  if (env.DEFAULT_MODEL_ID) {
    const preferred = available.find((entry) => entry.id === env.DEFAULT_MODEL_ID);
    if (preferred) return preferred.id;

    console.warn(
      `[ai/providers] DEFAULT_MODEL_ID "${env.DEFAULT_MODEL_ID}" absent du catalogue ou fournisseur non configuré — repli sur "${available[0]?.id}".`,
    );
  }

  return available[0]?.id ?? null;
}

export function getModel(modelId: string): LanguageModel {
  const entry = getCatalogEntry(modelId);
  if (!entry) {
    throw new Error(`Modèle inconnu : ${modelId}`);
  }

  if (entry.provider === "openai") {
    if (!openaiProvider) {
      throw new Error("OPENAI_API_KEY n'est pas configurée.");
    }
    return openaiProvider(entry.modelId);
  }

  if (!anthropicProvider) {
    throw new Error("ANTHROPIC_API_KEY n'est pas configurée.");
  }
  return anthropicProvider(entry.modelId);
}
