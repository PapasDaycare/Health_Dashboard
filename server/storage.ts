import { type User, type InsertUser, type Physician, type InsertPhysician, type Appointment, type InsertAppointment, type Reminder, type InsertReminder } from "@shared/schema";
import { randomUUID } from "crypto";
import { pool } from "./db";

export type Medication = {
  id: string;
  userId: string;
  name: string;
  dose: string;
  frequency: string;
  reason: string | null;
  notes: string | null;
  showOnPrint: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertMedication = {
  userId: string;
  name: string;
  dose: string;
  frequency: string;
  reason: string | null;
  notes: string | null;
  showOnPrint: boolean;
};

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Physician methods
  getPhysician(id: string): Promise<Physician | undefined>;
  getPhysiciansByUser(userId: string): Promise<Physician[]>;
  createPhysician(physician: InsertPhysician): Promise<Physician>;
  updatePhysician(id: string, physician: Partial<Physician>): Promise<Physician | undefined>;
  deletePhysician(id: string): Promise<boolean>;

  // Appointment methods
  getAppointment(id: string): Promise<Appointment | undefined>;
  getAppointmentsByUser(userId: string): Promise<Appointment[]>;
  getUpcomingAppointments(userId: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: Partial<Appointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: string): Promise<boolean>;

  // Reminder methods
  getReminder(id: string): Promise<Reminder | undefined>;
  getRemindersByUser(userId: string): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: string, reminder: Partial<Reminder>): Promise<Reminder | undefined>;
  deleteReminder(id: string): Promise<boolean>;

  // Medication methods
  getMedication(id: string): Promise<Medication | undefined>;
  getMedicationsByUser(userId: string): Promise<Medication[]>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: string, medication: Partial<Medication>): Promise<Medication | undefined>;
  deleteMedication(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private physicians: Map<string, Physician>;
  private appointments: Map<string, Appointment>;
  private reminders: Map<string, Reminder>;
  private medications: Map<string, Medication>;

  constructor() {
    this.users = new Map();
    this.physicians = new Map();
    this.appointments = new Map();
    this.reminders = new Map();
    this.medications = new Map();
    
    // Seed demo data in any environment (Render is production, otherwise no demo user exists)
    this.initializeSampleData().catch(console.error);
  }

  private async initializeSampleData() {
    // Prevent duplicate seeding
    const existingDemo = Array.from(this.users.values()).find(u => u.username === "demo");
    if (existingDemo) return;

    // Create demo user directly
    const demoUser: User = {
      id: "demo-user-id",
      username: "demo",
      password: "password",
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      createdAt: new Date()
    };
    this.users.set(demoUser.id, demoUser);

    // Create sample physicians using the create method
    const physician1 = await this.createPhysician({
      userId: "demo-user-id",
      firstName: "Sarah",
      lastName: "Johnson",
      specialty: "Cardiology",
      phone: "(555) 123-4567",
      email: "dr.johnson@healthcare.com",
      address: "123 Medical Center Dr, Suite 200\nNew York, NY 10001",
      officeHours: "Monday - Friday: 9:00 AM - 5:00 PM\nSaturday: 9:00 AM - 1:00 PM"
    });

    const physician2 = await this.createPhysician({
      userId: "demo-user-id",
      firstName: "Michael",
      lastName: "Chen",
      specialty: "Family Medicine",
      phone: "(555) 234-5678",
      email: "dr.chen@familycare.com",
      address: "456 Health Plaza, Floor 3\nNew York, NY 10002",
      officeHours: "Monday - Friday: 8:00 AM - 6:00 PM\nSaturday: 10:00 AM - 2:00 PM"
    });

    await this.createPhysician({
      userId: "demo-user-id",
      firstName: "Emily",
      lastName: "Rodriguez",
      specialty: "Dermatology",
      phone: "(555) 345-6789",
      email: "dr.rodriguez@skincare.com",
      address: "789 Wellness Blvd, Suite 150\nNew York, NY 10003",
      officeHours: "Tuesday - Saturday: 10:00 AM - 4:00 PM"
    });

    // Create sample appointments using the create method
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    await this.createAppointment({
      userId: "demo-user-id",
      physicianId: physician1.id,
      date: tomorrow.toISOString().split('T')[0],
      time: "10:00",
      type: "checkup",
      notes: "Annual cardiovascular checkup",
      status: "scheduled"
    });

    await this.createAppointment({
      userId: "demo-user-id",
      physicianId: physician2.id,
      date: nextWeek.toISOString().split('T')[0],
      time: "14:30",
      type: "consultation",
      notes: "Follow-up on recent lab results",
      status: "scheduled"
    });

    await this.createMedication({
      userId: "demo-user-id",
      name: "Lisinopril",
      dose: "10 mg",
      frequency: "Once daily",
      reason: "Blood pressure",
      notes: null,
      showOnPrint: true,
    });

    await this.createMedication({
      userId: "demo-user-id",
      name: "Metformin",
      dose: "500 mg",
      frequency: "Twice daily",
      reason: "Diabetes",
      notes: null,
      showOnPrint: true,
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email ?? null,
      firstName: insertUser.firstName ?? null,
      lastName: insertUser.lastName ?? null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Physician methods
  async getPhysician(id: string): Promise<Physician | undefined> {
    return this.physicians.get(id);
  }

  async getPhysiciansByUser(userId: string): Promise<Physician[]> {
    return Array.from(this.physicians.values()).filter(
      (physician) => physician.userId === userId,
    );
  }

  async createPhysician(insertPhysician: InsertPhysician): Promise<Physician> {
    const id = randomUUID();
    const physician: Physician = { 
      id,
      userId: insertPhysician.userId,
      firstName: insertPhysician.firstName,
      lastName: insertPhysician.lastName,
      specialty: insertPhysician.specialty,
      phone: insertPhysician.phone,
      email: insertPhysician.email ?? null,
      address: insertPhysician.address ?? null,
      officeHours: insertPhysician.officeHours ?? null,
      createdAt: new Date(),
    };
    this.physicians.set(id, physician);
    return physician;
  }

  async updatePhysician(id: string, updates: Partial<Physician>): Promise<Physician | undefined> {
    const physician = this.physicians.get(id);
    if (!physician) return undefined;
    
    const updated = { ...physician, ...updates };
    this.physicians.set(id, updated);
    return updated;
  }

  async deletePhysician(id: string): Promise<boolean> {
    return this.physicians.delete(id);
  }

  // Appointment methods
  async getAppointment(id: string): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointmentsByUser(userId: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.userId === userId,
    );
  }

  async getUpcomingAppointments(userId: string): Promise<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];
    return Array.from(this.appointments.values())
      .filter((appointment) => 
        appointment.userId === userId && 
        appointment.date >= today &&
        appointment.status === 'scheduled'
      )
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = randomUUID();
    const appointment: Appointment = { 
      id,
      userId: insertAppointment.userId,
      physicianId: insertAppointment.physicianId,
      date: insertAppointment.date,
      time: insertAppointment.time,
      type: insertAppointment.type,
      notes: insertAppointment.notes ?? null,
      status: insertAppointment.status ?? "scheduled",
      createdAt: new Date(),
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updated = { ...appointment, ...updates };
    this.appointments.set(id, updated);
    return updated;
  }

  async deleteAppointment(id: string): Promise<boolean> {
    return this.appointments.delete(id);
  }

  // Reminder methods
  async getReminder(id: string): Promise<Reminder | undefined> {
    return this.reminders.get(id);
  }

  async getRemindersByUser(userId: string): Promise<Reminder[]> {
    return Array.from(this.reminders.values()).filter(
      (reminder) => reminder.userId === userId,
    );
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const id = randomUUID();
    const reminder: Reminder = { 
      id,
      userId: insertReminder.userId,
      appointmentId: insertReminder.appointmentId,
      reminderDate: insertReminder.reminderDate,
      message: insertReminder.message ?? null,
      sent: insertReminder.sent ?? "false",
      createdAt: new Date(),
    };
    this.reminders.set(id, reminder);
    return reminder;
  }

  async updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder | undefined> {
    const reminder = this.reminders.get(id);
    if (!reminder) return undefined;
    
    const updated = { ...reminder, ...updates };
    this.reminders.set(id, updated);
    return updated;
  }

  async deleteReminder(id: string): Promise<boolean> {
    return this.reminders.delete(id);
  }

  // Medication methods
  async getMedication(id: string): Promise<Medication | undefined> {
    return this.medications.get(id);
  }

  async getMedicationsByUser(userId: string): Promise<Medication[]> {
    return Array.from(this.medications.values())
      .filter((medication) => medication.userId === userId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async createMedication(insertMedication: InsertMedication): Promise<Medication> {
    const id = randomUUID();
    const now = new Date();
    const medication: Medication = {
      ...insertMedication,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.medications.set(id, medication);
    return medication;
  }

  async updateMedication(id: string, updates: Partial<Medication>): Promise<Medication | undefined> {
    const medication = this.medications.get(id);
    if (!medication) {
      return undefined;
    }

    const updated: Medication = {
      ...medication,
      ...updates,
      id: medication.id,
      userId: medication.userId,
      updatedAt: new Date(),
    };
    this.medications.set(id, updated);
    return updated;
  }

  async deleteMedication(id: string): Promise<boolean> {
    return this.medications.delete(id);
  }
}

export class PgStorage extends MemStorage {
  // Users are stored in Postgres (others still use MemStorage for now)
  async getUser(id: string) {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1 LIMIT 1", [id]);
    return rows[0];
  }

  async getUserByUsername(username: string) {
    const { rows } = await pool.query("SELECT * FROM users WHERE username = $1 LIMIT 1", [username]);
    return rows[0];
  }

  async createUser(insertUser: any) {
    const { username, password, role, email, firstName, lastName } = insertUser;

    const { rows } = await pool.query(
      "INSERT INTO users (username, password, email, first_name, last_name) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [username, password, email ?? null, firstName ?? null, lastName ?? null]
    );

    return rows[0];
  }
}

export const storage = process.env.DATABASE_URL ? new PgStorage() : new MemStorage();
