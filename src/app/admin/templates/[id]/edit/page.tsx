import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { TemplateEditor } from "./TemplateEditor";
import styles from "../../../products/products.module.css";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTemplatePage({ params }: Props) {
  const { id } = await params;

  const template = await prisma.formTemplate.findUnique({
    where: { id },
    include: { industry: true },
  });

  if (!template) {
    notFound();
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <div className={styles.breadcrumb}>
            <Link href="/admin/templates">Templates</Link> / {template.name}
          </div>
          <h1>Edit Form Structure</h1>
          <p className={styles.subtitle}>
            Industry: <strong>{template.industry.name}</strong>
          </p>
        </div>
      </header>

      <section className={styles.section}>
        <TemplateEditor template={JSON.parse(JSON.stringify(template))} />
      </section>
    </div>
  );
}
