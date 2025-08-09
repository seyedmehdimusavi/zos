import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EnglishLearningService } from '../../services/english-learning.service';
import { WordQuiz, WordQuizQuestion, WordQuizResult } from '../../models/word-quiz.model';
import { QuizOneAnswer } from '../../models/quiz.model';

@Component({
  selector: 'app-word-quiz',
  templateUrl: './word-quiz.component.html',
  styleUrls: ['./word-quiz.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ]
})
export class WordQuizComponent implements OnInit {
  quizForm: FormGroup;
  currentQuestionIndex = 0;
  quiz: WordQuiz | null = null;
  loading = false;
  quizSubmitted = false;
  score = 0;
  userAnswers: string[] = [];
  showHint = false;

  // Get current question from the quiz
  get currentQuestion(): WordQuizQuestion | null {
    if (!this.quiz || this.quiz.questions.length === 0) {
      return null;
    }
    return this.quiz.questions[this.currentQuestionIndex];
  }

  constructor(
    private englishService: EnglishLearningService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.quizForm = this.fb.group({
      answer: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  async ngOnInit() {
    await this.loadQuiz();
  }

  async loadQuiz() {
    this.loading = true;
    try {
      // Using getQuizzes temporarily - we'll need to implement getWordQuizzes in the service
      const quizzes = await this.englishService.getOneAnswerQuizzes() as QuizOneAnswer[];
      if (quizzes.length > 0) {
        // For now, just take the first quiz. You might want to add quiz selection logic
        this.quiz = quizzes[0];
        this.userAnswers = new Array(this.quiz.questions.length).fill('');
        this.loadQuestion(0);
      } else {
        this.snackBar.open('No word quizzes available', 'Close', { duration: 3000 });
      }
    } catch (error) {
      this.snackBar.open('Error loading quiz', 'Close', { duration: 3000 });
      console.error('Error loading quiz:', error);
    } finally {
      this.loading = false;
    }
  }

  loadQuestion(index: number) {
    if (!this.quiz || index < 0 || index >= this.quiz.questions.length) return;
    
    this.currentQuestionIndex = index;
    const currentAnswer = this.userAnswers[index] || '';
    this.quizForm.setValue({ answer: currentAnswer });
    this.showHint = false;
  }

  async submitAnswer() {
    if (this.quizForm.invalid || !this.quiz) return;

    const answer = this.quizForm.value.answer.trim();
    this.userAnswers[this.currentQuestionIndex] = answer;
    
    // Move to next question or submit if last question
    if (this.currentQuestionIndex < this.quiz.questions.length - 1) {
      this.loadQuestion(this.currentQuestionIndex + 1);
    } else {
      await this.submitQuiz();
    }
  }

  async submitQuiz() {
    if (!this.quiz) return;
    
    this.loading = true;
    this.quizSubmitted = true;
    
    try {
      // Calculate score
      let correctAnswers = 0;
      this.quiz.questions.forEach((question, index) => {
        if (this.isAnswerCorrect(question.answer, this.userAnswers[index])) {
          correctAnswers++;
        }
      });
      
      this.score = Math.round((correctAnswers / this.quiz.questions.length) * 100);
      
      // Create quiz result
      const quizResult: WordQuizResult = {
        quizId: this.quiz.id || '',
        score: this.score,
        totalQuestions: this.quiz.questions.length,
        completedAt: new Date().toISOString(),
        quizTitle: this.quiz.title
      };
      
      // Save result - we'll need to implement saveWordQuizResult in the service
      console.log('Quiz result:', quizResult);
      // await this.englishService.saveWordQuizResult(quizResult);
      
      this.snackBar.open(`Quiz completed! Your score: ${this.score}%`, 'Close', { duration: 5000 });
    } catch (error) {
      this.snackBar.open('Error submitting quiz', 'Close', { duration: 3000 });
      console.error('Error submitting quiz:', error);
    } finally {
      this.loading = false;
    }
  }
  
  isAnswerCorrect(correctAnswer: string, userAnswer: string): boolean {
    // Case-insensitive comparison
    return correctAnswer.toLowerCase() === userAnswer.toLowerCase().trim();
  }
  
  getQuestionStatus(index: number): string {
    if (!this.quiz || !this.quizSubmitted) return '';
    
    const userAnswer = this.userAnswers[index];
    const correctAnswer = this.quiz.questions[index].answer;
    
    if (this.isAnswerCorrect(correctAnswer, userAnswer)) {
      return 'correct';
    } else if (userAnswer) {
      return 'incorrect';
    }
    return '';
  }

  allQuestionsAnswered(): boolean {
    return this.userAnswers.every(answer => answer.trim() !== '');
  }

  toggleHint(): void {
    this.showHint = !this.showHint;
  }

  getProgress(): number {
    if (!this.quiz) return 0;
    const answered = this.userAnswers.filter((a: string) => a.trim() !== '').length;
    return (answered / this.quiz.questions.length) * 100;
  }
}
