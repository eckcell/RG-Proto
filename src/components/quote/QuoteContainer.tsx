"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { DynamicProfileForm } from "@/components/forms/DynamicProfileForm";
import styles from "./QuoteContainer.module.css";

export function QuoteContainer() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplate() {
      try {
        const res = await fetch("/api/templates/fnb");
        if (!res.ok) throw new Error("Template not found");
        const data = await res.json();
        setTemplate({
            ...data,
            config: JSON.parse(data.config)
        });
      } catch (err) {
        console.error("Failed to fetch template:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplate();
  }, []);

  const handleFormComplete = async (data: any) => {
    setIsSubmitting(true);
    try {
      // 1. Post to lead capture API
      // Note: The API now needs to handle dynamic 'profileData'
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...data,
            industrySlug: "fnb" // Hardcoded for now
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error (${response.status})`);
      }

      // 2. Build query parameters string
      const params = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
              params.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
          }
      });

      // Capture leadId if it was returned
      const resJson = await response.json();
      if (resJson.leadId) {
        params.append("leadId", resJson.leadId);
      }

      // 3. Redirect to the standalone comparison route
      router.push(`/quote/compare?${params.toString()}`);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading form...</div>;
  if (!template) return <div className={styles.error}>Failed to load industry template.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.formView}>
        <div className={styles.intro}>
          <h1>Get Your {template.industry.name} Insurance Quotes</h1>
          <p>
            Fill out your business profile to compare package premiums
            across multiple leading insurers in Singapore.
          </p>
        </div>
        <DynamicProfileForm 
          config={template.config} 
          onComplete={handleFormComplete} 
          isSubmitting={isSubmitting} 
        />
      </div>
    </div>
  );
}
