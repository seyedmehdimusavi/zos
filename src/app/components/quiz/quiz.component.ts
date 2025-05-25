import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { EnglishLearningService } from '../../services/english-learning.service';
import { Quiz, QuizQuestion } from '../../models/quiz.model';

interface QuizState {
  quiz: Quiz;
  currentIndex: number;
  answers: number[];
  completed: boolean;
  score: number;
}

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatRadioModule,
    MatSnackBarModule
  ]
})
export class QuizComponent implements OnInit {
  // Public properties
  quizzes: Quiz[] = [];
  selectedQuiz?: Quiz;
  currentQuestionIndex: number = 0;
  userAnswers: number[] = [];
  quizCompleted: boolean = false;
  score: number = 0;

  // Computed properties
  get currentQuestion(): QuizQuestion | undefined {
    return this.selectedQuiz?.questions[this.currentQuestionIndex];
  }

  get canSubmit(): boolean {
    if (!this.selectedQuiz || !this.userAnswers.length) return false;
    return !this.userAnswers.some(answer => answer === -1);
  }

  constructor(
    private englishService: EnglishLearningService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    await this.loadQuizzes();
  }

  async loadQuizzes() {
    try {
      this.quizzes = await this.englishService.getQuizzes();
    } catch (error) {
      this.snackBar.open('Error loading quizzes', 'Close', { duration: 3000 });
    }
  }

  startQuiz(quiz: Quiz) {
    this.selectedQuiz = quiz;
    this.currentQuestionIndex = 0;
    this.userAnswers = new Array(quiz.questions.length).fill(-1);
    this.quizCompleted = false;
    this.score = 0;
  }

  selectAnswer(answerIndex: number) {
    if (this.selectedQuiz) {
      this.userAnswers[this.currentQuestionIndex] = answerIndex;
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  nextQuestion() {
    if (this.selectedQuiz && this.currentQuestionIndex < this.selectedQuiz.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  async submitQuiz() {
    if (!this.selectedQuiz || !this.canSubmit) return;

    try {
      // Calculate score
      let correctAnswers = 0;
      this.selectedQuiz.questions.forEach((question, index) => {
        if (question.correctOptionNumber === this.userAnswers[index] + 1) {
          correctAnswers++;
        }
      });

      this.score = Math.round((correctAnswers / this.selectedQuiz.questions.length) * 100);
      this.quizCompleted = true;

      // Save result to Firebase
      await this.englishService.submitQuizResult({
        quizId: this.selectedQuiz.id!,
        score: this.score,
        totalQuestions: this.selectedQuiz.questions.length,
        completedAt: new Date()
      });
    } catch (error) {
      this.snackBar.open('Error submitting quiz results', 'Close', { duration: 3000 });
    }
  }

  resetQuiz() {
    this.selectedQuiz = undefined;
    this.currentQuestionIndex = 0;
    this.userAnswers = [];
    this.quizCompleted = false;
    this.score = 0;
  }
}
