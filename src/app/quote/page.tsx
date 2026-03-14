import { QuoteContainer } from "@/components/quote/QuoteContainer";

export const metadata = {
  title: "Get Insurance Quotes — RiskGuard Compare",
  description:
    "Enter your business details to get instant indicative insurance quotations.",
};

export default function QuotePage() {
  return (
    <div className="container" style={{ padding: "3rem 1rem" }}>
      <QuoteContainer />
    </div>
  );
}
