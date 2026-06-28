import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const students = pgTable('students', {
  id: text('id').primaryKey(),
  rollNumber: text('roll_number').notNull().unique(),
  fullName: text('full_name').notNull(),
  profileData: jsonb('profile_data').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
