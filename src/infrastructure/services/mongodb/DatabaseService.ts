import mongoose from 'mongoose';

// Database Service - handles all MongoDB configuration and connection
export class DatabaseService {
  private databaseUri: string;
  private databaseName: string;

  constructor() {
    // Load database configuration from environment
    this.databaseUri = process.env.DATABASE_URI || 'mongodb://localhost:27017';
    this.databaseName = process.env.DATABASE_NAME || 'auditorium-booking';
  }

  /**
   * Get the full MongoDB connection string
   */
  private getMongoUri(): string {
    return `${this.databaseUri}/${this.databaseName}`;
  }

  /**
   * Connect to MongoDB
   */
  async connect(): Promise<void> {
    try {
      const mongoUri = this.getMongoUri();
      await mongoose.connect(mongoUri);
      console.log(`✓ MongoDB connected to ${this.databaseName}`);
    } catch (error) {
      console.error('✗ Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      console.log('✓ MongoDB disconnected');
    } catch (error) {
      console.error('✗ Failed to disconnect from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Check if MongoDB is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      await mongoose.connection.db?.admin().ping();
      return true;
    } catch (error) {
      console.error('✗ MongoDB health check failed:', error);
      return false;
    }
  }

  /**
   * Get database configuration
   */
  getConfig() {
    return {
      uri: this.databaseUri,
      name: this.databaseName,
      fullUri: this.getMongoUri(),
    };
  }
}
