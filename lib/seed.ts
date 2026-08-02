import { db } from "./db";
import { modules, lessons } from "./schema";
import { and, eq } from "drizzle-orm";

/**
 * Seed / refresh course content (Modules 1 & 2).
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

// ── All modules ─────────────────────────────────────────────────────────────

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
