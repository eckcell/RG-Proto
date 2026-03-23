# Product Requirements Document: RiskGuard Compare

*Last updated: 23 March 2026 Author: Darren Lim*

## 1\. Product Plan

**RiskGuard Compare** is a specialized B2B and B2B2C application designed to facilitate the complex process of comparing and generating business insurance quotes. The platform aims to connect insurance brokers with clients by providing dynamic quotation forms tailored to specific industries (e.g., Food & Beverage, Retail), evaluating risk configurations, and presenting clear premium comparisons. The end goal is to simplify lead capture, quote generation, and policy conversion through a streamlined digital experience.

## 2\. Product Roadmap

### Phase 1: Core Foundation & Data Modeling (Completed)

- Establish the technical foundations (Next.js, Prisma, PostgreSQL).  
- Design and implement the database schema covering Users, Insurers, Industries, FormTemplates, Products, and Leads.  
- Setup authentication (Next-Auth) for broker access.  
- Deploy MVP infrastructure on Vercel.

### Phase 2: Administrative Control & Quote Engine (Current/In-progress)

- Build the Admin Dashboard for managing core entities (Insurers, Products, Templates).  
- Implement dynamic JSON-based configuration for form templates and product rating tiers.  
- Enhance Admin UX with dynamic breadcrumbs and real-time lead statistics.  
- Develop the core Quote Engine to process dynamic form inputs and calculate premiums.  
- Implement polished PDF quote generation with branding and disclaimers.

### Phase 3: Client Experience & Automation (Future Plans)

- Finalize the public-facing client flow for end-users to organically request quotes.  
- Implement automated email delivery of generated quotes using Resend.  
- Introduce advanced analytics and conversion reporting in the Admin Dashboard.  
- Expand user roles (e.g., Sub-agents, Underwriters).  
- Integrate API connections directly with insurers for automated policy binding.

## 3\. Technical Details

### Technology Stack

- **Framework:** Next.js 15 (React 19 RC, App Router)  
- **Language:** TypeScript  
- **Database ORM:** Prisma  
- **Database Engine:** PostgreSQL (Serverless / Direct connection pooling)  
- **Authentication:** Next-Auth (v4) with `bcryptjs` for local credential hashing.  
- **Form & Validation:** React Hook Form \+ Zod  
- **Storage:** Vercel Blob (for handling insurer logos and product brochures)  
- **Document Generation:** `jspdf` and `html2canvas` for PDF exports  
- **Image Processing:** `sharp` for asset optimization  
- **Email Service:** Resend API  
- **Testing:** Vitest  
- **Linting & Formatting:** ESLint \+ Prettier

### Key Architectural Decisions

- **Dynamic Schemas:** Both `FormTemplate.config` and `Product.configuration` rely on flexible JSON blobs. This allows the platform to adapt to new business types (e.g., shifting from "Retail" forms to "Construction" forms) and complex rating structures without requiring database migrations.  
- **Role-Based Access:** Primarily scoped to "BROKER" currently, allowing centralized control over the lead funnel.  
- **Client-Side Document Rendering:** HTML to PDF generation happens within the browser using canvas to ease server load and ensure visual fidelity of final quotes.

## 4\. Features

### Completed

- **Project Structure & CI/CD:** Next.js setup, Vitest configurations, and Vercel deployment pipelines.  
- **Database Schema & Migrations:** Complete models for the primary business domain.  
- **Authentication System:** Secure login using Next-Auth credentials provider.  
- **Insurer & Product Management:** CRUD operations in the admin panel to add/edit insurance providers and their specific product tiers.  
- **Industry Template Management:** Ability to map custom form templates to specific industry verticals.  
- **Base PDF Export:** Foundational functionality to export quote results to PDF.

### In-progress (Phase 2C)

- **Admin Dashboard Enhancements:** Adding real-time statistics and a recent leads view to the main dashboard.  
- **UX Polish:** Implementation of dynamic breadcrumbs ([AdminBreadcrumb.tsx](file:///d:/projects/Riskguard_Compare/riskguard-compare/src/app/admin/AdminBreadcrumb.tsx)) for easier navigation within the complex admin hierarchy.  
- **Advanced PDF Generation:** Refining the PDF export to include polished branding, structured layouts, and necessary legal disclaimers.  
- **Quote Engine Logic:** Tying the front-end `/quote/compare` flow strictly to the DB's dynamic products rating logic.  
- **Vercel Build Stabilization:** Fixing environment specific build issues (e.g., bcrypt library swap).

### Future Plans

- **Email Automations:** Automating quote delivery and follow-ups to captured leads using Resend.  
- **Direct Insurer Integrations:** Implementing third-party APIs to push lead data directly to insurer portals.  
- **Client Self-Serve Portal:** A secure area for clients to view their generated quotes, update risk profiles, and accept policies.  
- **Advanced Analytics:** Charting conversion rates, premium volume, and popular products within the admin view.  
- **Gamification/Interactive UI Explorations:** Incorporating advanced UI elements (potentially related to the Web POC/Animation experiments) to increase consumer engagement during the lengthy risk-assessment forms.

