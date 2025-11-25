"use client"

import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

export interface FormFieldSchema {
  name: string
  type: "text" | "email" | "checkbox" | "password" | "number"
  label: string
  placeholder?: string
  required?: boolean
  defaultValue?: any
  disabled?: boolean
  validation?: {
    pattern?: string
    minLength?: number
    maxLength?: number
    custom?: (value: any) => boolean | string
  }
}

export interface FormSchema {
  fields: FormFieldSchema[]
  submitButton?: {
    label: string
    disabledUntil?: string // field name that must be true
  }
  onSubmit?: (data: any) => void
  className?: string
  style?: {
    container?: string
    input?: string
    label?: string
    button?: string
    error?: string
  }
}

interface SchemaDrivenFormProps {
  schema: FormSchema
  layers?: {
    structure: boolean
    schema: boolean
    state: boolean
    signal: boolean
    style: boolean
  }
  hideAnnotations?: boolean
  runMode?: {
    enabled: boolean
    selectedLayer: string
    onHotspotClick?: (fieldName: string) => void
    hotspots?: string[]
    disabledFields?: string[]
    accessControl?: {
      canView: boolean
      canEdit: boolean
    }
  }
}

export function SchemaDrivenForm({ schema, layers, hideAnnotations = false, runMode }: SchemaDrivenFormProps) {
  const defaultValues = schema.fields.reduce((acc, field) => {
    acc[field.name] = field.defaultValue ?? (field.type === "checkbox" ? false : "")
    return acc
  }, {} as Record<string, any>)

  const form = useForm({
    defaultValues,
    mode: "onChange",
  })

  const { watch } = form
  const formValues = watch()

  const handleSubmit = form.handleSubmit((data) => {
    schema.onSubmit?.(data)
    console.log("Form submitted:", data)
  })

  // Determine if submit should be disabled based on schema
  const isSubmitDisabled = schema.submitButton?.disabledUntil
    ? !formValues[schema.submitButton.disabledUntil]
    : false

  // In run mode, check access control for edit permission and feature flag logic
  const finalSubmitDisabled = runMode?.enabled 
    ? (runMode.accessControl && !runMode.accessControl.canEdit) || false
    : isSubmitDisabled

  const showLabels = !layers || layers.structure
  const useSchemaLabels = !layers || layers.schema
  const applyStateLogic = !layers || layers.state
  const showSignals = !hideAnnotations && layers?.signal
  const applyStyle = !layers || layers.style

  // If canView is false in run mode, hide the entire form
  if (runMode?.enabled && runMode.accessControl && !runMode.accessControl.canView) {
    return (
      <div className="border-2 border-red-500/50 bg-slate-900/80 rounded-2xl p-8 text-center">
        <div className="text-red-400 font-mono text-sm mb-2">Access Denied</div>
        <div className="text-slate-400 text-xs">You do not have permission to view this form</div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className={schema.className}>
        <div
          className={
            schema.style?.container ||
            `border-2 p-6 transition-all duration-500 ${
              applyStyle
                ? "bg-slate-800/50 border-blue-500 rounded-2xl"
                : "bg-slate-900/50 border-slate-700"
            }`
          }
        >
          {schema.fields.map((fieldSchema) => {
            const isCheckbox = fieldSchema.type === "checkbox"
            const isHotspot = runMode?.enabled && runMode.hotspots?.includes(fieldSchema.name)
            const isDisabledByFeatureFlag = runMode?.enabled && runMode.disabledFields?.includes(fieldSchema.name)
            const isReadonlyByAccessControl = runMode?.enabled && runMode.accessControl && !runMode.accessControl.canEdit
            
            return (
              <FormField
                key={fieldSchema.name}
                control={form.control}
                name={fieldSchema.name}
                rules={{
                  required: fieldSchema.required
                    ? `${fieldSchema.label} is required`
                    : false,
                  ...(fieldSchema.validation?.pattern && {
                    pattern: {
                      value: new RegExp(fieldSchema.validation.pattern),
                      message: `Invalid ${fieldSchema.label.toLowerCase()}`,
                    },
                  }),
                  ...(fieldSchema.validation?.minLength && {
                    minLength: {
                      value: fieldSchema.validation.minLength,
                      message: `Minimum length is ${fieldSchema.validation.minLength}`,
                    },
                  }),
                  ...(fieldSchema.validation?.maxLength && {
                    maxLength: {
                      value: fieldSchema.validation.maxLength,
                      message: `Maximum length is ${fieldSchema.validation.maxLength}`,
                    },
                  }),
                  ...(fieldSchema.validation?.custom && {
                    validate: fieldSchema.validation.custom,
                  }),
                }}
                render={({ field, fieldState }) => (
                  <FormItem 
                    className={`${isCheckbox ? "mb-6" : "mb-6"} ${isHotspot ? "relative cursor-pointer group" : ""} ${isDisabledByFeatureFlag ? "opacity-50" : ""} ${isReadonlyByAccessControl ? "opacity-60" : ""}`}
                    onClick={() => isHotspot && !isDisabledByFeatureFlag && runMode?.onHotspotClick?.(fieldSchema.name)}
                  >
                    {isCheckbox ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 relative">
                          {isHotspot && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse group-hover:scale-125 transition-transform z-10" />
                          )}
                          <FormControl>
                            <Checkbox
                              id={fieldSchema.name}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={applyStateLogic && (fieldSchema.disabled || isDisabledByFeatureFlag || isReadonlyByAccessControl)}
                              className={
                                schema.style?.input ||
                                `w-4 h-4 border transition-all cursor-pointer ${
                                  applyStyle
                                    ? "border-blue-500 bg-slate-800 accent-blue-500"
                                    : "border-slate-700 bg-slate-900 accent-slate-500"
                                }`
                              }
                            />
                          </FormControl>
                          {showLabels && (
                            <FormLabel
                              htmlFor={fieldSchema.name}
                              className={
                                schema.style?.label ||
                                `text-sm font-medium transition-all duration-500 cursor-pointer animate-in fade-in slide-in-from-top-2 ${
                                  applyStyle ? "text-blue-300" : "text-slate-400"
                                }`
                              }
                            >
                              <span className="transition-all duration-500">
                                {useSchemaLabels ? (
                                  fieldSchema.labelLink ? (
                                    <>
                                      I agree to the{" "}
                                      <a 
                                        href={fieldSchema.labelLink.href} 
                                        className="text-blue-400 underline decoration-blue-400 hover:text-blue-300 hover:decoration-blue-300"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {fieldSchema.labelLink.text}
                                      </a>
                                    </>
                                  ) : (
                                    fieldSchema.label
                                  )
                                ) : (
                                  `Checkbox field`
                                )}
                              </span>
                            </FormLabel>
                          )}
                        </div>

                        {/* State Layer - Show field condition */}
                        {applyStateLogic && showSignals && schema.submitButton?.disabledUntil === fieldSchema.name && (
                          <div className="ml-7 text-xs font-mono text-white bg-transparent px-2 py-1 rounded border border-white transition-all duration-500 animate-in fade-in slide-in-from-top-2">
                            State: Submit button stays disabled until user checks this box
                          </div>
                        )}

                        {/* Signal Layer - Show event flow */}
                        {showSignals && schema.submitButton?.disabledUntil === fieldSchema.name && (
                          <div className="ml-7 text-xs font-mono text-white bg-transparent px-2 py-1 rounded border border-white transition-all duration-500 animate-in fade-in slide-in-from-top-2">
                            Signal: Checkbox publishes "terms-agreed" event → Submit button receives event and enables
                          </div>
                        )}

                        {applyStateLogic && fieldState.error && (
                          <FormMessage
                            className={
                              schema.style?.error || "text-sm text-red-500"
                            }
                          />
                        )}
                      </div>
                    ) : (
                      <>
                        {showLabels && (
                          <FormLabel
                            className={
                              schema.style?.label ||
                              `block text-sm font-medium transition-all duration-500 animate-in fade-in slide-in-from-top-2 ${
                                applyStyle ? "text-blue-300" : "text-slate-400"
                              }`
                            }
                          >
                            <span className="transition-all duration-500">
                              {useSchemaLabels
                                ? fieldSchema.label
                                : `Field ${schema.fields.indexOf(fieldSchema) + 1}`}
                            </span>
                          </FormLabel>
                        )}
                        <FormControl>
                          <div className="relative">
                            {isHotspot && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse group-hover:scale-125 transition-transform z-10" />
                            )}
                            <Input
                              type={fieldSchema.type}
                              placeholder={
                                useSchemaLabels ? fieldSchema.placeholder : ""
                              }
                              disabled={applyStateLogic && (fieldSchema.disabled || isDisabledByFeatureFlag)}
                              readOnly={isReadonlyByAccessControl}
                              className={
                                schema.style?.input ||
                                `w-full px-4 py-2 rounded border transition-all ${isHotspot ? "ring-2 ring-blue-500/30 hover:ring-blue-500/50 " : ""}${
                                applyStyle
                                  ? `bg-slate-800 text-slate-100 border-blue-500 focus:border-blue-500 focus:outline-blue-500 rounded-lg ${
                                      fieldState.error
                                        ? "border-red-500 outline-red-500"
                                        : ""
                                    } ${
                                      fieldSchema.disabled || isReadonlyByAccessControl ? "opacity-50" : ""
                                    }`
                                  : `bg-slate-900 text-slate-300 border-slate-700 rounded ${
                                      fieldState.error
                                        ? "border-red-500 outline-red-500"
                                        : ""
                                    } ${
                                      fieldSchema.disabled || isReadonlyByAccessControl ? "opacity-50" : ""
                                    }`
                              } ${isReadonlyByAccessControl ? "cursor-not-allowed" : ""} disabled:cursor-not-allowed`
                            }
                              {...field}
                            />
                          </div>
                        </FormControl>
                        {applyStateLogic && fieldState.error && (
                          <FormMessage
                            className={
                              schema.style?.error || "text-sm text-red-500"
                            }
                          />
                        )}
                      </>
                    )}
                  </FormItem>
                )}
              />
            )
          })}

          {/* Submit Button */}
          {schema.submitButton && (
            <Button
              type="submit"
              disabled={finalSubmitDisabled}
              className={
                schema.style?.button ||
                `w-full py-3 font-semibold transition-all ${
                  applyStyle
                    ? `${
                        finalSubmitDisabled
                          ? "bg-slate-700 text-slate-500 cursor-not-allowed rounded-lg"
                          : "bg-blue-500 text-white hover:bg-blue-600 active:scale-95 rounded-lg"
                      }`
                    : `${
                        finalSubmitDisabled
                          ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                          : "bg-slate-700 text-slate-100 hover:bg-slate-600 active:scale-95"
                      }`
                }`
              }
            >
              <span className="transition-all duration-500">
                {useSchemaLabels ? schema.submitButton.label : "Button"}
              </span>
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
