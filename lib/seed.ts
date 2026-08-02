import { db } from "./db";
import { modules, lessons } from "./schema";
import { and, eq } from "drizzle-orm";

/**
 * Seed / refresh Module 1 content.
 *
 * Idempotent: re-running this script UPSERTS the four Module 1 lessons
 * (matched by module slug + order index), so placeholder content already in
 * the database gets replaced with the real Module 1 content. Safe to run
 * any number of times.
 *
 * Run with: npm run db:seed   (requires DATABASE_URL)
 */

const MODULE_SLUG = "module-1-bookkeeping-foundations";

interface LessonSeed {
  title: string;
  type: "written" | "slides" | "exercise" | "quiz";
  orderIndex: number;
  content: unknown;
}

// ── Lesson content ──────────────────────────────────────────────────────────

const LESSONS: LessonSeed[] = [
  {
    title: "Written Lesson",
    type: "written",
    orderIndex: 1,
    content: {
      sections: [
        {
          heading: "Welcome to Module 1",
          blocks: [
            {
              type: "p",
              text: "*Bookkeeping Basics — a course for people who've never touched a ledger in their life.*",
            },
            {
              type: "p",
              text: "Welcome to Module 1. By the end of this module, you'll understand what bookkeeping actually is, why it matters, and the core mental model (the accounting equation) that everything else in this course builds on. We'll follow one small business — **Maria's Bakery** — through every example, so the ideas stay grounded instead of abstract.",
            },
          ],
        },
        {
          heading: "Bookkeeping vs. Accounting",
          blocks: [
            {
              type: "p",
              text: "People use these words interchangeably, but they're different jobs.",
            },
            {
              type: "p",
              text: "**Bookkeeping** is the day-to-day recording of financial transactions — every sale, every purchase, every bill paid. It's the raw data entry: what happened, when, and for how much.",
            },
            {
              type: "p",
              text: "**Accounting** is what happens *with* that data afterward — analyzing it, summarizing it into financial statements, using it to make decisions, filing taxes, and advising on strategy.",
            },
            {
              type: "p",
              text: "Think of it this way: Maria rings up a customer for a dozen croissants and logs the $18 sale in her books. That's bookkeeping. At the end of the month, her accountant looks at all those logged sales alongside her expenses and tells her whether the bakery actually turned a profit, and how much she owes in taxes. That's accounting.",
            },
            {
              type: "callout",
              text: "**The relationship:** accounting can't happen without bookkeeping. If the day-to-day records are messy or incomplete, every report built on top of them will be wrong. That's why this course starts here — bookkeeping is the foundation everything else stands on.",
            },
          ],
        },
        {
          heading: "The Accounting Equation",
          blocks: [
            {
              type: "p",
              text: "Every single bookkeeping entry you'll ever make, no matter how complicated the business, ultimately respects one equation:",
            },
            { type: "p", text: "**Assets = Liabilities + Equity**" },
            {
              type: "list",
              items: [
                "**Assets** — what the business owns. Cash, equipment, inventory, money owed to it by customers.",
                "**Liabilities** — what the business owes. Loans, unpaid bills, credit card balances.",
                "**Equity** — what's left over for the owner once liabilities are subtracted from assets. It's the owner's actual stake in the business.",
              ],
            },
            {
              type: "callout",
              text: "This equation always has to balance. That's not a suggestion — it's the mechanical rule bookkeeping is built on. If it doesn't balance, something was recorded wrong somewhere.",
            },
            {
              type: "p",
              text: "**Maria's Bakery example:** Maria takes out a $10,000 loan to buy a commercial oven.",
            },
            {
              type: "list",
              items: [
                "Assets go up by $10,000 (she now has cash, or an oven).",
                "Liabilities go up by $10,000 (she now owes the loan).",
                "Equity doesn't change — she didn't put in any of her own money, and she doesn't owe anyone that money for a stake in her business, she owes it back as debt.",
              ],
            },
            {
              type: "code",
              text: "Before: Assets $5,000 = Liabilities $0 + Equity $5,000\nAfter:  Assets $15,000 = Liabilities $10,000 + Equity $5,000",
            },
            {
              type: "p",
              text: "Still balanced. This is the check you'll come back to again and again.",
            },
          ],
        },
        {
          heading: "Debits and Credits",
          blocks: [
            {
              type: "p",
              text: "This is the part that trips up almost every beginner, so let's slow down.",
            },
            {
              type: "p",
              text: "Debits and credits are **not** \"good\" and \"bad,\" or \"money in\" and \"money out.\" They're simply the two sides of every transaction — bookkeeping records everything twice (once as a debit, once as a credit), which is why it's called **double-entry bookkeeping**. This is what keeps the accounting equation in balance.",
            },
            {
              type: "p",
              text: "Every account falls into one of five types, and each type has a \"normal\" side it increases on:",
            },
            {
              type: "table",
              headers: ["Account Type", "Increases with", "Decreases with"],
              rows: [
                ["Assets", "Debit", "Credit"],
                ["Expenses", "Debit", "Credit"],
                ["Liabilities", "Credit", "Debit"],
                ["Equity", "Credit", "Debit"],
                ["Revenue", "Credit", "Debit"],
              ],
            },
            {
              type: "callout",
              text: "A handy way to remember it: **Assets and Expenses live on the debit side. Liabilities, Equity, and Revenue live on the credit side.**",
            },
            {
              type: "p",
              text: "**Maria's Bakery example:** Maria buys $200 of flour with cash.",
            },
            {
              type: "list",
              items: [
                "Inventory (an asset) increases → debit $200",
                "Cash (an asset) decreases → credit $200",
              ],
            },
            {
              type: "p",
              text: "Two entries, same transaction, and the equation stays balanced because total debits ($200) equal total credits ($200).",
            },
          ],
        },
        {
          heading: "T-Accounts",
          blocks: [
            {
              type: "p",
              text: "A T-account is just a simple visual tool for tracking debits and credits for a single account. It's shaped like a capital \"T\" — the account name on top, debits on the left, credits on the right.",
            },
            {
              type: "code",
              text: "              Cash\n  ---------------------------\n   Debit    |    Credit\n  ---------------------------\n  $1,000    |     $200\n    $500    |     $150\n  ---------------------------\n  Balance: $1,150",
            },
            {
              type: "p",
              text: "You total each side, and the difference is the account's balance. For asset accounts (like Cash), a bigger debit total means a bigger balance — which matches what we said above: assets increase with debits.",
            },
            {
              type: "p",
              text: "**Maria's Bakery example:** Let's build the T-account for Maria's Cash over one week:",
            },
            {
              type: "list",
              items: [
                "Monday: opens the account with $500 (debit)",
                "Tuesday: sells $300 of pastries for cash (debit — cash coming in)",
                "Wednesday: pays $120 for flour (credit — cash going out)",
                "Friday: pays $75 for electricity (credit — cash going out)",
              ],
            },
            {
              type: "code",
              text: "              Cash\n  ---------------------------\n   Debit    |    Credit\n  ---------------------------\n  $500      |    $120\n  $300      |     $75\n  ---------------------------\n  Balance: $605",
            },
            {
              type: "p",
              text: "You'll practice this hands-on in the interactive exercise at the end of this module.",
            },
          ],
        },
        {
          heading: "Cash Basis vs. Accrual Basis",
          blocks: [
            {
              type: "p",
              text: "This is about *when* you record a transaction, and it changes the picture of a business's finances quite a bit.",
            },
            {
              type: "p",
              text: "**Cash basis**: you record revenue when cash is actually received, and expenses when cash is actually paid. Simple, intuitive, and common for small businesses.",
            },
            {
              type: "p",
              text: "**Accrual basis**: you record revenue when it's *earned* (even if payment hasn't landed yet) and expenses when they're *incurred* (even if you haven't paid the bill yet). This gives a more accurate picture of what a business earned and spent during a specific period — but it's more complex to maintain.",
            },
            {
              type: "p",
              text: "**Maria's Bakery example:** Maria caters a wedding on June 28th for $2,000, but the client doesn't pay until July 5th.",
            },
            {
              type: "list",
              items: [
                "**Cash basis**: the $2,000 is recorded in July, when the cash arrives.",
                "**Accrual basis**: the $2,000 is recorded in June, when the work was done and the revenue was earned.",
              ],
            },
            {
              type: "p",
              text: "Neither is \"wrong\" — they're different systems with different tradeoffs. Cash basis is easier to manage and mirrors your actual bank balance. Accrual basis better reflects business performance, which matters more as a business grows or needs to report to investors or lenders. Many small businesses start on cash basis and move to accrual as they scale.",
            },
          ],
        },
        {
          heading: "Glossary of Key Terms",
          blocks: [
            {
              type: "list",
              items: [
                "**Asset** — anything the business owns that has value (cash, equipment, inventory, receivables).",
                "**Liability** — anything the business owes to others (loans, unpaid bills).",
                "**Equity** — the owner's stake in the business (Assets − Liabilities).",
                "**Debit** — an entry on the left side of an account; increases assets and expenses, decreases liabilities, equity, and revenue.",
                "**Credit** — an entry on the right side of an account; increases liabilities, equity, and revenue, decreases assets and expenses.",
                "**Double-entry bookkeeping** — the system where every transaction is recorded as both a debit and a credit, keeping the accounting equation balanced.",
                "**T-account** — a visual tool shaped like a \"T\" used to track the debits, credits, and balance of a single account.",
                "**Cash basis accounting** — recording revenue and expenses when cash actually changes hands.",
                "**Accrual basis accounting** — recording revenue when earned and expenses when incurred, regardless of when cash moves.",
              ],
            },
          ],
        },
        {
          heading: "Practice Exercises",
          blocks: [
            {
              type: "p",
              text: "For each transaction at Maria's Bakery, identify which accounts are affected and whether each is a debit or a credit.",
            },
            {
              type: "list",
              ordered: true,
              items: [
                "Maria buys a new mixer for $600 cash.",
                "Maria takes out a $5,000 business loan.",
                "Maria sells $250 of bread to a customer, paid in cash.",
                "Maria pays her assistant $400 in wages, in cash.",
                "Maria buys $150 of sugar and flour on credit (she'll pay the supplier later).",
              ],
            },
            { type: "p", text: "**Answer Key**" },
            {
              type: "list",
              ordered: true,
              items: [
                "**Equipment (asset)** increases → Debit $600; **Cash (asset)** decreases → Credit $600",
                "**Cash (asset)** increases → Debit $5,000; **Loan Payable (liability)** increases → Credit $5,000",
                "**Cash (asset)** increases → Debit $250; **Revenue** increases → Credit $250",
                "**Wages Expense** increases → Debit $400; **Cash (asset)** decreases → Credit $400",
                "**Inventory (asset)** increases → Debit $150; **Accounts Payable (liability)** increases → Credit $150",
              ],
            },
          ],
        },
        {
          heading: "Key Takeaways",
          blocks: [
            {
              type: "list",
              items: [
                "Bookkeeping is the recording; accounting is the analysis.",
                "Assets = Liabilities + Equity, always.",
                "Debits and credits are two sides of every transaction, not \"good\" and \"bad.\"",
                "T-accounts are a simple way to visualize an account's activity and balance.",
                "Cash basis records money when it moves; accrual basis records it when it's earned or owed.",
              ],
            },
            {
              type: "callout",
              text: "Ready to practice? Head to the T-Account exercise to try this hands-on with Maria's Bakery transactions.",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Slide Overview",
    type: "slides",
    orderIndex: 2,
    content: {
      slides: [
        {
          title: "Bookkeeping Basics",
          body: "Module 1: Bookkeeping Foundations\nFollowing Maria's Bakery from first sale to first balanced ledger",
        },
        {
          title: "Bookkeeping vs. Accounting",
          body: "- Bookkeeping = recording what happened (day-to-day transactions)\n- Accounting = analyzing what it means (statements, taxes, strategy)\n- Maria logs an $18 croissant sale (bookkeeping) → her accountant uses it to calculate profit (accounting)",
        },
        {
          title: "The Accounting Equation",
          body: "**Assets = Liabilities + Equity**\n- Assets: what the business owns\n- Liabilities: what the business owes\n- Equity: the owner's stake\nExample: Maria's $10,000 oven loan — Assets +$10,000, Liabilities +$10,000, Equity unchanged",
        },
        {
          title: "Debits and Credits",
          body: "- Not \"good\" and \"bad\" — just two sides of every entry\n- Assets & Expenses ↑ with Debits\n- Liabilities, Equity & Revenue ↑ with Credits\n- Example: Maria buys $200 flour with cash → Inventory debit $200, Cash credit $200",
        },
        {
          title: "T-Accounts",
          body: "- A \"T\"-shaped visual: debits left, credits right\n- Total each side, find the balance\n- Visual: Maria's Cash T-account across one week (opens $500, +$300 sale, −$120 flour, −$75 electricity → balance $605)",
        },
        {
          title: "Cash Basis vs. Accrual Basis",
          body: "- Cash basis: record when cash moves\n- Accrual basis: record when earned/incurred\n- Example: Maria's $2,000 wedding catering, earned June 28, paid July 5 — recorded in June (accrual) vs. July (cash)",
        },
        {
          title: "Key Takeaways",
          body: "- Bookkeeping records, accounting analyzes\n- Assets = Liabilities + Equity, always\n- Every transaction has a debit and a credit\n- T-accounts visualize an account's activity\n- Cash vs. accrual changes *when* you record, not *what* happened",
        },
        {
          title: "What's Next",
          body: "- Practice: T-Account exercise with Maria's Bakery transactions\n- Coming in Module 2: The Core Documents — chart of accounts, general ledger, journal entries, trial balance",
        },
      ],
    },
  },
  {
    title: "T-Account Practice",
    type: "exercise",
    orderIndex: 3,
    content: {
      exerciseType: "t-account",
      source: "t_account_practice.html",
    },
  },
  {
    title: "Knowledge Check",
    type: "quiz",
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
          question:
            "In double-entry bookkeeping, every transaction affects at least how many accounts?",
          options: ["1", "2", "3", "4"],
          correctIndex: 1,
        },
        {
          question:
            "Which basis of accounting records revenue when it is earned (not when cash is received)?",
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
          options: ["Right side", "Left side", "Top", "Bottom"],
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

// ── Seed logic (idempotent upsert) ──────────────────────────────────────────

async function seed() {
  console.log("Seeding Module 1 content...");

  // Find or create the module
  let [mod] = await db
    .select()
    .from(modules)
    .where(eq(modules.slug, MODULE_SLUG))
    .limit(1);

  if (!mod) {
    [mod] = await db
      .insert(modules)
      .values({
        title: "Module 1: Bookkeeping Foundations",
        slug: MODULE_SLUG,
        description:
          "Covers bookkeeping vs. accounting, the accounting equation, debits/credits, T-accounts, cash vs. accrual basis, and includes a glossary and practice exercises.",
        orderIndex: 1,
        dripDelayDays: 0,
      })
      .returning();
    console.log(`Created module: ${mod.title} (id=${mod.id})`);
  } else {
    console.log(`Found existing module: ${mod.title} (id=${mod.id})`);
  }

  // Upsert lessons by (moduleId, orderIndex)
  for (const lesson of LESSONS) {
    const [existing] = await db
      .select()
      .from(lessons)
      .where(
        and(
          eq(lessons.moduleId, mod.id),
          eq(lessons.orderIndex, lesson.orderIndex)
        )
      )
      .limit(1);

    if (existing) {
      await db
        .update(lessons)
        .set({
          title: lesson.title,
          type: lesson.type,
          content: lesson.content,
        })
        .where(eq(lessons.id, existing.id));
      console.log(`  Updated lesson: ${lesson.title} (id=${existing.id})`);
    } else {
      await db.insert(lessons).values({
        moduleId: mod.id,
        title: lesson.title,
        type: lesson.type,
        content: lesson.content,
        orderIndex: lesson.orderIndex,
      });
      console.log(`  Created lesson: ${lesson.title}`);
    }
  }

  console.log("Seed complete.");
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
