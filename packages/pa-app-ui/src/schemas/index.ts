import { z } from 'zod'

export const BaseConfigSchema = z.object({
  id: z.string(),
  type: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export const BlockConfigSchema = BaseConfigSchema.extend({
  type: z.string(), // Specific block type like 'text-field', 'button', etc.
  props: z.record(z.string(), z.unknown()).default({}),
})

export const SectionConfigSchema = BaseConfigSchema.extend({
  type: z.literal('section'),
  layout: z.enum(['horizontal', 'vertical', 'grid', 'flex']),
  position: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  blocks: z.array(BlockConfigSchema),
})

export const PageConfigSchema = BaseConfigSchema.extend({
  type: z.literal('page'),
  title: z.string(),
  template: z.string().optional(),
  overrides: z.record(z.string(), z.unknown()).optional(),
  sections: z.array(SectionConfigSchema),
})

export const ModuleConfigSchema = BaseConfigSchema.extend({
  type: z.literal('module'),
  name: z.string(),
  icon: z.string().optional(),
  pages: z.array(PageConfigSchema),
})

export const AppConfigSchema = BaseConfigSchema.extend({
  type: z.literal('app'),
  name: z.string(),
  theme: z.enum(['light', 'dark']).default('dark'),
  version: z.string().optional(),
  modules: z.array(ModuleConfigSchema),
})

// Type exports
export type BaseConfig = z.infer<typeof BaseConfigSchema>
export type BlockConfig = z.infer<typeof BlockConfigSchema>
export type SectionConfig = z.infer<typeof SectionConfigSchema>
export type PageConfig = z.infer<typeof PageConfigSchema>
export type ModuleConfig = z.infer<typeof ModuleConfigSchema>
export type AppConfig = z.infer<typeof AppConfigSchema>
