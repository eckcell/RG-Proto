import ProductUpload from "./ProductUpload";

export const metadata = {
  title: "Update Rates | RiskGuard Admin",
};

export default function AdminUploadPage() {
  return (
    <div>
      <div style={{ marginBottom: "var(--space-8)" }}>
        <h1>Update Product Rates</h1>
        <p>Safely upload and validate new insurance rate configurations.</p>
      </div>

      <ProductUpload />
    </div>
  );
}
