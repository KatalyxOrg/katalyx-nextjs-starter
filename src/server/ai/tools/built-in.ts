import { tool, type ToolSet } from "ai";
import { z } from "zod";

export const builtInTools: ToolSet = {
  getCurrentTime: tool({
    description: "Retourne la date et l'heure actuelles au format ISO 8601.",
    inputSchema: z.object({
      timezone: z
        .string()
        .optional()
        .describe("Fuseau horaire IANA (ex. Europe/Paris). Par défaut : UTC."),
    }),
    execute: async ({ timezone }) => {
      const now = new Date();
      if (!timezone) {
        return { iso: now.toISOString(), timezone: "UTC" };
      }

      try {
        const formatted = new Intl.DateTimeFormat("fr-FR", {
          timeZone: timezone,
          dateStyle: "full",
          timeStyle: "long",
        }).format(now);

        return { iso: now.toISOString(), timezone, formatted };
      } catch {
        return {
          error: `Fuseau horaire invalide : ${timezone}`,
        };
      }
    },
  }),
};
