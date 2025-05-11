import { ContextManager } from '../../src/mcp-server/core/context-manager';

describe('ContextManager Performance', () => {
  let contextManager: ContextManager;
  
  beforeEach(() => {
    contextManager = new ContextManager({
      maxCacheSize: 1000,
      ttl: 60000,
      maxContextSize: 10000
    });
  });
  
  it('should handle rapid context creation efficiently', async () => {
    const startTime = Date.now();
    const iterations = 1000;
    
    for (let i = 0; i < iterations; i++) {
      await contextManager.getContext(`test-id-${i}`, {
        index: i,
        data: `Test data for context ${i}`
      });
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`Created ${iterations} contexts in ${duration}ms (${duration / iterations}ms per context)`);
    
    // Performance assertion - should create contexts at a reasonable rate
    // Adjust threshold based on expected performance
    expect(duration / iterations).toBeLessThan(5); // Less than 5ms per context
  });
  
  it('should handle context updates efficiently', async () => {
    // Create initial context
    await contextManager.getContext('test-id', {
      initial: true
    });
    
    const startTime = Date.now();
    const iterations = 1000;
    
    for (let i = 0; i < iterations; i++) {
      await contextManager.updateContext('test-id', {
        [`update-${i}`]: `value-${i}`
      });
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`Performed ${iterations} context updates in ${duration}ms (${duration / iterations}ms per update)`);
    
    // Performance assertion
    expect(duration / iterations).toBeLessThan(2); // Less than 2ms per update
    
    // Verify final context size
    const context = await contextManager.getContext('test-id');
    expect(Object.keys(context.metadata).length).toBe(iterations + 1); // +1 for initial property
  });
  
  it('should handle concurrent context operations efficiently', async () => {
    const startTime = Date.now();
    const iterations = 100;
    
    // Create an array of promises for concurrent operations
    const promises = [];
    
    for (let i = 0; i < iterations; i++) {
      // Mix of different operations
      if (i % 3 === 0) {
        // Create new context
        promises.push(contextManager.getContext(`concurrent-${i}`, { index: i }));
      } else if (i % 3 === 1) {
        // Update existing context (create first if needed)
        promises.push(
          contextManager.getContext(`concurrent-shared`, { initial: true })
            .then(() => contextManager.updateContext(`concurrent-shared`, { [`update-${i}`]: i }))
        );
      } else {
        // Invalidate context (create first if needed)
        promises.push(
          contextManager.getContext(`concurrent-invalidate`, { initial: true })
            .then(() => contextManager.invalidateContext(`concurrent-invalidate`))
        );
      }
    }
    
    // Wait for all operations to complete
    await Promise.all(promises);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`Performed ${iterations} concurrent operations in ${duration}ms (${duration / iterations}ms per operation)`);
    
    // Performance assertion for concurrent operations
    expect(duration / iterations).toBeLessThan(10); // Adjust threshold as needed
  });
  
  it('should handle large context data efficiently', async () => {
    // Create a large context object
    const largeData: Record<string, string> = {};
    for (let i = 0; i < 1000; i++) {
      largeData[`key-${i}`] = `value-${i}-${'x'.repeat(100)}`; // Each value is ~110 bytes
    }
    
    const startTime = Date.now();
    
    // Store large context
    await contextManager.getContext('large-context', largeData);
    
    // Retrieve large context
    const retrievedContext = await contextManager.getContext('large-context');
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`Stored and retrieved large context (${Object.keys(largeData).length} keys) in ${duration}ms`);
    
    // Verify data integrity
    expect(Object.keys(retrievedContext.metadata).length).toBe(Object.keys(largeData).length);
    expect(retrievedContext.metadata['key-500']).toBe(largeData['key-500']);
    
    // Performance assertion for large data
    expect(duration).toBeLessThan(500); // Should handle large context in reasonable time
  });
});

