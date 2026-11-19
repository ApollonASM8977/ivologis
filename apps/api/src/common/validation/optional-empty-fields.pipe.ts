import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { getMetadataStorage } from "class-validator";

/**
 * Un champ facultatif laissé vide arrive en "" depuis les formulaires, et `@IsOptional()` n'ignore que null / undefined :
 * "" échouait à `@IsEmail()`, `@IsDateString()`, `@IsEnum()`… (400 « Le champ … est obligatoire »), ce qui bloquait par
 * exemple une demande de visite sans e-mail ni date. Pour un champ facultatif qui n'est pas du texte libre, "" veut dire
 * « non renseigné » : il est retiré avant la validation. Le texte libre (`@IsString()`) garde "" (= effacer le texte).
 */
@Injectable()
export class OptionalEmptyFieldsPipe implements PipeTransform {
  private readonly cache = new Map<Function, string[]>();

  transform(value: unknown, metadata: ArgumentMetadata) {
    const type = metadata.metatype;
    if (metadata.type !== "body" || !type || !value || typeof value !== "object" || Array.isArray(value)) return value;
    const body = value as Record<string, unknown>;
    for (const field of this.fieldsOf(type)) if (body[field] === "") delete body[field];
    return value;
  }

  private fieldsOf(type: Function) {
    let fields = this.cache.get(type);
    if (!fields) {
      const names = new Map<string, Set<string>>();
      for (const m of getMetadataStorage().getTargetValidationMetadatas(type, "", true, false)) {
        if (!names.has(m.propertyName)) names.set(m.propertyName, new Set());
        if (m.name) names.get(m.propertyName)!.add(m.name);
      }
      fields = [...names].filter(([, n]) => n.has("isOptional") && !n.has("isString")).map(([property]) => property);
      this.cache.set(type, fields);
    }
    return fields;
  }
}
