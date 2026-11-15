import activeWedding from '../wedding.config.ts'

export {
  BUILTIN_LOCALES,
  registerLocale,
  resolveTranslations,
  type DeepPartial,
  type SupportedLocale,
  type Translations,
} from './i18n/locales.ts'
export { defineWedding, type Wedding, type WeddingInput } from './weddingSchema.ts'
export const wedding = activeWedding
