import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { GeminiService } from './gemini.service';
import { LearningItem, Practice, PracticeResponse } from '../models/english-learning.model';
import { Quiz, QuizResult } from '../models/quiz.model';
import { Observable, from, map, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EnglishLearningService {
  private readonly LEARNING_ITEMS_PATH = 'learningItems';
  private readonly PRACTICE_HISTORY_PATH = 'practiceHistory';
  private readonly QUIZZES_PATH = 'quizzes';
  private readonly QUIZ_RESULTS_PATH = 'quizResults';

  constructor(
    private firebaseService: FirebaseService,
    private geminiService: GeminiService
  ) {}

  async initializeSampleItems(): Promise<void> {
    const sampleWords = [
      { name: 'book', type: 'word' as const },
      { name: 'library', type: 'word' as const },
      { name: 'read', type: 'word' as const },
      { name: 'write', type: 'word' as const },
      { name: 'understand', type: 'word' as const },
      { name: 'vocabulary', type: 'word' as const }
    ];

    const sampleSkills = [
      { name: 'essay writing', type: 'skill' as const },
      { name: 'reading comprehension', type: 'skill' as const },
      { name: 'spelling', type: 'skill' as const },
      { name: 'grammar', type: 'skill' as const }
    ];

    const allItems = [...sampleWords, ...sampleSkills];

    for (const item of allItems) {
      await this.addLearningItem({
        ...item,
        proficiency: 0,
        needsImprovement: true,
        lastPracticed: null
      });
    }
  }

  async addLearningItem(item: LearningItem): Promise<void> {
    await this.firebaseService.setData(`${this.LEARNING_ITEMS_PATH}/${item.name}`, item);
  }

  async deleteLearningItem(name: string): Promise<void> {
    await this.firebaseService.deleteData(`${this.LEARNING_ITEMS_PATH}/${name}`);
  }

  async getLearningItems(): Promise<LearningItem[]> {
    const data = await this.firebaseService.getData(this.LEARNING_ITEMS_PATH);
    return Object.values(data || {});
  }

  async getPracticeHistory(): Promise<PracticeResponse[]> {
    const data = await this.firebaseService.getData(this.PRACTICE_HISTORY_PATH);
    return Object.values(data || {}).map(item => item as PracticeResponse).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getAverageScore(): Promise<number> {
    const history = await this.getPracticeHistory();
    if (history.length === 0) return 0;
    
    const totalScore = history.reduce((sum, item) => sum + item.evaluation.score, 0);
    return Math.round(totalScore / history.length);
  }

  async canAttemptSpellingPractice(): Promise<boolean> {
    const history = await this.getPracticeHistory();
    if (history.length === 0) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find successful spelling practice attempts from today
    const todaySuccessfulAttempts = history.filter(item => {
      const attemptDate = new Date(item.timestamp);
      attemptDate.setHours(0, 0, 0, 0);
      return attemptDate.getTime() === today.getTime() && 
             item.type === 'spelling' && 
             item.evaluation.isCorrect;
    });

    return todaySuccessfulAttempts.length === 0;
  }
  generatePractice(words: string[], skills: string[]): Observable<Practice> {
    const practiceId = new Date().getTime().toString();
    const prompt = `
You must respond with ONLY a valid JSON object in the following structure, with no additional text or formatting:
{
  "id": "${practiceId}",
  "type": "Choose either 'essay' or 'multipleChoice'",
  "prompt": "The practice instruction or question",
  "targetWords": ${JSON.stringify(words)},
  "targetSkills": ${JSON.stringify(skills)},
  "options": ["If type is multipleChoice, provide 4 options here"],
  "correctAnswer": "The correct answer or expected essay elements"
}

Create an English practice exercise using these words: ${words.join(', ')} 
and focusing on these skills: ${skills.join(', ')}.
Choose randomly between an essay prompt (100 words) or a multiple choice question.
Make the exercise challenging but appropriate for English learners.`;

    return this.geminiService.sendPrompt(prompt).pipe(
      map(response => {
        try {
          const parsed = JSON.parse(response.content);
          if (!parsed || typeof parsed !== 'object' || !parsed.type || !parsed.prompt) {
            throw new Error('Invalid response format');
          }
          return parsed as Practice;
        } catch (error) {
          console.error('Failed to parse practice response:', error);
          throw new Error('Failed to generate practice. Please try again.');
        }
      })
    );
  }

  evaluatePractice(practice: Practice, userAnswer: string): Observable<PracticeResponse> {
    const timestamp = new Date().toISOString();
    const practiceId = practice.id || new Date().getTime().toString();
    const prompt = `
You must respond with ONLY a valid JSON object in the following structure, with no additional text or formatting:
{
  "practiceId": "${practiceId}",
  "userAnswer": ${JSON.stringify(userAnswer)},
  "timestamp": "${timestamp}",
  "evaluation": {
    "isCorrect": true/false,
    "score": "A number from 0 to 100 indicating the quality of the answer",
    "feedback": "Detailed feedback about the answer",
    "weaknesses": ["List specific areas where the user needs improvement"],
    "improvementAreas": {
      "words": ["Words that need more practice"],
      "skills": ["Skills that need more practice"]
    },
    "strengths": {
      "words": ["Words used correctly"],
      "skills": ["Skills demonstrated well"]
    }
  }
}

Evaluate this ${practice.type} answer:
Question/Prompt: ${practice.prompt}
User's Answer: ${userAnswer}
Target Words: ${practice.targetWords.join(', ')}
Target Skills: ${practice.targetSkills.join(', ')}
${practice.correctAnswer ? `Correct Answer: ${practice.correctAnswer}` : ''}`;

    return this.geminiService.sendPrompt(prompt).pipe(
      map(response => {
        try {
          const parsed = JSON.parse(response.content);
          if (!parsed || typeof parsed !== 'object') {
            throw new Error('Invalid response format');
          }
          // Ensure practiceId and timestamp are set correctly
          parsed.practiceId = practiceId;
          parsed.timestamp = timestamp;
          return parsed as PracticeResponse;
        } catch (error) {
          console.error('Failed to parse evaluation response:', error);
          throw new Error('Failed to evaluate practice. Please try again.');
        }
      }),
      switchMap(async (response) => {
        // Create a valid Firebase path
        const historyId = response.timestamp.replace(/[.#$\[\]]/g, '_');
        // Store the response in Firebase
        await this.firebaseService.setData(
          `${this.PRACTICE_HISTORY_PATH}/${historyId}`, 
          response
        );
        // Update learning items based on evaluation
        await this.updateLearningItems(response);
        return response;
      })
    );
  }

  async addQuiz(quiz: Quiz): Promise<void> {
    const quizId = new Date().getTime().toString();
    await this.firebaseService.setData(`${this.QUIZZES_PATH}/${quizId}`, {
      ...quiz,
      id: quizId
    });
  }

  async deleteQuiz(quizId: string): Promise<void> {
    await this.firebaseService.deleteData(`${this.QUIZZES_PATH}/${quizId}`);
  }

  async getQuizzes(): Promise<Quiz[]> {
    const data = await this.firebaseService.getData(this.QUIZZES_PATH);
    return Object.values(data || {}).map(item => item as Quiz).sort((a: Quiz, b: Quiz) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async submitQuizResult(result: QuizResult): Promise<void> {
    try {
      console.log('Submitting quiz result:', result);
      const resultId = new Date().getTime().toString();
      const timestamp = new Date().toISOString();
      
      const quizResult = {
        ...result,
        id: resultId,
        completedAt: timestamp
      };
      
      console.log('Saving quiz result to path:', `${this.QUIZ_RESULTS_PATH}/${resultId}`);
      console.log('Quiz result data:', quizResult);
      
      await this.firebaseService.setData(`${this.QUIZ_RESULTS_PATH}/${resultId}`, quizResult);
      console.log('Quiz result saved successfully');
    } catch (error) {
      console.error('Error submitting quiz result:', error);
      throw error;
    }
  }

  async getQuizResults(quizId?: string, limit: number = 20): Promise<QuizResult[]> {
    try {
      console.log('Fetching quiz results from path:', this.QUIZ_RESULTS_PATH);
      // Get all quiz results
      const data = await this.firebaseService.getData(this.QUIZ_RESULTS_PATH);

      console.log('Raw data from Firebase:', data);

      if (!data) {
        console.log('No data found in Firebase');
        return [];
      }

      const results = Object.values(data).map(item => {
        console.log('Processing quiz result item:', item);
        return item as QuizResult;
      });
      
      console.log('Mapped results:', results);

      const sortedResults = results
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
        .slice(0, limit);

      console.log('Sorted and limited results:', sortedResults);

      if (quizId) {
        const filteredResults = sortedResults.filter(result => result.quizId === quizId);
        console.log('Filtered results for quizId', quizId, ':', filteredResults);
        return filteredResults;
      }

      return sortedResults;
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      return [];
    }
  }

  private async updateLearningItems(response: PracticeResponse): Promise<void> {
    const items = await this.getLearningItems();
    
    // Update proficiency based on strengths and weaknesses
    for (const item of items) {
      if (response.evaluation.strengths.words.includes(item.name) ||
          response.evaluation.strengths.skills.includes(item.name)) {
        item.proficiency = Math.min(100, item.proficiency + 10);
        item.needsImprovement = false;
      }
      
      if (response.evaluation.improvementAreas.words.includes(item.name) ||
          response.evaluation.improvementAreas.skills.includes(item.name)) {
        item.proficiency = Math.max(0, item.proficiency - 5);
        item.needsImprovement = true;
      }
      
      item.lastPracticed = new Date().toISOString();
      await this.addLearningItem(item);
    }
  }
}
