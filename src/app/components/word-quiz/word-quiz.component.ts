import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EnglishLearningService } from '../../services/english-learning.service';
import { LearningItem } from '../../models/english-learning.model';

interface QuizQuestion {
  id: number;
  word: string;
  question: string;
  options: string[];
  correctAnswer: string;
  selectedAnswer?: string;
}

@Component({
  selector: 'app-word-quiz',
  templateUrl: './word-quiz.component.html',
  styleUrls: ['./word-quiz.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatRadioModule,
    MatCardModule,
    MatProgressBarModule,
    MatSnackBarModule
  ]
})
export class WordQuizComponent implements OnInit {
  questions: QuizQuestion[] = [];
  loading = false;
  quizSubmitted = false;
  score = 0;

  constructor(
    private englishService: EnglishLearningService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    await this.generateQuiz();
  }

  async generateQuiz() {
    this.loading = true;
    this.quizSubmitted = false;
    this.score = 0;
    
    try {
      // Get all learning items
      const items = await this.englishService.getLearningItems();
      const words = items.filter(item => item.type === 'word');

      if (words.length < 10) {
        this.snackBar.open('Not enough words available. Please add at least 10 words.', 'Close', { duration: 5000 });
        this.loading = false;
        return;
      }

      // Randomly select 10 words
      const selectedWords = this.shuffleArray(words).slice(0, 10);
      
      // Generate questions
      this.questions = await Promise.all(selectedWords.map(async (word, index) => {
        const otherWords = words.filter(w => w.name !== word.name);
        const distractors = this.shuffleArray(otherWords)
          .slice(0, 3)
          .map(w => w.name);

        const options = this.shuffleArray([word.name, ...distractors]);

        return {
          id: index + 1,
          word: word.name,
          question: `What is the correct meaning or usage of the word "${word.name}"?`,
          options,
          correctAnswer: word.name,
          selectedAnswer: undefined
        };
      }));
    } catch (error) {
      this.snackBar.open('Error generating quiz', 'Close', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  async submitQuiz() {
    if (!this.allQuestionsAnswered()) {
      this.snackBar.open('Please answer all questions before submitting', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    try {
      const correctAnswers = this.questions.filter(q => q.selectedAnswer === q.correctAnswer).length;
      this.score = (correctAnswers / this.questions.length) * 100;
      this.quizSubmitted = true;

      // Update word proficiencies
      for (const question of this.questions) {
        const isCorrect = question.selectedAnswer === question.correctAnswer;
        const word = await this.englishService.getLearningItems()
          .then(items => items.find(item => item.name === question.word));

        if (word) {
          word.proficiency = Math.min(100, Math.max(0, word.proficiency + (isCorrect ? 10 : -5)));
          word.needsImprovement = !isCorrect;
          word.lastPracticed = new Date().toISOString();
          await this.englishService.addLearningItem(word);
        }
      }

      this.snackBar.open(`Quiz completed! Score: ${this.score}%`, 'Close', { duration: 5000 });
    } catch (error) {
      this.snackBar.open('Error submitting quiz', 'Close', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  allQuestionsAnswered(): boolean {
    return this.questions.every(q => q.selectedAnswer !== undefined);
  }

  getQuestionStatus(question: QuizQuestion): 'correct' | 'incorrect' | 'unanswered' {
    if (!this.quizSubmitted) return 'unanswered';
    return question.selectedAnswer === question.correctAnswer ? 'correct' : 'incorrect';
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
