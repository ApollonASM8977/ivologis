import { Global, Injectable, Logger, Module } from "@nestjs/common";

/**
 * Traduction automatique français → anglais du contenu saisi par l'agence (nom et description des annonces), D-14.
 * Prestataire : DeepL (API Free : 500 000 caractères/mois gratuits ; clé terminée par « :fx »). Variable : DEEPL_API_KEY.
 * Sans clé, rien n'est envoyé : l'agence saisit la version anglaise elle-même. Appelé seulement par des actions de
 * l'agence authentifiées (jamais par une route publique) : pas de consommation abusive possible depuis l'extérieur.
 */
@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);

  get enabled() {
    return !!process.env.DEEPL_API_KEY;
  }

  /** Textes traduits dans le même ordre ; null si le service n'est pas configuré ou en cas d'échec (jamais bloquant). */
  async toEnglish(texts: string[]): Promise<string[] | null> {
    const key = process.env.DEEPL_API_KEY;
    if (!key || !texts.length) return null;
    const host = key.endsWith(":fx") ? "api-free.deepl.com" : "api.deepl.com";
    try {
      const res = await fetch(`https://${host}/v2/translate`, {
        method: "POST",
        headers: { Authorization: `DeepL-Auth-Key ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ text: texts, source_lang: "FR", target_lang: "EN-GB", preserve_formatting: true }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        this.logger.warn(`Traduction DeepL refusée (${res.status}).`);
        return null;
      }
      const body = (await res.json()) as { translations?: { text: string }[] };
      return body.translations?.length === texts.length ? body.translations.map((t) => t.text) : null;
    } catch (e) {
      this.logger.warn(`Traduction DeepL indisponible : ${(e as Error).message}`);
      return null;
    }
  }
}

@Global()
@Module({ providers: [TranslationService], exports: [TranslationService] })
export class TranslationModule {}
