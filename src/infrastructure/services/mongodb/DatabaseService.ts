import mongoose from "mongoose";

export class DatabaseService {
  private databaseUri: string;
  private databaseName: string;

  constructor() {
    this.databaseUri = process.env.DATABASE_URI!;
    this.databaseName = process.env.DATABASE_NAME!;
  }

  private getMongoUri(): string {
    return `${this.databaseUri}/${this.databaseName}`;
  }

  async connect(): Promise<void> {
    try {
      const mongoUri = this.getMongoUri();
      await mongoose.connect(mongoUri);
      console.log(`✓ MongoDB connected to ${this.databaseName}`);
    } catch (error) {
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      console.log("✓ MongoDB disconnected");
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
