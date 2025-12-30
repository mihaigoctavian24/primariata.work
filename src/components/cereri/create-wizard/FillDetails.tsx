"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TipCerere } from "@/types/api";
import { DynamicFormField } from "@/types/wizard";
import { Save, Trash2 } from "lucide-react";

interface FillDetailsProps {
  tipCerere: TipCerere;
  initialData?: Record<string, unknown>;
  initialObservatii?: string;
  onSave: (data: Record<string, unknown>, observatii: string) => Promise<void>;
  onNext: (data: Record<string, unknown>, observatii: string) => void;
  onBack: () => void;
  onAbandon?: () => void;
  isSaving?: boolean;
  cerereId?: string;
}

function buildDynamicSchema(fields: DynamicFormField[]) {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case "text":
        fieldSchema = z.string();
        if (field.validation?.min) {
          fieldSchema = (fieldSchema as z.ZodString).min(
            field.validation.min,
            field.validation.message || `Minim ${field.validation.min} caractere`
          );
        }
        if (field.validation?.max) {
          fieldSchema = (fieldSchema as z.ZodString).max(
            field.validation.max,
            field.validation.message || `Maxim ${field.validation.max} caractere`
          );
        }
        if (field.validation?.pattern) {
          fieldSchema = (fieldSchema as z.ZodString).regex(
            new RegExp(field.validation.pattern),
            field.validation.message || "Format invalid"
          );
        }
        break;

      case "number":
        fieldSchema = z.coerce.number();
        if (field.validation?.min !== undefined) {
          fieldSchema = (fieldSchema as z.ZodNumber).min(
            field.validation.min,
            field.validation.message || `Minim ${field.validation.min}`
          );
        }
        if (field.validation?.max !== undefined) {
          fieldSchema = (fieldSchema as z.ZodNumber).max(
            field.validation.max,
            field.validation.message || `Maxim ${field.validation.max}`
          );
        }
        break;

      case "date":
        fieldSchema = z.string().refine((val) => !isNaN(Date.parse(val)), {
          message: "Dată invalidă",
        });
        break;

      case "checkbox":
        fieldSchema = z.boolean();
        break;

      default:
        fieldSchema = z.string();
    }

    // Enforce non-empty values for required fields
    if (field.required) {
      if (field.type === "text" || field.type === "textarea") {
        // For text fields, ensure at least 1 character if no min validation exists
        if (!field.validation?.min) {
          fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label} este obligatoriu`);
        }
      } else if (field.type === "select" || field.type === "radio") {
        // For select/radio, ensure a value is selected
        fieldSchema = (fieldSchema as z.ZodString).min(1, `Selectați ${field.label}`);
      } else if (field.type === "date") {
        // Date fields are already validated by the refine function
        fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label} este obligatoriu`);
      }
      // Number and checkbox fields don't need additional required checks
    } else {
      fieldSchema = fieldSchema.optional();
    }

    schemaFields[field.name] = fieldSchema;
  });

  // Add observatii field
  schemaFields.observatii = z.string().max(1000, "Maxim 1000 caractere").optional();

  return z.object(schemaFields);
}

export function FillDetails({
  tipCerere,
  initialData = {},
  initialObservatii = "",
  onSave,
  onNext,
  onBack,
  onAbandon,
  isSaving = false,
  cerereId,
}: FillDetailsProps) {
  // Parse dynamic fields from tip_cerere.campuri_formular
  const campuriData = tipCerere.campuri_formular as
    | { fields?: Array<Record<string, unknown>> }
    | unknown;
  const rawFields = (campuriData as { fields?: Array<Record<string, unknown>> })?.fields || [];

  // Map 'id' to 'name' for form compatibility
  const dynamicFields: DynamicFormField[] = rawFields.map((field) => ({
    ...field,
    name: (field.id as string) || (field.name as string),
  })) as DynamicFormField[];

  const formSchema = buildDynamicSchema(dynamicFields);

  // Build default values for all fields to avoid controlled/uncontrolled input errors
  const buildDefaultValues = () => {
    const defaults: Record<string, unknown> = {};

    dynamicFields.forEach((field) => {
      // Use initialData value if exists, otherwise use appropriate default for field type
      if (field.name in initialData) {
        defaults[field.name] = initialData[field.name];
      } else {
        // Set defaults based on field type to ensure controlled inputs
        switch (field.type) {
          case "checkbox":
            defaults[field.name] = false;
            break;
          case "number":
            defaults[field.name] = "";
            break;
          default:
            defaults[field.name] = "";
        }
      }
    });

    defaults.observatii = initialObservatii;
    return defaults;
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: buildDefaultValues(),
  });

  // Auto-save on form changes (debounced)
  useEffect(() => {
    const subscription = form.watch((values) => {
      const timeoutId = setTimeout(() => {
        const { observatii, ...formData } = values;
        onSave(formData as Record<string, unknown>, (observatii as string) || "");
      }, 2000);

      return () => clearTimeout(timeoutId);
    });

    return () => subscription.unsubscribe();
  }, [form, onSave]);

  function handleSubmit(values: z.infer<typeof formSchema>) {
    const { observatii, ...formData } = values;
    onNext(formData as Record<string, unknown>, (observatii as string) || "");
  }

  async function handleSaveDraft() {
    const values = form.getValues();
    const { observatii, ...formData } = values;
    await onSave(formData as Record<string, unknown>, (observatii as string) || "");
  }

  function renderField(field: DynamicFormField) {
    return (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            <FormControl>
              {field.type === "textarea" ? (
                <Textarea
                  placeholder={field.placeholder}
                  className="resize-none"
                  rows={4}
                  {...formField}
                  value={formField.value as string}
                />
              ) : field.type === "select" ? (
                <Select onValueChange={formField.onChange} value={formField.value as string}>
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder || "Selectează..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === "checkbox" ? (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formField.value as boolean}
                    onCheckedChange={formField.onChange}
                  />
                  <label className="text-sm">{field.placeholder}</label>
                </div>
              ) : field.type === "radio" ? (
                <RadioGroup onValueChange={formField.onChange} value={formField.value as string}>
                  {field.options?.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`${field.name}-${option}`} />
                      <label htmlFor={`${field.name}-${option}`} className="text-sm">
                        {option}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <Input
                  type={
                    field.type === "number" ? "number" : field.type === "date" ? "date" : "text"
                  }
                  placeholder={field.placeholder}
                  {...formField}
                  value={formField.value as string | number}
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Completează detaliile cererii</h2>
        <p className="text-muted-foreground">
          Completează informațiile necesare pentru cererea de tip: <strong>{tipCerere.nume}</strong>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Dynamic fields */}
          {dynamicFields.length > 0 ? (
            <div className="space-y-4">{dynamicFields.map(renderField)}</div>
          ) : (
            <p className="text-muted-foreground text-sm">
              Nu există câmpuri specifice pentru acest tip de cerere.
            </p>
          )}

          {/* Observații field */}
          <FormField
            control={form.control}
            name="observatii"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observații suplimentare (opțional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Adaugă orice informație suplimentară relevantă pentru cererea ta..."
                    className="resize-none"
                    rows={4}
                    {...field}
                    value={field.value as string}
                  />
                </FormControl>
                <FormDescription>Maxim 1000 caractere</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Actions */}
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={onBack}>
                Înapoi
              </Button>

              {/* Abandonează button - only show if draft exists */}
              {cerereId && onAbandon && (
                <Button type="button" variant="destructive" onClick={onAbandon}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Abandonează
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Salvează draft button - only show if no draft yet */}
              {!cerereId && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Se salvează..." : "Salvează draft"}
                </Button>
              )}

              <Button type="submit">Continuă</Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
