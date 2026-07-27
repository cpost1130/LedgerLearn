import { db } from "./db";
import { modules, lessons } from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding Module 1 data...");

  // Check if Module 1 already exists
  const existing = await db
    .select()
    .from(modules)
    .where(eq(modules.slug, "module-1-bookkeeping-foundations"))
    .limit(1);

  if (existing.length > 0) {
    console.log("Module 1 already exists. Skipping seed.");
    const mod = existing[0];

    // Check if lessons already seeded
    const existingLessons = await db
      .select()
      .from(lessons)
      .where(eq(lessons.moduleId, mod.id));

    if (existingLessons.length > 0) {
      console.log(`  ${existingLessons.length} lessons already exist. Skipping.`);
      return;
    }

    // Module exists but no lessons — seed lessons only
    await seedLessons(mod.id);
    return;
  }

  // Insert Module 1
  const [mod] = await db
    .insert(modules)
    .values({
      title: "Module 1: Bookkeeping Foundations",
      slug: "module-1-bookkeeping-foundations",
      description:
        "Covers bookkeeping vs. accounting, the accounting equation, debits/credits, T-accounts, cash vs. accrual basis, and includes a glossary and practice exercises.",
      orderIndex: 1,
      dripDelayDays: 0,
    })
    .returning();

  console.log(`Created module: ${mod.title} (id=${mod.id})`);

  await seedLessons(mod.id);
  console.log("Seed complete.");
}

async function seedLessons(moduleId: number) {
  const lessonData = [
    {
      title: "Written Lesson",
      type: "written" as const,
      orderIndex: 1,
      content: {
        sections: [
          {
            heading: "Bookkeeping vs. Accounting",
            body: "Placeholder — content will be added from Module_1_Bookkeeping_Foundations.docx",
          },
          {
            heading: "The Accounting Equation",
            body: "Assets = Liabilities + Equity. This fundamental equation is the backbone of all bookkeeping. Placeholder — full content coming soon.",
            callout:
              "Key Takeaway: Every transaction affects at least two accounts, keeping the accounting equation in balance.",
          },
          {
            heading: "Debits and Credits",
            body: "Debits and credits are the language of bookkeeping. In double-entry bookkeeping, every transaction is recorded with at least one debit and one credit. Placeholder — full content coming soon.",
          },
          {
            heading: "T-Accounts",
            body: "T-accounts are a visual tool for understanding how transactions flow through accounts. They help you see the relationship between debits and credits before recording formal journal entries. Placeholder — full content coming soon.",
          },
          {
            heading: "Cash vs. Accrual Basis",
            body: "Cash basis recognizes revenue and expenses when cash changes hands. Accrual basis recognizes them when earned or incurred. Understanding the difference is essential for accurate financial reporting. Placeholder — full content coming soon.",
            callout:
              "Most businesses use accrual basis accounting. It provides a more accurate picture of financial health.",
          },
          {
            heading: "Glossary of Key Terms",
            body: "Asset, Liability, Equity, Revenue, Expense, Debit, Credit, Journal Entry, Ledger, Trial Balance. Placeholder — full definitions coming soon.",
          },
        ],
      },
    },
    {
      title: "Slide Overview",
      type: "slides" as const,
      orderIndex: 2,
      content: {
        slides: [
          {
            title: "Welcome to Bookkeeping Foundations",
            body: "In this module, you'll learn the fundamental concepts that every bookkeeper needs to know.",
          },
          {
            title: "Bookkeeping vs. Accounting",
            body: "Bookkeeping records daily transactions. Accounting interprets and reports on that data. Both are essential parts of the financial process.",
          },
          {
            title: "The Accounting Equation",
            body: "Assets = Liabilities + Equity. This equation must always balance. Every transaction affects at least two accounts.",
          },
          {
            title: "Debits and Credits",
            body: "Debits increase assets and expenses. Credits increase liabilities, equity, and revenue. The total debits must always equal total credits.",
          },
          {
            title: "T-Accounts",
            body: "T-accounts are simple visual ledgers — a 'T' shape with debits on the left and credits on the right. They help you visualize transaction flow.",
          },
          {
            title: "Cash vs. Accrual Basis",
            body: "Cash basis: record when money moves. Accrual basis: record when the obligation arises. Accrual gives a truer picture of financial position.",
          },
          {
            title: "Practice Makes Perfect",
            body: "Complete the T-Account Practice exercise and Knowledge Check quiz to reinforce what you've learned.",
          },
        ],
      },
    },
    {
      title: "T-Account Practice",
      type: "exercise" as const,
      orderIndex: 3,
      content: {
        exerciseType: "t-account",
        placeholder: true,
      },
    },
    {
      title: "Knowledge Check",
      type: "quiz" as const,
      orderIndex: 4,
      content: {
        questions: [
          {
            question: "What is the accounting equation?",
            options: [
              "Assets = Liabilities + Equity",
              "Assets = Revenue - Expenses",
              "Debits = Credits",
              "Cash In = Cash Out",
            ],
            correctIndex: 0,
          },
          {
            question: "In double-entry bookkeeping, every transaction affects at least how many accounts?",
            options: ["1", "2", "3", "4"],
            correctIndex: 1,
          },
          {
            question: "Which basis of accounting records revenue when it is earned (not when cash is received)?",
            options: [
              "Cash basis",
              "Accrual basis",
              "Modified cash basis",
              "Tax basis",
            ],
            correctIndex: 1,
          },
          {
            question: "On a T-account, where are debits recorded?",
            options: [
              "Right side",
              "Left side",
              "Top",
              "Bottom",
            ],
            correctIndex: 1,
          },
          {
            question: "Which of the following is increased by a credit?",
            options: ["Cash", "Equipment", "Revenue", "Rent Expense"],
            correctIndex: 2,
          },
        ],
      },
    },
  ];

  for (const lesson of lessonData) {
    await db.insert(lessons).values({
      moduleId,
      title: lesson.title,
      type: lesson.type,
      content: lesson.content,
      orderIndex: lesson.orderIndex,
    });
    console.log(`  Created lesson: ${lesson.title}`);
  }
}

seed()
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
