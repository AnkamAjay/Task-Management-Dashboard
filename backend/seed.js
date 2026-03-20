import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Task from './models/Task.js';

// Setup file paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config();

const seedDatabase = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Read local db.json
    const dbJsonPath = path.join(__dirname, '../db.json');
    const dbData = JSON.parse(fs.readFileSync(dbJsonPath, 'utf-8'));
    const oldTasks = dbData.tasks || [];

    // 3. Drop existing tasks (Idempotent action)
    await Task.deleteMany({});
    console.log('🗑️  Cleared existing tasks from MongoDB');

    // 4. Map to new Schema
    const newTasks = oldTasks.map(task => {
      // Create a clean object mapping exactly what we need
      const mappedTask = {
        taskName: task.taskName,
        assignedTo: task.assignedTo,
        startDateTime: task.startDateTime,
        deadline: task.deadline,
        endTime: task.endTime || null,
        priority: task.priority,
        status: 'Not Started', // Forced to Not Started as per requirements
        notes: task.notes && task.notes.fileName ? task.notes : undefined,
      };

      // Since the Schema has 'createdBy: { required: true }', storing null will throw a validation error.
      // We are creating a dummy random ObjectId so the database accepts it without breaking the Schema rules,
      // while technically keeping it orphaned/null from any real user.
      mappedTask.createdBy = new mongoose.Types.ObjectId(); 

      return mappedTask;
    });

    // 5. Insert mapped tasks
    await Task.insertMany(newTasks);
    
    console.log(`✅ Success! Inserted ${newTasks.length} tasks into MongoDB.`);

    // 6. Disconnect & Exit cleanly
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
