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
    try {
      const mongoUri = this.getMongoUri();
      await mongoose.connect(mongoUri);
      logger.info(`✓ MongoDB connected to ${this.databaseName}`);
    } catch (error) {
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
