"use client";

import { useRouter } from "next/navigation";
import { FnbProfileForm } from "@/components/forms/FnbProfileForm";
import type { FnbProfileInput } from "@/engine/schema";
import styles from "./QuoteContainer.module.css";

export function QuoteContainer() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormComplete = async (data: FnbProfileInput) => {
    setIsSubmitting(true);
    try {
      // 1. Post to lead capture API
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error (${response.status})`);
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
      
      let displayMessage = "Something went wrong while capturing your details. Please try again.";
      
      if (error.message && error.message !== "Unable to process your request") {
        displayMessage = `Submission failed: ${error.message}`;
      }
      
      alert(displayMessage);
    } finally {
      setIsSubmitting(false);
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
        <FnbProfileForm onComplete={handleFormComplete} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}

