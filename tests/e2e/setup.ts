// E2E test setup file
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Increase timeout for all tests in this suite
jest.setTimeout(30000);

// Global setup for E2E tests
beforeAll(async () => {
  console.log('Setting up E2E test environment...');
  // Add any global setup needed for E2E tests
});

// Global teardown for E2E tests
afterAll(async () => {
  console.log('Tearing down E2E test environment...');
  // Add any global cleanup needed for E2E tests
});

