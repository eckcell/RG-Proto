"use client";

import { useRouter } from "next/navigation";
import { FnbProfileForm } from "@/components/forms/FnbProfileForm";
import type { FnbProfileInput } from "@/engine/schema";
import styles from "./QuoteContainer.module.css";

export function QuoteContainer() {
  const router = useRouter();

  const handleFormComplete = async (data: FnbProfileInput) => {
    try {
      // 1. Post to lead capture API
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Unable to process your request");
      }

      // 2. Build query parameters string
      const params = new URLSearchParams({
        companyName: data.companyName,
        uen: data.uen,
        businessType: data.businessType,
        additionalEmployees: data.additionalEmployees.toString(),
        additionalSumInsured: data.additionalSumInsured.toString(),
        additionalPlLimit: data.additionalPlLimit.toString(),
        additionalPaPersons: data.additionalPaPersons.toString(),
        wicaRequired: data.wicaRequired.toString(),
      });

      // Optionally serialize wicaEmployees if present
      if (data.wicaEmployees && data.wicaEmployees.length > 0) {
        params.append("wicaEmployees", JSON.stringify(data.wicaEmployees));
      }

      // 3. Redirect to the standalone comparison route
      router.push(`/quote/compare?${params.toString()}`);
    } catch (error: any) {
      console.error("Submission error:", error);
      
      let errorMessage = "Something went wrong while capturing your details. Please try again.";
      
      if (error instanceof Response) {
        try {
          const detail = await error.json();
          if (detail.message) errorMessage = `Submission failed: ${detail.message}`;
          if (detail.details) console.error("Validation details:", detail.details);
        } catch (e) {
          // Fallback to default
        }
      } else if (error.message && error.message.includes("Unable to process")) {
        // This comes from our manual throw
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formView}>
        <div className={styles.intro}>
          <h1>Get Your Business Insurance Quotes</h1>
          <p>
            Fill out your business profile to compare F&B package premiums
            across multiple leading insurers in Singapore.
          </p>
        </div>
        <FnbProfileForm onComplete={handleFormComplete} />
      </div>
    </div>
  );
}

