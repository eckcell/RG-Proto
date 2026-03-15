import LeadDetails from "./LeadDetails";

export const metadata = {
  title: "Lead Details | RiskGuard Admin",
};

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LeadDetails id={id} />;
}
