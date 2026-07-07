import mongoose from "mongoose";
import { DATABASE_URI, DATABASE_NAME } from "@/config/env";
import { logger } from "../../../utils/logger";

export class DatabaseService {
  private databaseUri: string;
  private databaseName: string;

  constructor() {
    this.databaseUri = DATABASE_URI;
    this.databaseName = DATABASE_NAME;
  }

  private getMongoUri(): string {
    return `${this.databaseUri}/${this.databaseName}`;
  }

  async connect(): Promise<void> {
    logger.info("Connecting to MongoDB...");
    const startTime = Date.now();
    const timer = setInterval(() => {
      const seconds = Math.round((Date.now() - startTime) / 1000);
      logger.info(`Connecting to MongoDB... (${seconds}s elapsed)`);
    }, 1000);

    try {
      const mongoUri = this.getMongoUri();
      await mongoose.connect(mongoUri);
      clearInterval(timer);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      logger.info(`✓ MongoDB connected to ${this.databaseName} (took ${elapsed}s)`);
    } catch (error) {
      clearInterval(timer);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      logger.error(`✗ MongoDB connection failed after ${elapsed}s: ${(error as Error).message}`);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      logger.info("✓ MongoDB disconnected");
    } catch (error) {
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await mongoose.connection.db?.admin().ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  getConfig(): { uri: string; name: string; fullUri: string } {
    return {
      uri: this.databaseUri,
      name: this.databaseName,
      fullUri: this.getMongoUri(),
    };
  }
}
