import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const physicians = pgTable("physicians", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  specialty: text("specialty").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),
  officeHours: text("office_hours"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  physicianId: varchar("physician_id").notNull().references(() => physicians.id),
  date: text("date").notNull(), // YYYY-MM-DD format
  time: text("time").notNull(), // HH:MM format
  type: text("type").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const reminders = pgTable("reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  appointmentId: varchar("appointment_id").notNull().references(() => appointments.id),
  reminderDate: timestamp("reminder_date").notNull(),
  message: text("message"),
  sent: text("sent").notNull().default("false"), // boolean as text
  createdAt: timestamp("created_at").defaultNow(),
});

export const patientPrintProfile = pgTable("patient_print_profile", {
  userId: bigint("user_id", { mode: "number" }).primaryKey(),
  fullName: text("full_name").notNull().default(""),
  dob: text("dob").notNull().default(""),
  allergies: text("allergies").notNull().default(""),
  emergencyContact: text("emergency_contact").notNull().default(""),
  pharmacy: text("pharmacy").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPhysicianSchema = createInsertSchema(physicians).omit({
  id: true,
  createdAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
  createdAt: true,
});

export const insertPatientPrintProfileSchema = createInsertSchema(patientPrintProfile).omit({
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Physician = typeof physicians.$inferSelect;
export type InsertPhysician = z.infer<typeof insertPhysicianSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;

export type PatientPrintProfile = typeof patientPrintProfile.$inferSelect;
export type InsertPatientPrintProfile = z.infer<typeof insertPatientPrintProfileSchema>;
