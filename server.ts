import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import { students } from './src/db/schema.ts';
import { eq } from 'drizzle-orm';
import { ALLOWED_ROLL_NUMBERS } from './constants.ts';
import { createEmptyProfile } from './studentService.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON request body parser with larger limits for base64 images/files
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Helper to seed students if the table is empty
  async function ensureSeeded() {
    try {
      const existing = await db.select().from(students);
      if (existing.length === 0) {
        console.log('Database empty. Seeding default student profiles...');
        for (const [roll, name] of Object.entries(ALLOWED_ROLL_NUMBERS)) {
          const profile = createEmptyProfile(roll, name);
          await db.insert(students).values({
            id: profile.id,
            rollNumber: profile.rollNumber,
            fullName: profile.fullName,
            profileData: profile
          });
        }
        console.log('Seeding completed successfully!');
      }
    } catch (error) {
      console.error('Error during seeding:', error);
    }
  }

  // Trigger seeding
  await ensureSeeded();

  // Get all students
  app.get('/api/students', async (req, res) => {
    try {
      const allStudents = await db.select().from(students);
      // Map back to StudentProfile objects
      const profiles = allStudents.map(s => s.profileData as any);
      res.json(profiles);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      res.status(500).json({ error: 'Database query failed' });
    }
  });

  // Get single student by roll number
  app.get('/api/students/:rollNumber', async (req, res) => {
    const { rollNumber } = req.params;
    try {
      const result = await db.select().from(students).where(eq(students.rollNumber, rollNumber));
      if (result.length > 0) {
        return res.json(result[0].profileData);
      }

      // If not found in DB, check if they are in ALLOWED_ROLL_NUMBERS
      const name = ALLOWED_ROLL_NUMBERS[rollNumber];
      if (name) {
        // Create on the fly, save to DB, and return
        const profile = createEmptyProfile(rollNumber, name);
        await db.insert(students).values({
          id: profile.id,
          rollNumber: profile.rollNumber,
          fullName: profile.fullName,
          profileData: profile
        });
        return res.json(profile);
      }

      res.status(404).json({ error: 'Student not found' });
    } catch (error: any) {
      console.error('Error fetching student:', error);
      res.status(500).json({ error: 'Database query failed' });
    }
  });

  // Save student profile (upsert)
  app.post('/api/students', async (req, res) => {
    const profile = req.body;
    if (!profile || !profile.id || !profile.rollNumber || !profile.fullName) {
      return res.status(400).json({ error: 'Invalid profile payload' });
    }

    try {
      await db.insert(students)
        .values({
          id: profile.id,
          rollNumber: profile.rollNumber,
          fullName: profile.fullName,
          profileData: profile
        })
        .onConflictDoUpdate({
          target: students.rollNumber,
          set: {
            fullName: profile.fullName,
            profileData: profile
          }
        });
      res.json({ success: true, profile });
    } catch (error: any) {
      console.error('Error saving student:', error);
      res.status(500).json({ error: 'Failed to save student profile' });
    }
  });

  // Delete student profile
  app.delete('/api/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await db.delete(students).where(eq(students.id, id));
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting student:', error);
      res.status(500).json({ error: 'Failed to delete student' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
