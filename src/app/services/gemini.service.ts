import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';

interface GeminiResponse {
  content: string;
  metadata: {
    confidence: number;
    source?: string;
    timestamp: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    // Initialize Gemini with your API key
    this.genAI = new GoogleGenerativeAI(environment.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-8b' });
    //this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Send a structured prompt to Gemini and get a response
   * @param prompt The structured prompt to send
   * @returns Observable with the response from Gemini
   */
  sendPrompt(prompt: string): Observable<any> {
    return from(this.generateResponse(prompt));
  }

  private cleanJsonResponse(text: string): string {
    try {
      // Remove markdown code blocks
      let cleaned = text.replace(/```json\s*/g, '')
                       .replace(/```/g, '')
                       .trim();

      // Try to find the JSON object bounds
      const startBrace = cleaned.indexOf('{');
      const endBrace = cleaned.lastIndexOf('}');
      
      if (startBrace !== -1 && endBrace !== -1) {
        cleaned = cleaned.substring(startBrace, endBrace + 1);
      }

      // Remove any non-JSON characters
      cleaned = cleaned.replace(/[\u0000-\u0019]+/g, '');
      
      console.log('Cleaned attempt:', cleaned);
      
      // Validate if it's parseable
      JSON.parse(cleaned);
      return cleaned;
    } catch (error) {
      console.error('Error in cleaning JSON:', error);
      throw new Error(`Failed to clean JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateResponse(prompt: string): Promise<any> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('Raw response:', text);
      
      const cleanJson = this.cleanJsonResponse(text);
      console.log('Cleaned JSON:', cleanJson);
      return { content: cleanJson };
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  }
}
