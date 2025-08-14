export interface OllamaVisionRequest {
  model: string;
  prompt: string;
  images: string[];
  stream: boolean;
}

export interface OllamaVisionResponse {
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface BookVisionResult {
  title?: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  success: boolean;
  error?: string;
}

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

export interface OllamaListResponse {
  models: OllamaModel[];
}

class OllamaClient {
  private baseUrl: string;
  private enabled: boolean;

  constructor() {
    this.baseUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434';
    this.enabled = process.env.OLLAMA_ENABLED === 'true';
  }

  async isAvailable(): Promise<boolean> {
    if (!this.enabled) return false;
    
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.ok;
    } catch (error) {
      console.error('Ollama availability check failed:', error);
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    if (!this.enabled) return [];

    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OllamaListResponse = await response.json();
      return data.models
        .filter(model => 
          model.name.includes('llava') || 
          model.name.includes('vision') || 
          model.name.includes('bakllava') ||
          model.name.includes('vl') || // Vision-Language models like qwen2.5vl
          model.name.includes('clip') ||
          model.name.includes('multimodal')
        )
        .map(model => model.name);
    } catch (error) {
      console.error('Failed to list Ollama models:', error);
      return [];
    }
  }

  async analyzeBookImage(imageBase64: string, model: string): Promise<BookVisionResult> {
    if (!this.enabled) {
      return {
        success: false,
        error: 'Ollama is not enabled'
      };
    }

    const prompt = `Analyze this image of a book and extract the following information. Look at both the cover and spine if visible. Return only a valid JSON object with no additional text:

{
  "title": "exact book title",
  "author": "author name(s)",
  "isbn": "ISBN number if visible",
  "publisher": "publisher name if visible"
}

If any information is not clearly visible or readable, omit that field from the JSON. Make sure the response is valid JSON only.`;

    try {
      const request: OllamaVisionRequest = {
        model,
        prompt,
        images: [imageBase64],
        stream: false
      };

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OllamaVisionResponse = await response.json();
      
      try {
        const cleanResponse = data.response.trim();
        const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : cleanResponse;
        
        const bookData = JSON.parse(jsonText);
        
        return {
          title: bookData.title,
          author: bookData.author,
          isbn: bookData.isbn,
          publisher: bookData.publisher,
          success: true
        };
      } catch (parseError) {
        console.error('Failed to parse Ollama response as JSON:', parseError);
        console.log('Raw response:', data.response);
        
        return {
          success: false,
          error: 'Failed to parse book information from image'
        };
      }
    } catch (error) {
      console.error('Ollama API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const ollama = new OllamaClient();