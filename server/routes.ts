import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPhysicianSchema, insertAppointmentSchema, insertReminderSchema } from "@shared/schema";
import { z } from "zod";
import { getSessionUserId } from "./auth";

const getUserId = (req: Request): string => {
  return getSessionUserId(req);
};

export async function registerRoutes(app: Express): Promise<Server> {
  const medicationCreateSchema = z.object({
    name: z.string().min(1),
    dose: z.string().min(1),
    frequency: z.string().min(1),
    reason: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    showOnPrint: z.boolean().default(true),
  });

  const medicationUpdateSchema = z.object({
    name: z.string().min(1).optional(),
    dose: z.string().min(1).optional(),
    frequency: z.string().min(1).optional(),
    reason: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    showOnPrint: z.boolean().optional(),
  });

  const togglePrintSchema = z.object({
    showOnPrint: z.boolean(),
  });

  // Medications routes
  app.get("/api/medications", async (req, res) => {
    try {
      const userId = getUserId(req);
      const medications = await storage.getMedicationsByUser(userId);
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medications" });
    }
  });

  app.get("/api/medications/:id", async (req, res) => {
    try {
      const userId = getUserId(req);
      const medication = await storage.getMedication(req.params.id);
      if (!medication || medication.userId !== userId) {
        return res.status(404).json({ message: "Medication not found" });
      }
      res.json(medication);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medication" });
    }
  });

  app.post("/api/medications", async (req, res) => {
    try {
      const userId = getUserId(req);
      const validatedData = medicationCreateSchema.parse(req.body);
      const medication = await storage.createMedication({
        userId,
        ...validatedData,
        reason: validatedData.reason ?? null,
        notes: validatedData.notes ?? null,
      });
      res.status(201).json(medication);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create medication" });
    }
  });

  app.put("/api/medications/:id", async (req, res) => {
    try {
      const userId = getUserId(req);
      const existing = await storage.getMedication(req.params.id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ message: "Medication not found" });
      }

      const updates = medicationUpdateSchema.parse(req.body);
      const medication = await storage.updateMedication(req.params.id, updates);
      res.json(medication);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update medication" });
    }
  });

  app.patch("/api/medications/:id/print", async (req, res) => {
    try {
      const userId = getUserId(req);
      const existing = await storage.getMedication(req.params.id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ message: "Medication not found" });
      }

      const { showOnPrint } = togglePrintSchema.parse(req.body);
      const medication = await storage.updateMedication(req.params.id, { showOnPrint });
      res.json(medication);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update print setting" });
    }
  });

  app.delete("/api/medications/:id", async (req, res) => {
    try {
      const userId = getUserId(req);
      const existing = await storage.getMedication(req.params.id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ message: "Medication not found" });
      }

      await storage.deleteMedication(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete medication" });
    }
  });

  // Physicians routes
  app.get("/api/physicians", async (req, res) => {
    try {
      const userId = getUserId(req);const physicians = await storage.getPhysiciansByUser(userId);
      res.json(physicians);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch physicians" });
    }
  });

  app.post("/api/physicians", async (req, res) => {
    try {
      const userId = getUserId(req);const validatedData = insertPhysicianSchema.parse({
        ...req.body,
        userId,
      });
      const physician = await storage.createPhysician(validatedData);
      res.status(201).json(physician);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create physician" });
    }
  });

  app.put("/api/physicians/:id", async (req, res) => {
    try {
      const userId = getUserId(req);const { id } = req.params;
      const existing = await storage.getPhysician(id);
      if (!existing) {
        return res.status(404).json({ message: "Physician not found" });
      }const { userId: _ignored, ...updates } = req.body;
      const physician = await storage.updatePhysician(id, updates);

      res.json(physician);
    } catch (error) {
      res.status(500).json({ message: "Failed to update physician" });
    }
  });

  app.delete("/api/physicians/:id", async (req, res) => {
    try {
      const userId = getUserId(req);const { id } = req.params;
      const existing = await storage.getPhysician(id);
      if (!existing) {
        return res.status(404).json({ message: "Physician not found" });
      }const deleted = await storage.deletePhysician(id);

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete physician" });
    }
  });

  // Appointments routes
  app.get("/api/appointments", async (req, res) => {
    try {
      const userId = getUserId(req);const appointments = await storage.getAppointmentsByUser(userId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get("/api/appointments/upcoming", async (req, res) => {
    try {
      const userId = getUserId(req);const appointments = await storage.getUpcomingAppointments(userId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming appointments" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const userId = getUserId(req);const validatedData = insertAppointmentSchema.parse({
        ...req.body,
        userId,
      });
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.put("/api/appointments/:id", async (req, res) => {
    try {
      const userId = getUserId(req);const { id } = req.params;
      const existing = await storage.getAppointment(id);
      if (!existing) {
        return res.status(404).json({ message: "Appointment not found" });
      }const { userId: _ignored, ...updates } = req.body;
      const appointment = await storage.updateAppointment(id, updates);

      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      const userId = getUserId(req);const { id } = req.params;
      const existing = await storage.getAppointment(id);
      if (!existing) {
        return res.status(404).json({ message: "Appointment not found" });
      }const deleted = await storage.deleteAppointment(id);

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });

  // Reminders routes
  app.get("/api/reminders", async (req, res) => {
    try {
      const userId = getUserId(req);const reminders = await storage.getRemindersByUser(userId);
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });

  app.post("/api/reminders", async (req, res) => {
    try {
      const userId = getUserId(req);const validatedData = insertReminderSchema.parse({
        ...req.body,
        userId,
      });
      const reminder = await storage.createReminder(validatedData);
      res.status(201).json(reminder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create reminder" });
    }
  });

  // Stats endpoint for dashboard
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const userId = getUserId(req);const physicians = await storage.getPhysiciansByUser(userId);
      const upcomingAppointments = await storage.getUpcomingAppointments(userId);
      const reminders = await storage.getRemindersByUser(userId);
      
      // Calculate monthly appointments
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
      const allAppointments = await storage.getAppointmentsByUser(userId);
      const monthlyAppointments = allAppointments.filter(apt => 
        apt.date.startsWith(currentMonth)
      );
      
      const stats = {
        totalPhysicians: physicians.length,
        upcomingAppointments: upcomingAppointments.length,
        pendingReminders: reminders.filter(r => r.sent === "false").length,
        monthlyAppointments: monthlyAppointments.length,
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
