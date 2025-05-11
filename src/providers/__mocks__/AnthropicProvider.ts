import { MessageParam } from '../../types/message';
import { ToolDefinition } from '../../types/tool';

/**
 * Mock implementation of the Anthropic provider for testing
 */
export class AnthropicProvider {
  private apiKey: string;
  private model: string;
  private tools: ToolDefinition[];
  private mockResponses: any[] = [];

  constructor(options: { apiKey?: string; model?: string; tools?: ToolDefinition[] }) {
    this.apiKey = options.apiKey || 'mock-api-key';
    this.model = options.model || 'claude-3-opus-20240229';
    this.tools = options.tools || [];
  }

  /**
   * Set up mock responses for testing
   */
  public setMockResponses(responses: any[]) {
    this.mockResponses = [...responses];
  }

  /**
   * Mock implementation of sendMessage
   */
  public async sendMessage(messages: MessageParam[], options: any = {}) {
    // If no mock responses are set, return a default response
    if (this.mockResponses.length === 0) {
      if (options.tools && options.tools.length > 0) {
        // Return a tool call response if tools are provided
        return {
          type: 'tool_call',
          toolCalls: [
            {
              name: options.tools[0].name,
              arguments: { mockArg: 'mockValue' },
            },
          ],
        };
      }
      
      // Default text response
      return {
        type: 'message',
        content: 'This is a mock response from the Anthropic provider.',
      };
    }
    
    // Return the next mock response and remove it from the queue
    return this.mockResponses.shift();
  }

  /**
   * Mock implementation of streamMessage
   */
  public async *streamMessage(messages: MessageParam[], options: any = {}) {
    // Simulate streaming by yielding chunks
    yield {
      type: 'message_start',
      message: { content: [] },
    };
    
    yield {
      type: 'content_block_start',
      contentBlock: { type: 'text', text: '' },
    };
    
    // If mock responses are set, use them
    const content = this.mockResponses.length > 0
      ? this.mockResponses.shift().content
      : 'This is a mock streamed response from the Anthropic provider.';
    
    // Split the content into chunks to simulate streaming
    const chunks = content.split(' ');
    for (const chunk of chunks) {
      yield {
        type: 'content_block_delta',
        delta: { type: 'text_delta', text: chunk + ' ' },
      };
      
      // Simulate delay between chunks
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    yield {
      type: 'content_block_stop',
    };
    
    yield {
      type: 'message_delta',
      delta: { stop_reason: 'end_turn' },
    };
    
    yield {
      type: 'message_stop',
    };
  }
}

