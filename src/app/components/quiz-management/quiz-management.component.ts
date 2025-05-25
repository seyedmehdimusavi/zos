import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { EnglishLearningService } from '../../services/english-learning.service';
import { Quiz, QuizQuestion } from '../../models/quiz.model';

@Component({
  selector: 'app-quiz-management',
  templateUrl: './quiz-management.component.html',
  styleUrls: ['./quiz-management.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatSnackBarModule,
    MatTableModule,
    MatIconModule
  ]
})
export class QuizManagementComponent {
  quizTitle: string = '';
  jsonContent: string = '';
  quizzes: Quiz[] = [];
  displayedColumns: string[] = ['title', 'questions', 'createdAt', 'actions'];

  constructor(
    private englishService: EnglishLearningService,
    private snackBar: MatSnackBar
  ) {
    this.loadQuizzes();
  }

  async loadQuizzes() {
    this.quizzes = await this.englishService.getQuizzes();
  }

  async uploadQuiz() {
    if (!this.quizTitle.trim()) {
      this.snackBar.open('Please enter a quiz title', 'Close', { duration: 3000 });
      return;
    }

    try {
      const questions: QuizQuestion[] = JSON.parse(this.jsonContent);
      
      if (!Array.isArray(questions)) {
        throw new Error('Invalid JSON format. Expected an array of questions.');
      }

      // Validate questions
      for (const q of questions) {
        if (!q.question || !q.answer1 || !q.answer2 || !q.answer3 || !q.answer4 || 
            !q.correctOptionNumber || q.correctOptionNumber < 1 || q.correctOptionNumber > 4) {
          throw new Error('Invalid question format');
        }
      }

      const quiz: Quiz = {
        title: this.quizTitle.trim(),
        questions,
        createdAt: new Date()
      };

      await this.englishService.addQuiz(quiz);
      this.snackBar.open('Quiz uploaded successfully', 'Close', { duration: 3000 });
      this.quizTitle = '';
      this.jsonContent = '';
      await this.loadQuizzes();
    } catch (error) {
      this.snackBar.open('Error uploading quiz: ' + (error as Error).message, 'Close', { duration: 3000 });
    }
  }

  async deleteQuiz(quizId: string) {
    try {
      await this.englishService.deleteQuiz(quizId);
      this.snackBar.open('Quiz deleted successfully', 'Close', { duration: 3000 });
      await this.loadQuizzes();
    } catch (error) {
      this.snackBar.open('Error deleting quiz', 'Close', { duration: 3000 });
    }
  }
}
