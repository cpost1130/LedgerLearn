import { db } from "./db";
import { modules, lessons } from "./schema";
import { and, eq } from "drizzle-orm";

/**
 * Seed / refresh course content (Modules 1–4).
 *
 * Idempotent: re-running this script UPSERTS every lesson (matched by module
 * slug + order index), so placeholder content already in the database gets
 * replaced with the real content. Safe to run any number of times.
 *
 * Run with: npm run db:seed   (requires DATABASE_URL)
 */

interface LessonSeed {
  title: string;
  type: "written" | "slides" | "exercise" | "quiz";
  orderIndex: number;
  content: unknown;
}

interface ModuleSeed {
  title: string;
  slug: string;
  description: string;
  orderIndex: number;
  dripDelayDays: number;
  lessons: LessonSeed[];
}

// ── Module 1: Bookkeeping Foundations ───────────────────────────────────────

const MODULE_1_SLUG = "module-1-bookkeeping-foundations";

const MODULE_1_LESSONS: LessonSeed[] = [
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

// ── Module 2: The Core Documents ────────────────────────────────────────────

const MODULE_2_SLUG = "module-2-the-core-documents";

const MODULE_2_LESSONS: LessonSeed[] = [
  {
    title: "Written Lesson",
    type: "written",
    orderIndex: 1,
    content: {
      sections: [
        {
          heading: "Welcome to Module 2",
          blocks: [
            {
              type: "p",
              text: "In Module 1 you learned the accounting equation and how debits and credits work. Now we'll look at the documents that hold all of that together in a real business. This time we're following **Diego's Bike Shop** — repairs, parts sales, and bike rentals — through its books.",
            },
          ],
        },
        {
          heading: "The Chart of Accounts",
          blocks: [
            {
              type: "p",
              text: "A **chart of accounts** is the master list of every account a business uses to categorize its financial activity. Think of it as the filing system bookkeeping runs on — every transaction gets sorted into one of these buckets.",
            },
            {
              type: "p",
              text: "Accounts are grouped into the five types you already know:",
            },
            {
              type: "table",
              headers: ["Category", "Examples for Diego's Bike Shop"],
              rows: [
                ["Assets", "Cash, Accounts Receivable, Parts Inventory, Repair Equipment"],
                ["Liabilities", "Accounts Payable, Loan Payable"],
                ["Equity", "Diego's Capital, Retained Earnings"],
                ["Revenue", "Repair Revenue, Parts Sales Revenue, Rental Revenue"],
                ["Expenses", "Rent Expense, Wages Expense, Utilities Expense, Supplies Expense"],
              ],
            },
            {
              type: "p",
              text: "Each account usually gets a number too, so software can sort them consistently — a common convention is Assets in the 1000s, Liabilities in the 2000s, Equity in the 3000s, Revenue in the 4000s, and Expenses in the 5000s. So Diego might set up \"1000 – Cash,\" \"1200 – Parts Inventory,\" \"4000 – Repair Revenue,\" and so on.",
            },
            {
              type: "callout",
              text: "**Why it matters:** without a chart of accounts, every transaction would need a made-up label, and nothing would be comparable month to month. With it, Diego can always answer \"how much did I spend on parts this year?\" by pulling one account.",
            },
          ],
        },
        {
          heading: "The General Ledger",
          blocks: [
            {
              type: "p",
              text: "The **general ledger** is the complete record of every transaction, organized by account. If the chart of accounts is the filing system, the general ledger is what's actually inside each folder — every debit and credit ever posted to that account, in order.",
            },
            {
              type: "p",
              text: "Each account in the ledger looks like an expanded T-account: a running list of debits, credits, and a balance that updates after every entry.",
            },
            {
              type: "p",
              text: "**Diego's Bike Shop example — Cash account in the general ledger:**",
            },
            {
              type: "table",
              headers: ["Date", "Description", "Debit", "Credit", "Balance"],
              rows: [
                ["May 1", "Opening balance", "", "", "$1,000"],
                ["May 3", "Bike repair, cash", "$80", "", "$1,080"],
                ["May 5", "Bought tire inventory", "", "$150", "$930"],
                ["May 8", "Rental income, cash", "$60", "", "$990"],
              ],
            },
            {
              type: "p",
              text: "The general ledger is the source of truth. Every financial statement Diego will ever look at is ultimately built by summarizing what's in the ledger.",
            },
          ],
        },
        {
          heading: "Journal Entries",
          blocks: [
            {
              type: "p",
              text: "A **journal entry** is how a transaction actually gets recorded before it lands in the ledger. It's the formal, written version of \"here's what happened and which accounts it touches\" — always with debits and credits that balance.",
            },
            {
              type: "p",
              text: "The standard format:",
            },
            {
              type: "code",
              text: "Date: May 3\nDebit:  Cash .......................... $80\nCredit:   Repair Revenue .............. $80\nDescription: Bike tune-up for walk-in customer, paid cash",
            },
            {
              type: "p",
              text: "Debits are listed first (and indented left), credits second (and indented slightly right) — this is a bookkeeping convention that makes it easy to scan and check that the entry balances.",
            },
            {
              type: "p",
              text: "**Diego's Bike Shop example — buying inventory on credit:**",
            },
            {
              type: "p",
              text: "Diego orders $300 of tires and tubes from a supplier, to be paid in 30 days.",
            },
            {
              type: "code",
              text: "Date: May 5\nDebit:  Parts Inventory ............... $300\nCredit:   Accounts Payable ............ $300\nDescription: Tire and tube order from CycleSupply Co., net 30",
            },
            {
              type: "p",
              text: "Notice this is the same underlying logic from Module 1 — figure out which accounts are affected, then apply \"assets & expenses debit to increase, liabilities/equity/revenue credit to increase.\" The journal entry is just the formal record of that thinking.",
            },
            {
              type: "p",
              text: "Once written, this entry gets **posted** — copied — into the general ledger accounts it affects (Parts Inventory and Accounts Payable both get updated).",
            },
          ],
        },
        {
          heading: "The Trial Balance",
          blocks: [
            {
              type: "p",
              text: "A **trial balance** is a summary report: every account in the general ledger, listed with its ending balance, sorted into a debit column or a credit column. Its whole job is to check one thing — **do total debits equal total credits?** If they do, the books are at least mechanically consistent (it doesn't catch every kind of mistake, but it catches the big one: an unbalanced entry).",
            },
            {
              type: "p",
              text: "**Diego's Bike Shop — simplified trial balance, end of May:**",
            },
            {
              type: "table",
              headers: ["Account", "Debit", "Credit"],
              rows: [
                ["Cash", "$990", ""],
                ["Parts Inventory", "$300", ""],
                ["Accounts Payable", "", "$300"],
                ["Diego's Capital", "", "$1,000"],
                ["Repair Revenue", "", "$80"],
                ["Rental Revenue", "", "$60"],
                ["Rent Expense", "$150", ""],
                ["**Totals**", "**$1,440**", "**$1,440**"],
              ],
            },
            {
              type: "p",
              text: "Debits equal credits — this trial balance is in balance. If Diego's totals didn't match, he'd know to go back through the ledger and find where an entry was recorded incorrectly (a debit without a matching credit, a number transposed, or an entry posted to the wrong side).",
            },
            {
              type: "callout",
              text: "**Why it matters:** the trial balance is the checkpoint before financial statements get built. You wouldn't want to build a profit & loss statement or a balance sheet on top of ledger balances that don't even balance against each other.",
            },
          ],
        },
        {
          heading: "Glossary",
          blocks: [
            {
              type: "list",
              items: [
                "**Chart of accounts** — the master categorized list of every account a business uses.",
                "**General ledger** — the complete, ongoing record of every transaction, organized by account.",
                "**Journal entry** — the formal record of a single transaction, listing the accounts, debits, and credits involved.",
                "**Posting** — the process of copying a journal entry's amounts into the relevant general ledger accounts.",
                "**Trial balance** — a summary listing every account's ending balance, used to check that total debits equal total credits.",
              ],
            },
          ],
        },
        {
          heading: "Practice Exercises",
          blocks: [
            {
              type: "p",
              text: "Write the journal entry for each of Diego's Bike Shop transactions below (account, debit or credit, amount).",
            },
            {
              type: "list",
              ordered: true,
              items: [
                "Diego repairs a customer's bike for $95, paid in cash.",
                "Diego rents out 3 bikes for $45 total, paid in cash.",
                "Diego buys $200 of new inner tubes, paying with the shop's cash.",
                "Diego pays his part-time mechanic $250 in wages, in cash.",
                "Diego orders a $500 bike rack display from a supplier, to be paid in 30 days (on credit).",
              ],
            },
            { type: "p", text: "**Answer Key**" },
            {
              type: "list",
              ordered: true,
              items: [
                "Debit Cash $95 / Credit Repair Revenue $95",
                "Debit Cash $45 / Credit Rental Revenue $45",
                "Debit Parts Inventory $200 / Credit Cash $200",
                "Debit Wages Expense $250 / Credit Cash $250",
                "Debit Equipment $500 / Credit Accounts Payable $500",
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
                "The chart of accounts is the master list every transaction gets sorted into.",
                "The general ledger holds the full running history for each account.",
                "A journal entry is the formal, balanced record of a single transaction — debits first, credits second.",
                "The trial balance checks that everything still balances before financial statements get built from it.",
              ],
            },
            {
              type: "callout",
              text: "Ready to practice? Head to the Journal Entry Builder exercise to record Diego's Bike Shop transactions yourself.",
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
          body: "Module 2: The Core Documents\nInside Diego's Bike Shop — repairs, parts, and rentals",
        },
        {
          title: "The Chart of Accounts",
          body: "- The master categorized list every transaction gets sorted into\n- 5 categories: Assets, Liabilities, Equity, Revenue, Expenses\n- Diego's chart: Cash, Parts Inventory, Repair Revenue, Rental Revenue, Rent Expense...",
        },
        {
          title: "The General Ledger",
          body: "- The full running record of every transaction, by account\n- Each account looks like an expanded T-account with a running balance\n- Diego's Cash ledger: opening $1,000 → $1,080 (repair) → $930 (tires) → $990 (rental)",
        },
        {
          title: "Journal Entries",
          body: "- The formal, written record of a single transaction\n- Debits listed first, credits second, always balanced\nExample: Diego orders $300 of tires on credit → Debit Parts Inventory $300 / Credit Accounts Payable $300",
        },
        {
          title: "Posting to the Ledger",
          body: "- Posting = copying a journal entry into the ledger accounts it affects\n- Journal entry → posted → ledger balance updates\nVisual flow: Journal Entry → Post → General Ledger",
        },
        {
          title: "The Trial Balance",
          body: "- A summary of every account's ending balance\n- Checks one thing: do total debits equal total credits?\nExample: Diego's May trial balance — Debits $1,440 = Credits $1,440 ✓",
        },
        {
          title: "Key Takeaways",
          body: "- Chart of accounts = the filing system\n- General ledger = the full history\n- Journal entry = the formal record of one transaction\n- Trial balance = the balance checkpoint before financial statements",
        },
        {
          title: "What's Next",
          body: "- Practice: Journal Entry Builder with Diego's Bike Shop transactions\n- Coming in Module 3: Day-to-Day Transactions — recording sales, expenses, payroll basics",
        },
      ],
    },
  },
  {
    title: "Journal Entry Builder",
    type: "exercise",
    orderIndex: 3,
    content: {
      exerciseType: "journal-entry",
      source: "journal_entry_builder.html",
    },
  },
  {
    title: "Knowledge Check",
    type: "quiz",
    orderIndex: 4,
    content: {
      questions: [
        {
          question: "What is the chart of accounts?",
          options: [
            "The master list of every account a business uses to categorize its financial activity",
            "A report showing whether total debits equal total credits",
            "The complete record of every transaction, organized by account",
            "A summary of a business's profit for the year",
          ],
          correctIndex: 0,
        },
        {
          question:
            "Which document holds the complete, running record of every debit and credit posted to each account, in order?",
          options: [
            "The chart of accounts",
            "The trial balance",
            "The general ledger",
            "The invoice",
          ],
          correctIndex: 2,
        },
        {
          question: "In a standard journal entry, what order is used?",
          options: [
            "Credits first, debits second",
            "Debits first, credits second",
            "Largest amounts first",
            "Chronological order only",
          ],
          correctIndex: 1,
        },
        {
          question:
            "What is the single thing a trial balance checks?",
          options: [
            "That every account has a number",
            "That revenue exceeds expenses",
            "That total debits equal total credits",
            "That cash is not negative",
          ],
          correctIndex: 2,
        },
        {
          question:
            "Diego repairs a customer's bike for $95, paid in cash. What is the correct journal entry?",
          options: [
            "Debit Repair Revenue $95 / Credit Cash $95",
            "Debit Cash $95 / Credit Repair Revenue $95",
            "Debit Cash $95 / Credit Accounts Payable $95",
            "Debit Wages Expense $95 / Credit Cash $95",
          ],
          correctIndex: 1,
        },
        {
          question:
            "Diego orders a $500 bike rack display from a supplier, to be paid in 30 days. What is the correct journal entry?",
          options: [
            "Debit Equipment $500 / Credit Accounts Payable $500",
            "Debit Accounts Payable $500 / Credit Equipment $500",
            "Debit Equipment $500 / Credit Cash $500",
            "Debit Parts Inventory $500 / Credit Cash $500",
          ],
          correctIndex: 0,
        },
      ],
    },
  },
];

// ── Module 3: Day-to-Day Transactions ───────────────────────────────────────

const MODULE_3_SLUG = "module-3-day-to-day-transactions";

const MODULE_3_LESSONS: LessonSeed[] = [
  {
    title: "Written Lesson",
    type: "written",
    orderIndex: 1,
    content: {
      sections: [
        {
          heading: "Welcome to Module 3",
          blocks: [
            {
              type: "p",
              text: "Modules 1 and 2 gave you the mechanics: debits, credits, ledgers, journal entries, trial balances. Module 3 is about applying those mechanics to the transactions that show up constantly in any small business — sales, expenses, and payroll. This time we're following **Green Acres Landscaping**, a small crew-based lawn and garden business.",
            },
          ],
        },
        {
          heading: "Recording Sales",
          blocks: [
            {
              type: "p",
              text: "Every sale a business makes needs to be recorded, but *how* it's recorded depends on whether the customer pays immediately or later.",
            },
            {
              type: "p",
              text: "**Cash sale** — customer pays on the spot. Simple: Cash goes up, Revenue goes up.",
            },
            {
              type: "p",
              text: "**Sale on credit (invoiced)** — customer is billed and pays later. The business doesn't have the cash yet, but it has a right to collect it — that's an asset called **Accounts Receivable**.",
            },
            {
              type: "p",
              text: "**Green Acres example — a cash sale:** Green Acres mows a homeowner's lawn for $75, paid on the spot.",
            },
            {
              type: "code",
              text: "Debit:  Cash ........................... $75\nCredit:   Mowing Revenue ............... $75",
            },
            {
              type: "p",
              text: "**Green Acres example — a sale on credit:** Green Acres completes a $600 landscaping job for a commercial client, who will be invoiced and pay in 30 days.",
            },
            {
              type: "code",
              text: "Debit:  Accounts Receivable ............ $600\nCredit:   Landscaping Revenue ........... $600",
            },
            {
              type: "p",
              text: "Later, when the client actually pays:",
            },
            {
              type: "code",
              text: "Debit:  Cash ............................ $600\nCredit:   Accounts Receivable ........... $600",
            },
            {
              type: "callout",
              text: "Notice that revenue was recorded once — when the job was done — not again when the cash arrived. This is the accrual idea from Module 1 in action: Accounts Receivable is just a placeholder for cash that's coming.",
            },
          ],
        },
        {
          heading: "Recording Expenses",
          blocks: [
            {
              type: "p",
              text: "Expenses work the same way, mirrored: **paid immediately** vs. **billed and paid later**.",
            },
            {
              type: "p",
              text: "**Paid immediately (cash expense):** Green Acres buys $40 of gas for the mowers, paid by debit card.",
            },
            {
              type: "code",
              text: "Debit:  Fuel Expense .................... $40\nCredit:   Cash ........................... $40",
            },
            {
              type: "p",
              text: "**Billed and paid later (on credit):** Green Acres gets a $200 repair done on a mower, and the shop will send an invoice due in 15 days. This creates a liability — **Accounts Payable** — money the business owes but hasn't paid yet.",
            },
            {
              type: "code",
              text: "Debit:  Repair Expense .................. $200\nCredit:   Accounts Payable ............... $200",
            },
            {
              type: "p",
              text: "When Green Acres later pays that bill:",
            },
            {
              type: "code",
              text: "Debit:  Accounts Payable ................ $200\nCredit:   Cash ........................... $200",
            },
            {
              type: "callout",
              text: "Same pattern as receivables, just on the other side: the expense is recorded when it's incurred, and the payable is cleared separately when cash actually goes out.",
            },
          ],
        },
        {
          heading: "Payroll Basics",
          blocks: [
            {
              type: "p",
              text: "Payroll is where a lot of new bookkeepers get nervous, because a single paycheck touches more than just \"Wages Expense\" and \"Cash\" — taxes get withheld and owed to the government too. We'll keep this at the beginner level: the core idea, not full tax-table mechanics.",
            },
            {
              type: "p",
              text: "For each employee paycheck, there are generally two pieces:",
            },
            {
              type: "list",
              ordered: true,
              items: [
                "**Gross wages** — what the employee earned before anything is withheld. This is the full Wages Expense to the business.",
                "**Withholdings** — amounts taken out of the employee's pay (like income tax or payroll tax) that the business doesn't get to keep — it's holding that money temporarily to pay to the government. Until it's paid over, it's a liability called **Payroll Taxes Payable**.",
              ],
            },
            {
              type: "p",
              text: "The employee only receives **net pay** — gross wages minus withholdings.",
            },
            {
              type: "p",
              text: "**Green Acres example:** A crew member earns $500 in gross wages for the week. $75 is withheld for payroll taxes. Green Acres pays the crew member $425 by direct deposit.",
            },
            {
              type: "code",
              text: "Debit:  Wages Expense .................... $500\nCredit:   Payroll Taxes Payable .......... $75\nCredit:   Cash ............................ $425",
            },
            {
              type: "p",
              text: "Notice the entry still balances: one debit of $500, two credits totaling $500 ($75 + $425). The full $500 is the real cost to the business (that's the Wages Expense), even though the employee only sees $425 land in their account — the other $75 is sitting as a liability until Green Acres sends it to the tax authorities.",
            },
            {
              type: "p",
              text: "When Green Acres later pays that $75 to the government:",
            },
            {
              type: "code",
              text: "Debit:  Payroll Taxes Payable ............. $75\nCredit:   Cash ............................. $75",
            },
            {
              type: "callout",
              text: "**The big takeaway:** payroll isn't one expense — it's an expense (the full gross wages) plus a liability (whatever was withheld but not yet paid out) that gets settled separately.",
            },
          ],
        },
        {
          heading: "Glossary",
          blocks: [
            {
              type: "list",
              items: [
                "**Accounts Receivable** — money owed to the business by customers for sales already made.",
                "**Accounts Payable** — money the business owes to others for expenses already incurred but not yet paid.",
                "**Gross wages** — an employee's total earnings before any withholdings.",
                "**Withholding** — money taken from an employee's pay that the business holds temporarily and owes to a third party (like a tax authority).",
                "**Net pay** — what an employee actually receives, after withholdings (gross wages minus withholdings).",
                "**Payroll Taxes Payable** — a liability account tracking withheld amounts the business still owes to the government.",
              ],
            },
          ],
        },
        {
          heading: "Practice Exercises",
          blocks: [
            {
              type: "p",
              text: "Write the journal entry for each of Green Acres Landscaping's transactions below.",
            },
            {
              type: "list",
              ordered: true,
              items: [
                "Green Acres mows a lawn for $60, paid in cash.",
                "Green Acres completes a $450 job for a client, to be invoiced and paid in 30 days.",
                "That same client pays their $450 invoice in full.",
                "Green Acres buys $90 of mulch and plants, paid immediately by debit card.",
                "Green Acres gets a $150 equipment repair done on credit, to be paid in 15 days.",
                "A crew member earns $400 in gross wages; $60 is withheld for payroll taxes, and $340 is paid by direct deposit.",
              ],
            },
            { type: "p", text: "**Answer Key**" },
            {
              type: "list",
              ordered: true,
              items: [
                "Debit Cash $60 / Credit Mowing Revenue $60",
                "Debit Accounts Receivable $450 / Credit Landscaping Revenue $450",
                "Debit Cash $450 / Credit Accounts Receivable $450",
                "Debit Supplies Expense $90 / Credit Cash $90",
                "Debit Repair Expense $150 / Credit Accounts Payable $150",
                "Debit Wages Expense $400 / Credit Payroll Taxes Payable $60 / Credit Cash $340",
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
                "Sales are recorded when earned — either as Cash (paid now) or Accounts Receivable (paid later).",
                "Expenses are recorded when incurred — either as Cash (paid now) or Accounts Payable (paid later).",
                "A paycheck is really two things: the full Wages Expense to the business, and a Payroll Taxes Payable liability for whatever was withheld.",
                "Employees only receive net pay; the business is on the hook for the full gross amount.",
              ],
            },
            {
              type: "callout",
              text: "Ready to practice? Head to the Day-to-Day Transactions exercise to record Green Acres' sales, expenses, and payroll yourself.",
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
          body: "Module 3: Day-to-Day Transactions\nSales, expenses, and payroll at Green Acres Landscaping",
        },
        {
          title: "Recording Sales: Cash vs. Credit",
          body: "- Cash sale: Cash ↑, Revenue ↑\n- Sale on credit: Accounts Receivable ↑, Revenue ↑ (cash comes later)\nExample: Green Acres' $75 cash mow vs. $600 invoiced landscaping job",
        },
        {
          title: "When the Invoice Gets Paid",
          body: "- Accounts Receivable is a placeholder for cash that's coming\n- When paid: Cash ↑, Accounts Receivable ↓\nExample: The $600 commercial client pays 30 days later",
        },
        {
          title: "Recording Expenses: Cash vs. Credit",
          body: "- Paid immediately: Expense ↑, Cash ↓\n- Billed later: Expense ↑, Accounts Payable ↑\nExample: $40 gas (cash) vs. $200 mower repair (on credit)",
        },
        {
          title: "Payroll: Gross Wages vs. Net Pay",
          body: "- Gross wages = full cost to the business (Wages Expense)\n- Withholdings = money held temporarily, owed to the government\n- Net pay = what the employee actually receives\nExample: $500 gross, $75 withheld, $425 direct deposit",
        },
        {
          title: "The Payroll Journal Entry",
          body: "Debit: Wages Expense $500\nCredit: Payroll Taxes Payable $75\nCredit: Cash $425\nStill balances: one $500 debit, two credits totaling $500",
        },
        {
          title: "Key Takeaways",
          body: "- Sales & expenses: cash now, or a receivable/payable for later\n- Payroll = an expense (gross wages) + a liability (withholdings)\n- Employees see net pay; the business is on the hook for the full gross amount",
        },
        {
          title: "What's Next",
          body: "- Practice: Day-to-Day Transactions exercise with Green Acres Landscaping\n- Coming in Module 4: Reconciliation & Reporting — bank reconciliation, the P&L, and the balance sheet",
        },
      ],
    },
  },
  {
    title: "Day-to-Day Transactions Practice",
    type: "exercise",
    orderIndex: 3,
    content: {
      exerciseType: "day-to-day",
      source: "day_to_day_transactions_exercise.html",
    },
  },
  {
    title: "Knowledge Check",
    type: "quiz",
    orderIndex: 4,
    content: {
      questions: [
        {
          question:
            "Green Acres mows a homeowner's lawn for $75, paid in cash. What is the correct journal entry?",
          options: [
            "Debit Cash $75 / Credit Mowing Revenue $75",
            "Debit Mowing Revenue $75 / Credit Cash $75",
            "Debit Cash $75 / Credit Accounts Payable $75",
            "Debit Accounts Receivable $75 / Credit Mowing Revenue $75",
          ],
          correctIndex: 0,
        },
        {
          question:
            "When a sale is made on credit (invoiced, paid later), which asset does the business record?",
          options: [
            "Accounts Payable",
            "Accounts Receivable",
            "Deferred Revenue",
            "Inventory",
          ],
          correctIndex: 1,
        },
        {
          question:
            "Green Acres gets a $200 mower repair done on credit, to be paid in 15 days. What is the correct entry?",
          options: [
            "Debit Repair Expense $200 / Credit Cash $200",
            "Debit Repair Expense $200 / Credit Accounts Payable $200",
            "Debit Accounts Payable $200 / Credit Repair Expense $200",
            "Debit Cash $200 / Credit Repair Expense $200",
          ],
          correctIndex: 1,
        },
        {
          question:
            "A crew member earns $500 in gross wages; $75 is withheld for payroll taxes, and $425 is paid by direct deposit. What is the correct entry?",
          options: [
            "Debit Wages Expense $425 / Credit Cash $425",
            "Debit Wages Expense $500 / Credit Payroll Taxes Payable $75 / Credit Cash $425",
            "Debit Wages Expense $500 / Credit Cash $500",
            "Debit Wages Expense $425 / Credit Payroll Taxes Payable $75 / Credit Cash $500",
          ],
          correctIndex: 1,
        },
        {
          question: "What is net pay?",
          options: [
            "Gross wages plus withholdings",
            "Gross wages minus withholdings",
            "The full cost of an employee to the business",
            "The amount the business owes the government",
          ],
          correctIndex: 1,
        },
        {
          question:
            "When Green Acres later pays the withheld $75 to the government, the entry is:",
          options: [
            "Debit Payroll Taxes Payable $75 / Credit Cash $75",
            "Debit Cash $75 / Credit Payroll Taxes Payable $75",
            "Debit Wages Expense $75 / Credit Cash $75",
            "Debit Payroll Taxes Payable $75 / Credit Wages Expense $75",
          ],
          correctIndex: 0,
        },
      ],
    },
  },
];

// ── Module 4: Reconciliation & Reporting ────────────────────────────────────

const MODULE_4_SLUG = "module-4-reconciliation-reporting";

const MODULE_4_LESSONS: LessonSeed[] = [
  {
    title: "Written Lesson",
    type: "written",
    orderIndex: 1,
    content: {
      sections: [
        {
          heading: "Welcome to Module 4",
          blocks: [
            {
              type: "p",
              text: "You've learned how to record transactions (Modules 1–3). Now it's time to check your work and turn it into something a business owner can actually read. This module covers three things: making sure your books match the bank's records, summarizing performance with a Profit & Loss statement, and summarizing financial position with a Balance Sheet. We're back with **Maria's Bakery** for this one.",
            },
          ],
        },
        {
          heading: "Bank Reconciliation",
          blocks: [
            {
              type: "p",
              text: "**Bank reconciliation** is the process of comparing your own cash records (your ledger) against your bank statement, to make sure they agree — and figuring out why, if they don't.",
            },
            {
              type: "p",
              text: "They almost never match exactly on any given day, and that's normal. The usual culprits:",
            },
            {
              type: "list",
              items: [
                "**Outstanding checks** — Maria wrote a check that hasn't been cashed yet. It's in her ledger as gone, but the bank hasn't processed it.",
                "**Deposits in transit** — Maria made a deposit that hasn't posted to the bank yet.",
                "**Bank fees or interest** — the bank charged a fee or paid interest that Maria hasn't recorded in her own books yet.",
                "**Errors** — a typo, a duplicate entry, or a transaction recorded on the wrong side.",
              ],
            },
            {
              type: "p",
              text: "**The reconciliation process, step by step:**",
            },
            {
              type: "list",
              ordered: true,
              items: [
                "Start with your ledger's ending cash balance.",
                "Start with the bank statement's ending balance.",
                "Adjust the bank balance for outstanding checks (subtract) and deposits in transit (add).",
                "Adjust your ledger balance for anything the bank caught that you hadn't recorded yet (bank fees, interest earned).",
                "The two adjusted numbers should now match.",
              ],
            },
            {
              type: "p",
              text: "**Maria's Bakery example:**",
            },
            {
              type: "p",
              text: "Maria's ledger shows a cash balance of **$2,150**. Her bank statement shows **$2,200**.",
            },
            {
              type: "list",
              items: [
                "She has a $75 check outstanding (written, not yet cashed).",
                "The bank statement shows a $25 monthly service fee she hadn't recorded yet.",
              ],
            },
            {
              type: "code",
              text: "Bank statement balance:          $2,200\n  Less: outstanding check          −$75\nAdjusted bank balance:            $2,125\n\nLedger balance:                  $2,150\n  Less: bank service fee           −$25\nAdjusted ledger balance:          $2,125",
            },
            {
              type: "p",
              text: "Both sides land on $2,125 — reconciled. Maria also needs to record that $25 bank fee in her own ledger now (Debit Bank Fee Expense $25 / Credit Cash $25), since that's a real transaction she hadn't captured yet.",
            },
            {
              type: "callout",
              text: "**Why it matters:** reconciliation is one of the best ways to catch errors and fraud early. If the numbers don't match and you can't explain why, something in the books needs a closer look.",
            },
          ],
        },
        {
          heading: "The Profit & Loss Statement (P&L)",
          blocks: [
            {
              type: "p",
              text: "The **Profit & Loss statement** (also called an income statement) shows whether a business made or lost money over a period of time — a month, a quarter, a year. It answers one core question: **Revenue minus Expenses equals what?**",
            },
            {
              type: "p",
              text: "**Revenue − Expenses = Net Income (or Net Loss)**",
            },
            {
              type: "p",
              text: "**Maria's Bakery example — P&L for the month of June:**",
            },
            {
              type: "table",
              headers: ["", ""],
              rows: [
                ["**Revenue**", ""],
                ["Bread & Pastry Sales", "$8,500"],
                ["Catering Revenue", "$2,000"],
                ["**Total Revenue**", "**$10,500**"],
                ["**Expenses**", ""],
                ["Ingredients (Cost of Goods Sold)", "$3,200"],
                ["Wages", "$2,800"],
                ["Rent", "$1,500"],
                ["Utilities", "$400"],
                ["Bank Fees", "$25"],
                ["**Total Expenses**", "**$7,925**"],
                ["**Net Income**", "**$2,575**"],
              ],
            },
            {
              type: "callout",
              text: "Every account on this statement comes straight from the general ledger — the P&L is really just Revenue and Expense account balances, organized and totaled for a specific time period. This is why getting the day-to-day bookkeeping right (Modules 1–3) matters so much: a wrong entry anywhere flows straight into this report.",
            },
          ],
        },
        {
          heading: "The Balance Sheet",
          blocks: [
            {
              type: "p",
              text: "The **Balance Sheet** is a snapshot — not of a period of time, but of a single moment. It shows what the business owns, owes, and is worth *as of* a specific date. It's the accounting equation, laid out as a report:",
            },
            {
              type: "p",
              text: "**Assets = Liabilities + Equity**",
            },
            {
              type: "p",
              text: "**Maria's Bakery example — Balance Sheet as of June 30:**",
            },
            {
              type: "table",
              headers: ["Assets", "", "Liabilities & Equity", ""],
              rows: [
                ["Cash", "$2,125", "Accounts Payable", "$600"],
                ["Accounts Receivable", "$400", "Loan Payable", "$8,500"],
                ["Inventory", "$850", "**Total Liabilities**", "**$9,100**"],
                ["Equipment", "$12,000", "", ""],
                ["**Total Assets**", "**$15,375**", "Maria's Equity", "$6,275"],
                ["", "", "**Total Liabilities + Equity**", "**$15,375**"],
              ],
            },
            {
              type: "p",
              text: "Notice Total Assets ($15,375) equals Total Liabilities + Equity ($15,375) — it has to, because this is just the accounting equation from Module 1, reported out. If it doesn't balance, there's an error somewhere in the books.",
            },
            {
              type: "p",
              text: "**How the P&L and Balance Sheet connect:** Net Income from the P&L flows into Equity on the Balance Sheet. Maria's profit for the month doesn't just disappear — it increases her stake in the business. This is the thread that ties every module in this course together: a transaction gets recorded (Modules 1–3), the books get checked (reconciliation), and the results get reported (P&L and Balance Sheet).",
            },
          ],
        },
        {
          heading: "Glossary",
          blocks: [
            {
              type: "list",
              items: [
                "**Bank reconciliation** — the process of comparing ledger cash records to a bank statement and resolving any differences.",
                "**Outstanding check** — a check written and recorded but not yet cashed by the recipient.",
                "**Deposit in transit** — a deposit made but not yet posted by the bank.",
                "**Profit & Loss statement (P&L)** — a report of revenue and expenses over a period of time, ending in net income or net loss.",
                "**Net income** — total revenue minus total expenses for a period (a net loss if expenses exceed revenue).",
                "**Balance sheet** — a snapshot of assets, liabilities, and equity as of a specific date.",
              ],
            },
          ],
        },
        {
          heading: "Practice Exercises",
          blocks: [
            {
              type: "p",
              text: "Try these on your own, then check the answer key below.",
            },
            {
              type: "list",
              ordered: true,
              items: [
                "Maria's ledger shows $1,800 in cash. Her bank statement shows $1,950. There's a $200 outstanding check and a $50 deposit in transit. Do these reconcile, and what's the adjusted balance?",
                "Using this data, calculate Net Income: Revenue $6,000, Ingredients $2,000, Wages $1,500, Rent $800.",
                "True or False: A Balance Sheet reports activity over a period of time, like a month.",
                "If Total Assets are $20,000 and Total Liabilities are $7,000, what is Equity?",
              ],
            },
            { type: "p", text: "**Answer Key**" },
            {
              type: "list",
              ordered: true,
              items: [
                "Adjusted bank balance: $1,950 − $200 (outstanding check) + $50 (deposit in transit) = $1,800. Adjusted ledger balance: $1,800 (nothing to adjust here). Both equal $1,800 — reconciled.",
                "Net Income = $6,000 − ($2,000 + $1,500 + $800) = $6,000 − $4,300 = **$1,700**",
                "**False** — a Balance Sheet is a snapshot as of a specific date, not a period. (That's what the P&L is for.)",
                "Equity = Assets − Liabilities = $20,000 − $7,000 = **$13,000**",
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
                "Bank reconciliation confirms your ledger and your bank statement agree, and catches errors early.",
                "The P&L shows performance over time: Revenue − Expenses = Net Income.",
                "The Balance Sheet shows position at a moment in time: Assets = Liabilities + Equity.",
                "Net Income flows into Equity — every module in this course ultimately feeds into these two reports.",
              ],
            },
            {
              type: "callout",
              text: "Ready to practice? Head to the Reconciliation & Reporting exercise to put it all together with Maria's Bakery.",
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
          body: "Module 4: Reconciliation & Reporting\nChecking the books and reporting on Maria's Bakery",
        },
        {
          title: "Bank Reconciliation",
          body: "- Comparing ledger cash to the bank statement\n- Common gaps: outstanding checks, deposits in transit, bank fees\nExample: Maria's $2,150 ledger vs. $2,200 bank statement → both adjust to $2,125",
        },
        {
          title: "The Reconciliation Process",
          body: "1. Start with ledger balance\n2. Start with bank balance\n3. Adjust bank for outstanding checks / deposits in transit\n4. Adjust ledger for anything the bank caught first (fees, interest)\n5. Confirm both sides match",
        },
        {
          title: "The Profit & Loss Statement",
          body: "- Revenue − Expenses = Net Income\n- Reports performance over a period of time\nVisual: Maria's June P&L — $10,500 revenue − $7,925 expenses = $2,575 net income",
        },
        {
          title: "The Balance Sheet",
          body: "- Assets = Liabilities + Equity — the accounting equation as a report\n- A snapshot as of one specific date\nVisual: Maria's June 30 balance sheet — $15,375 assets = $9,100 liabilities + $6,275 equity",
        },
        {
          title: "How the P&L and Balance Sheet Connect",
          body: "- Net Income flows into Equity\n- One month's profit becomes part of the owner's stake in the business\n- This is the thread tying every module together",
        },
        {
          title: "Key Takeaways",
          body: "- Reconciliation confirms the books match the bank, and catches errors early\n- P&L = performance over time\n- Balance Sheet = position at a moment in time\n- Net Income → Equity",
        },
        {
          title: "Course Wrap-Up",
          body: "- You've now covered: bookkeeping basics, core documents, day-to-day transactions, and reporting\n- Practice: Reconciliation & Reporting exercise with Maria's Bakery",
        },
      ],
    },
  },
  {
    title: "Reconciliation & Reporting Practice",
    type: "exercise",
    orderIndex: 3,
    content: {
      exerciseType: "reconciliation-reporting",
      source: "reconciliation_reporting_exercise.html",
    },
  },
  {
    title: "Knowledge Check",
    type: "quiz",
    orderIndex: 4,
    content: {
      questions: [
        {
          question: "What is a bank reconciliation?",
          options: [
            "Comparing your ledger's cash records to the bank statement and resolving any differences",
            "Opening a new bank account for the business",
            "Recording every sale in the general ledger",
            "Calculating net income for the month",
          ],
          correctIndex: 0,
        },
        {
          question:
            "Maria's ledger shows $1,800 in cash. Her bank statement shows $1,950. There's a $200 outstanding check and a $50 deposit in transit. What is the reconciled cash balance?",
          options: ["$1,800", "$1,950", "$2,150", "$1,600"],
          correctIndex: 0,
        },
        {
          question:
            "Which report shows whether a business made or lost money over a period of time?",
          options: [
            "Balance Sheet",
            "Profit & Loss Statement",
            "Bank Reconciliation",
            "Chart of Accounts",
          ],
          correctIndex: 1,
        },
        {
          question: "What is the formula for Net Income?",
          options: [
            "Assets − Liabilities",
            "Revenue − Expenses",
            "Cash in − Cash out",
            "Total debits − Total credits",
          ],
          correctIndex: 1,
        },
        {
          question: "What does a Balance Sheet show?",
          options: [
            "Revenue and expenses over a period of time",
            "A snapshot of what the business owns, owes, and is worth as of a specific date",
            "A chronological list of every transaction",
            "A comparison of the ledger to the bank statement",
          ],
          correctIndex: 1,
        },
        {
          question:
            "If Total Assets are $20,000 and Total Liabilities are $7,000, what is Equity?",
          options: ["$27,000", "$13,000", "$20,000", "$7,000"],
          correctIndex: 1,
        },
      ],
    },
  },
];

// ── All modules ─────────────────────────────────────────────────────────────

const MODULE_5_SLUG = "module-5-wrapping-up-a-period";
const MODULE_5_LESSONS: LessonSeed[] = [
  { title: "Written Lesson", type: "written", orderIndex: 1, content: { sections: [
    { heading: "The Month-End Close Checklist", blocks: [
      { type: "p", text: "Month-end close is the set of steps a business runs through at the end of every month to make sure the books are accurate and ready to report on. It is a sequence: skipping steps or doing them out of order is where errors creep in." },
      { type: "list", ordered: true, items: ["Record all outstanding transactions — every sale, expense, and payroll entry.", "Reconcile bank and credit card accounts against statements.", "Review accounts receivable and accounts payable.", "Check inventory, if applicable.", "Run the trial balance and confirm debits equal credits.", "Generate the P&L and Balance Sheet.", "Review reports for anything that looks off before calling the close done."] },
      { type: "p", text: "At the end of June, Maria confirms every invoice and receipt is entered, reconciles her bank account (catching the $25 fee), checks the $400 a wholesale client owes, verifies inventory, and confirms her trial balance: $18,200 debits = $18,200 credits." }
    ] },
    { heading: "Common Beginner Mistakes", blocks: [
      { type: "p", text: "Every transaction needs both a debit and a credit. Assets and Expenses increase with debits; Liabilities, Equity, and Revenue increase with credits." },
      { type: "list", items: ["Recording a transaction on only one side.", "Mixing up debit and credit rules for liabilities and revenue.", "Forgetting non-cash events such as bank fees, interest, and depreciation.", "Confusing cash basis and accrual basis by applying them inconsistently.", "Not reconciling regularly — monthly checks keep errors small and explainable.", "Treating a balanced trial balance as proof the books are correct. Wrong-account entries can still balance."] },
      { type: "callout", text: "A trial balance is necessary, but not sufficient: it catches unequal debits and credits, not a correct-looking entry posted to the wrong account." },
      { type: "p", text: "Maria once recorded a $150 catering payment only as a credit to Revenue, forgetting the debit to Cash. Her trial balance did not balance — exactly the kind of error the close checklist should catch." }
    ] },
    { heading: "Glossary", blocks: [{ type: "list", items: ["Month-end close — the routine sequence used to ensure books are accurate before reporting.", "Single-sided entry — recording only a debit or only a credit instead of both.", "Depreciation — gradual recognition of an asset's cost as an expense over its useful life."] }] },
    { heading: "Practice Exercises and Answer Key", blocks: [
      { type: "list", ordered: true, items: ["Put these steps in order: generate reports, reconcile bank, record outstanding transactions, run trial balance.", "Debits are $12,400 and credits $12,250. What does this tell Maria?", "True or False: a balanced trial balance guarantees error-free books.", "Would posting a $75 supply purchase to Repair Expense instead cause an imbalance?"] },
      { type: "list", ordered: true, items: ["Record → Reconcile → Trial balance → Generate reports.", "There is a $150 discrepancy to find and correct.", "False — wrong-account entries can still balance.", "No. Both are expense accounts, so the trial balance balances, but the P&L categories are wrong."] }
    ] },
    { heading: "Key Takeaways", blocks: [{ type: "list", items: ["Month-end close is a routine, not a single action.", "The trial balance catches unbalanced entries, not wrong-account entries.", "Most mistakes are missing sides, flipped debit/credit rules, or skipped reconciliation.", "A consistent monthly close keeps books trustworthy over time."] }] }
  ] } },
  { title: "Slide Overview", type: "slides", orderIndex: 2, content: { slides: [
    { title: "Wrapping Up a Period", body: "Bookkeeping Basics\nClosing out the month with Maria's Bakery" },
    { title: "The Month-End Close Checklist", body: "1. Record transactions\n2. Reconcile accounts\n3. Review A/R and A/P\n4. Check inventory\n5. Run trial balance\n6. Generate P&L and Balance Sheet\n7. Review reports" },
    { title: "Maria's June Close", body: "Invoices and receipts entered\nBank reconciliation catches the $25 fee\nWholesale client still owes $400\nTrial balance: $18,200 = $18,200 ✓" },
    { title: "Mistakes #1 and #2", body: "Every transaction needs a debit and credit\nAssets/Expenses increase with debits\nLiabilities/Equity/Revenue increase with credits" },
    { title: "Mistakes #3 and #4", body: "Do not forget bank fees, interest, or depreciation\nApply cash or accrual basis consistently" },
    { title: "Mistakes #5 and #6", body: "Reconcile monthly\nA balanced trial balance does not mean error-free books" },
    { title: "Key Takeaways", body: "Close is a routine\nTrial balance does not catch wrong-account entries\nReview, reconcile, and apply debit/credit rules carefully" },
    { title: "Course Complete", body: "Foundations, documents, transactions, reporting, and closing\nPractice with Maria's Bakery\nCongratulations!" }
  ] } },
  { title: "Month-End Close Exercise", type: "exercise", orderIndex: 3, content: { exerciseType: "month-end-close" } },
  { title: "Module 5 Quiz", type: "quiz", orderIndex: 4, content: { questions: [
    { question: "What comes before running the trial balance?", options: ["Generate reports", "Reconcile accounts", "Close the books permanently", "Delete old entries"], correctIndex: 1 },
    { question: "A trial balance has debits of $12,400 and credits of $12,250. What is true?", options: ["It is balanced", "There is a $150 discrepancy", "Credits are optional", "The P&L is ready"], correctIndex: 1 },
    { question: "A balanced trial balance guarantees no bookkeeping errors.", options: ["True", "False"], correctIndex: 1 },
    { question: "Which is a non-cash event that can be missed?", options: ["A bank fee", "A cash sale", "A cash withdrawal", "A cash purchase"], correctIndex: 0 },
    { question: "Posting a supply purchase to Repair Expense will usually:", options: ["Unbalance the trial balance", "Still balance but misstate expense categories", "Erase the transaction", "Increase revenue"], correctIndex: 1 }
  ] } }
];

const MODULES: ModuleSeed[] = [
  {
    title: "Module 1: Bookkeeping Foundations",
    slug: MODULE_1_SLUG,
    description:
      "Covers bookkeeping vs. accounting, the accounting equation, debits/credits, T-accounts, cash vs. accrual basis, and includes a glossary and practice exercises.",
    orderIndex: 1,
    dripDelayDays: 0,
    lessons: MODULE_1_LESSONS,
  },
  {
    title: "Module 2: The Core Documents",
    slug: MODULE_2_SLUG,
    description:
      "Covers the four core documents of bookkeeping — the chart of accounts, general ledger, journal entries, and trial balance — following Diego's Bike Shop through its books.",
    orderIndex: 2,
    dripDelayDays: 0,
    lessons: MODULE_2_LESSONS,
  },
  {
    title: "Module 3: Day-to-Day Transactions",
    slug: MODULE_3_SLUG,
    description:
      "Applies the mechanics to everyday transactions — recording sales, expenses, and payroll basics — following Green Acres Landscaping, including a glossary, practice exercises, and an interactive journal entry exercise.",
    orderIndex: 3,
    dripDelayDays: 0,
    lessons: MODULE_3_LESSONS,
  },
  {
    title: "Module 4: Reconciliation & Reporting",
    slug: MODULE_4_SLUG,
    description: "Covers bank reconciliation, the Profit & Loss statement, and the Balance Sheet — checking the books and reporting results, following Maria's Bakery, including a glossary, practice exercises, and an interactive reconciliation exercise.",
    orderIndex: 4,
    dripDelayDays: 0,
    lessons: MODULE_4_LESSONS,
  },
  { title: "Module 5: Wrapping Up a Period", slug: MODULE_5_SLUG, description: "Build a reliable month-end close routine and spot common bookkeeping mistakes.", orderIndex: 5, dripDelayDays: 0, lessons: MODULE_5_LESSONS },
];

// ── Seed logic (idempotent upsert) ──────────────────────────────────────────

async function seedModule(moduleSeed: ModuleSeed) {
  console.log(`Seeding ${moduleSeed.title}...`);

  // Find or create the module
  let [mod] = await db
    .select()
    .from(modules)
    .where(eq(modules.slug, moduleSeed.slug))
    .limit(1);

  if (!mod) {
    [mod] = await db
      .insert(modules)
      .values({
        title: moduleSeed.title,
        slug: moduleSeed.slug,
        description: moduleSeed.description,
        orderIndex: moduleSeed.orderIndex,
        dripDelayDays: moduleSeed.dripDelayDays,
      })
      .returning();
    console.log(`Created module: ${mod.title} (id=${mod.id})`);
  } else {
    console.log(`Found existing module: ${mod.title} (id=${mod.id})`);
  }

  // Upsert lessons by (moduleId, orderIndex)
  for (const lesson of moduleSeed.lessons) {
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
}

async function seed() {
  console.log("Seeding course content...");
  for (const moduleSeed of MODULES) {
    await seedModule(moduleSeed);
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
