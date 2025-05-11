// Performance test setup file
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Increase timeout for all tests in this suite
jest.setTimeout(60000);

// Global setup for performance tests
beforeAll(async () => {
  console.log('Setting up performance test environment...');
  // Add any global setup needed for performance tests
});

// Global teardown for performance tests
afterAll(async () => {
  console.log('Tearing down performance test environment...');
  // Add any global cleanup needed for performance tests
});

// Helper function to measure execution time
global.measureExecutionTime = async (fn: () => Promise<any>) => {
  const start = process.hrtime.bigint();
  const result = await fn();
  const end = process.hrtime.bigint();
  const duration = Number(end - start) / 1_000_000; // Convert to milliseconds
  return { result, duration };
};

