import { prisma } from "./prisma";

/**
 * Maintenance task to archive leads inactive for > 90 days.
 * Returns the number of leads archived.
 */
export async function autoArchiveLeads(): Promise<number> {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const result = await prisma.lead.updateMany({
    where: {
      status: { notIn: ["CLOSED", "ARCHIVED"] },
      updatedAt: { lt: ninetyDaysAgo },
    },
    data: {
      status: "ARCHIVED",
    },
  });

  return result.count;
}
