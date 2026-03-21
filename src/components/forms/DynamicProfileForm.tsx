"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import styles from "./FnbProfileForm.module.css";
import { Plus, Trash2 } from "lucide-react";

interface FormField {
  id: string;
  label: string;
  type: "text" | "number" | "radio" | "email" | "tel" | "checkbox" | "fieldArray";
  required?: boolean;
  placeholder?: string;
  pattern?: string;
  min?: number;
  max?: number;
  prefix?: string;
  options?: { value: string; label: string; desc?: string }[];
  defaultValue?: any;
  dependsOn?: { field: string; value: any };
  arrayFields?: FormField[]; // Only used for fieldArray type
}

interface FormStep {
  id: string;
  title: string;
  fields: FormField[];
}

interface FormConfig {
  steps: FormStep[];
}

interface Props {
  config: FormConfig;
  onComplete: (data: any) => void;
  isSubmitting?: boolean;
}

function FieldArrayComponent({ field, control, register, errors }: any) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: field.id
    });

    return (
        <div className={styles.fieldArrayContainer}>
            <div className={styles.fieldArrayHeader}>
                <label>{field.label}</label>
                <button
                    type="button"
                    onClick={() => append({})}
                    className={styles.btnAddSmall}
                >
                    <Plus size={16} /> Add {field.label.split(' ').pop()}
                </button>
            </div>

            {fields.map((item, index) => (
                <div key={item.id} className={styles.fieldArrayRow}>
                    <div className={styles.fieldArrayGrid}>
                        {field.arrayFields?.map((subField: any) => (
                            <div key={subField.id} className={styles.formGroup}>
                                <label>{subField.label}</label>
                                <input
                                    type={subField.type}
                                    {...register(`${field.id}.${index}.${subField.id}`, {
                                        required: subField.required,
                                        valueAsNumber: subField.type === 'number'
                                    })}
                                    className={(errors[field.id]?.[index]?.[subField.id]) ? styles.inputError : ""}
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={() => remove(index)}
                        className={styles.btnRemove}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ))}
            
            {fields.length === 0 && (
                <p className={styles.emptyArray}>No {field.label} added yet.</p>
            )}
        </div>
    );
}

export function DynamicProfileForm({ config, onComplete, isSubmitting = false }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = config.steps[stepIndex];
  const totalSteps = config.steps.length;

  const {
    register,
    handleSubmit,
    trigger,
    control,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: config.steps.reduce((acc, s) => {
      s.fields.forEach(f => {
        if (f.type === 'fieldArray') {
            acc[f.id] = f.defaultValue ?? [];
        } else {
            acc[f.id] = f.defaultValue ?? (f.type === 'number' ? 0 : "");
        }
      });
      return acc;
    }, {} as any)
  });

  const formValues = watch();

  const nextStep = async () => {
    const fieldsToValidate = currentStep.fields.map(f => f.id);
    const isStepValid = await trigger(fieldsToValidate as any);
    if (isStepValid && stepIndex < totalSteps - 1) {
      setStepIndex(stepIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  const onSubmit = (data: any) => {
    onComplete(data);
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.progressTracker}>
        {config.steps.map((s, idx) => (
          <div
            key={s.id}
            className={`${styles.stepIndicator} ${stepIndex >= idx ? styles.active : ""}`}
          >
            <div className={styles.stepCircle}>{idx + 1}</div>
            <span className={styles.stepLabel}>{s.title}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.formContent}>
        <div className={styles.stepPane}>
          <h2>{currentStep.title}</h2>
          
          <div className={styles.formGrid}>
            {currentStep.fields.map((field) => {
              // Check dependencies
              if (field.dependsOn) {
                const depValue = formValues[field.dependsOn.field];
                if (depValue !== field.dependsOn.value) return null;
              }

              if (field.type === "fieldArray") {
                return (
                  <div key={field.id} className={styles.fullWidth}>
                    <FieldArrayComponent 
                        field={field} 
                        control={control} 
                        register={register} 
                        errors={errors} 
                    />
                  </div>
                );
              }

              return (
                <div key={field.id} className={`${styles.formGroup} ${field.type === 'radio' ? styles.fullWidth : ""}`}>
                  <label htmlFor={field.id}>{field.label}</label>
                  
                  {field.type === "radio" ? (
                    <div className={styles.radioGrid}>
                      {field.options?.map((opt) => (
                        <label key={opt.value} className={styles.radioCard}>
                          <input
                            type="radio"
                            value={opt.value}
                            {...register(field.id, { required: field.required })}
                          />
                          <div className={styles.radioContent}>
                            <strong>{opt.label}</strong>
                            {opt.desc && <span>{opt.desc}</span>}
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : field.type === "checkbox" ? (
                      <label className={styles.toggleWrap}>
                          <input type="checkbox" {...register(field.id)} />
                          <span>{field.label}</span>
                      </label>
                  ) : (
                    <div className={field.prefix ? styles.inputPrefix : ""}>
                      {field.prefix && <span>{field.prefix}</span>}
                      <input
                        id={field.id}
                        type={field.type}
                        placeholder={field.placeholder}
                        {...register(field.id, {
                          required: field.required ? `${field.label} is required` : false,
                          pattern: field.pattern ? { value: new RegExp(field.pattern || ""), message: "Invalid format" } : undefined,
                          valueAsNumber: field.type === "number",
                          min: field.min,
                          max: field.max
                        } as any)}
                        className={errors[field.id] ? styles.inputError : ""}
                      />
                    </div>
                  )}
                  
                  {errors[field.id] && (
                    <span className={styles.errorText}>
                      {(errors[field.id] as any)?.message}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.formActions}>
          {stepIndex > 0 ? (
            <button type="button" onClick={prevStep} className={styles.btnPrev} disabled={isSubmitting}>
              Back
            </button>
          ) : (
            <div></div>
          )}

          {stepIndex < totalSteps - 1 ? (
            <button type="button" onClick={nextStep} className={styles.btnNext} disabled={isSubmitting}>
              Next Step
            </button>
          ) : (
            <button 
              type="submit" 
              className={styles.btnSubmit} 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Generating Quotes..." : "Get Quotes"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
