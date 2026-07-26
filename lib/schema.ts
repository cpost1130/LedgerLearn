import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

// ── students ── extends Clerk users
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email").notNull(),
  name: text("name"),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
});

// ── modules ── course modules
export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull(),
  dripDelayDays: integer("drip_delay_days").default(0).notNull(),
});

// ── lessons ── content within a module
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id")
    .notNull()
    .references(() => modules.id),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'written', 'slides', 'exercise', 'quiz'
  content: jsonb("content"),
  orderIndex: integer("order_index").notNull(),
});

// ── progress ── tracks student completion
export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id),
  lessonId: integer("lesson_id")
    .notNull()
    .references(() => lessons.id),
  completed: boolean("completed").default(false).notNull(),
  score: integer("score"),
  completedAt: timestamp("completed_at"),
});

// ── purchases ── payment records
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id),
  stripeSessionId: text("stripe_session_id").unique(),
  type: text("type").notNull(), // 'one_time', 'subscription'
  status: text("status").notNull(), // 'active', 'canceled', 'expired'
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});
