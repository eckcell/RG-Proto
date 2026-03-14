"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fnbProfileSchema, type FnbProfileInput } from "@/engine/schema";
import styles from "./FnbProfileForm.module.css";

interface Props {
  onComplete: (data: FnbProfileInput) => void;
}

const BUSINESS_TYPES = [
  { id: "office", label: "Office / Service", desc: "Consultancies, Agencies" },
  { id: "retail", label: "Retail", desc: "Shops, Trading" },
  { id: "stall", label: "Stall", desc: "Food court stall, Coffee shop" },
  { id: "takeaway", label: "Takeaway", desc: "Kiosk, Bakery, Cafe (No dine in)" },
  { id: "restaurant", label: "Restaurant", desc: "Dining-in service" },
  { id: "pub", label: "Pubs & Bars", desc: "Bars, Lounges, Late-night" },
  { id: "fnb", label: "Other F&B", desc: "Other Food & Beverage" },
];

export function FnbProfileForm({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const form = useForm<FnbProfileInput>({
    resolver: zodResolver(fnbProfileSchema),
    defaultValues: {
      companyName: "",
      uen: "",
      businessType: undefined,
      additionalEmployees: 0,
      additionalSumInsured: 0,
      additionalPlLimit: 0,
      additionalPaPersons: 0,
      wicaRequired: false,
      wicaEmployees: [],
      contactName: "",
      contactEmail: "",
      contactPhone: "",
    },
    reValidateMode: "onSubmit",
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    trigger,
    clearErrors,
    formState: { errors, touchedFields, isSubmitted },
  } = form;

  // Clear errors for Contact Information when entering Step 4
  useEffect(() => {
    if (step === 4) {
      clearErrors(["contactName", "contactEmail", "contactPhone"]);
    }
  }, [step, clearErrors]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "wicaEmployees",
  });

  const wicaRequired = watch("wicaRequired");

  const nextStep = async () => {
    let fieldsToValidate: Array<keyof FnbProfileInput> = [];
    if (step === 1) fieldsToValidate = ["companyName", "uen"];
    if (step === 2) fieldsToValidate = ["businessType"];
    if (step === 3)
      fieldsToValidate = [
        "additionalEmployees",
        "additionalSumInsured",
        "additionalPlLimit",
        "additionalPaPersons",
        "wicaRequired",
        "wicaEmployees",
      ];
    if (step === 4) fieldsToValidate = ["contactName", "contactEmail", "contactPhone"];

    const isStepValid = await trigger(fieldsToValidate, { shouldFocus: false });
    if (isStepValid && step < totalSteps) {
      setStep((s) => s + 1);
      // Explicitly clear errors for the upcoming step
      if (step === 3) {
        clearErrors(["contactName", "contactEmail", "contactPhone"]);
      }
    }
  };

  const prevStep = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const onSubmit = (data: FnbProfileInput) => {
    onComplete(data);
  };

  return (
    <div className={styles.formContainer}>
      {/* Progress Bar */}
      <div className={styles.progressTracker}>
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`${styles.stepIndicator} ${step >= s ? styles.active : ""}`}
          >
            <div className={styles.stepCircle}>{s}</div>
            <span className={styles.stepLabel}>
              {s === 1 ? "Company" : s === 2 ? "Type" : s === 3 ? "Optional" : "Contact"}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.formContent}>
        {/* Step 1: Company Basics */}
        {step === 1 && (
          <div className={styles.stepPane}>
            <h2>Company Basics</h2>
            <p className={styles.helpText}>
              Enter your registered company details.
            </p>

            <div className={styles.formGroup}>
              <label htmlFor="companyName">Company Name</label>
              <input
                id="companyName"
                {...register("companyName")}
                className={errors.companyName ? styles.inputError : ""}
                placeholder="e.g. RiskGuard Test Pte Ltd"
              />
              {errors.companyName && (
                <span className={styles.errorText}>
                  {errors.companyName.message}
                </span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="uen">Business UEN</label>
              <input
                id="uen"
                {...register("uen")}
                className={errors.uen ? styles.inputError : ""}
                placeholder="e.g. T08LL1234A"
              />
              {errors.uen && (
                <span className={styles.errorText}>{errors.uen.message}</span>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Business Type */}
        {step === 2 && (
          <div className={styles.stepPane}>
            <h2>Business Type</h2>
            <p className={styles.helpText}>
              Select the option that best describes your operations.
            </p>

            <div className={styles.radioGrid}>
              {BUSINESS_TYPES.map((bt) => (
                <label key={bt.id} className={styles.radioCard}>
                  <input
                    type="radio"
                    value={bt.id}
                    {...register("businessType")}
                  />
                  <div className={styles.radioContent}>
                    <strong>{bt.label}</strong>
                    <span>{bt.desc}</span>
                  </div>
                </label>
              ))}
            </div>
            {errors.businessType && (
              <span className={styles.errorText}>
                {errors.businessType.message}
              </span>
            )}
          </div>
        )}

        {/* Step 3: Optional Coverages */}
        {step === 3 && (
          <div className={styles.stepPane}>
            <h2>Optional Coverages</h2>
            <p className={styles.helpText}>
              Packages include base coverage. Add any required top-ups or standalone WICA below.
            </p>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Additional Sum Insured (Fire/All-Risks)</label>
                <div className={styles.inputPrefix}>
                  <span>S$</span>
                  <input
                    type="number"
                    {...register("additionalSumInsured", { valueAsNumber: true })}
                    min="0"
                  />
                </div>
                {errors.additionalSumInsured && (
                  <span className={styles.errorText}>
                    {errors.additionalSumInsured.message}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Additional Public Liability Limit</label>
                <div className={styles.inputPrefix}>
                  <span>S$</span>
                  <input
                    type="number"
                    {...register("additionalPlLimit", { valueAsNumber: true })}
                    min="0"
                  />
                </div>
                {errors.additionalPlLimit && (
                  <span className={styles.errorText}>
                    {errors.additionalPlLimit.message}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Additional Employees (above base 4)</label>
                <input
                  type="number"
                  {...register("additionalEmployees", { valueAsNumber: true })}
                  min="0"
                />
                {errors.additionalEmployees && (
                  <span className={styles.errorText}>
                    {errors.additionalEmployees.message}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Additional Personal Accident Persons</label>
                <input
                  type="number"
                  {...register("additionalPaPersons", { valueAsNumber: true })}
                  min="0"
                />
                {errors.additionalPaPersons && (
                  <span className={styles.errorText}>
                    {errors.additionalPaPersons.message}
                  </span>
                )}
              </div>
            </div>

            <hr style={{ margin: "2.5rem 0", borderTop: "1px solid var(--color-border)", borderBottom: "none", borderLeft: "none", borderRight: "none" }} />

            <h3>Work Injury Compensation (WICA)</h3>
            <p className={styles.helpText}>
              Do you need standalone/add-on WICA for your employees?
              (Note: MSIG packages include WICA for 4 employees).
            </p>

            <label className={styles.toggleWrap}>
              <input type="checkbox" {...register("wicaRequired")} />
              <span>Yes, I want to add WICA cover</span>
            </label>

            {wicaRequired && (
              <div className={styles.wicaSection}>
                <h3>Employee Groups</h3>
                {fields.map((field, index) => (
                  <div key={field.id} className={styles.wicaRow}>
                    <div className={styles.formGroup}>
                      <select
                        {...register(`wicaEmployees.${index}.occupationClass`)}
                      >
                        <option value="non_manual_low">Non-manual (≤S$30k/yr)</option>
                        <option value="non_manual_high">Non-manual (&gt;S$30k-S$75k/yr)</option>
                        <option value="manual_low">Manual (≤S$30k/yr)</option>
                        <option value="manual_high">Manual (&gt;S$30k-S$75k/yr)</option>
                        <option value="driver_delivery">Driver/Delivery</option>
                        <option value="admin_management">Admin/Management</option>
                        <option value="sales_purchasing">Sales/Purchasing</option>
                        <option value="kitchen_service_cashier">Kitchen/Cashier</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <input
                        type="number"
                        placeholder="Annual wage (S$)"
                        {...register(`wicaEmployees.${index}.annualWage`, {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <input
                        type="number"
                        placeholder="Headcount"
                        {...register(`wicaEmployees.${index}.headcount`, {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                    <button
                      type="button"
                      className={styles.btnDanger}
                      onClick={() => remove(index)}
                    >
                      X
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() =>
                    append({
                      occupationClass: "non_manual_low",
                      annualWage: 30000,
                      headcount: 1,
                    })
                  }
                >
                  + Add Employee Group
                </button>
              </div>
            )}
            {errors.wicaEmployees && (
              <span className={styles.errorText}>
                Please check employee details.
              </span>
            )}
          </div>
        )}

        {step === 4 && (
          <div className={styles.stepPane}>
            <h2>Contact Information</h2>
            <p className={styles.helpText}>
              Where should we send your indicative quotations?
            </p>

            <div className={styles.formGroup}>
              <label htmlFor="contactName">Full Name</label>
              <input
                id="contactName"
                {...register("contactName")}
                className={
                  (touchedFields.contactName || isSubmitted) &&
                  errors.contactName
                    ? styles.inputError
                    : ""
                }
                placeholder="e.g. John Doe"
              />
              {(touchedFields.contactName || isSubmitted) &&
                errors.contactName && (
                  <span className={styles.errorText}>
                    {errors.contactName.message}
                  </span>
                )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="contactEmail">Work Email Address</label>
              <input
                id="contactEmail"
                type="email"
                {...register("contactEmail")}
                className={
                  (touchedFields.contactEmail || isSubmitted) &&
                  errors.contactEmail
                    ? styles.inputError
                    : ""
                }
                placeholder="e.g. john@example.com"
              />
              {(touchedFields.contactEmail || isSubmitted) &&
                errors.contactEmail && (
                  <span className={styles.errorText}>
                    {errors.contactEmail.message}
                  </span>
                )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="contactPhone">Mobile Number (Singapore)</label>
              <div className={styles.inputPrefix}>
                <span>+65</span>
                <input
                  id="contactPhone"
                  type="text"
                  maxLength={8}
                  {...register("contactPhone")}
                  className={
                    (touchedFields.contactPhone || isSubmitted) &&
                    errors.contactPhone
                      ? styles.inputError
                      : ""
                  }
                  placeholder="e.g. 91234567"
                />
              </div>
              {(touchedFields.contactPhone || isSubmitted) &&
                errors.contactPhone && (
                  <span className={styles.errorText}>
                    {errors.contactPhone.message}
                  </span>
                )}
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className={styles.formActions}>
          {step > 1 ? (
            <button type="button" onClick={prevStep} className={styles.btnPrev}>
              Back
            </button>
          ) : (
            <div></div>
          )}

          {step < totalSteps ? (
            <button type="button" onClick={nextStep} className={styles.btnNext}>
              Next Step
            </button>
          ) : (
            <button type="submit" className={styles.btnSubmit}>
              Get Quotes
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
