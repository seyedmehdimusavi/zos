import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { EnglishLearningService } from '../../services/english-learning.service';

interface OneAnswerQuestion {
  question: string;
  answer: string;
}

interface OneAnswerQuiz {
  id?: string;
  title: string;
  questions: OneAnswerQuestion[];
  createdAt: Date;
}

@Component({
  selector: 'app-quiz-management-one-answer',
  templateUrl: './quiz-management-one-answer.component.html',
  styleUrls: ['./quiz-management-one-answer.component.scss'],
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
export class QuizManagementOneAnswerComponent {
  quizTitle: string = '';
  jsonContent: string = '';
  quizzes: OneAnswerQuiz[] = [];
  displayedColumns: string[] = ['title', 'questions', 'createdAt', 'actions'];

  private readonly QUESTIONS_PER_SECTION = 10;

  constructor(
    private englishService: EnglishLearningService,
    private snackBar: MatSnackBar
  ) {
    this.loadQuizzes();
  }

  async loadQuizzes() {
    // We'll need to update the service to handle one-answer quizzes
    // For now, we'll use a temporary solution
    this.quizzes = [];
  }

  private splitQuestionsIntoSections(questions: OneAnswerQuestion[], baseTitle: string): OneAnswerQuiz[] {
    const totalSections = Math.ceil(questions.length / this.QUESTIONS_PER_SECTION);
    const quizzes: OneAnswerQuiz[] = [];

    for (let i = 0; i < totalSections; i++) {
      const startIdx = i * this.QUESTIONS_PER_SECTION;
      const endIdx = Math.min((i + 1) * this.QUESTIONS_PER_SECTION, questions.length);
      const sectionQuestions = questions.slice(startIdx, endIdx);

      const sectionTitle = totalSections > 1 
        ? `${baseTitle} - Part ${i + 1}` 
        : baseTitle;

      quizzes.push({
        title: sectionTitle,
        questions: sectionQuestions,
        createdAt: new Date()
      });
    }

    return quizzes;
  }

  async uploadQuiz() {
    if (!this.quizTitle.trim()) {
      this.snackBar.open('Please enter a quiz title', 'Close', { duration: 3000 });
      return;
    }

    try {
      const questions: OneAnswerQuestion[] = JSON.parse(this.jsonContent);
      
      if (!Array.isArray(questions)) {
        throw new Error('Invalid JSON format. Expected an array of questions.');
      }

      // Validate questions
      for (const q of questions) {
        if (!q.question || !q.answer) {
          throw new Error('Each question must have both a question and an answer');
        }
      }

      const quizzes = this.splitQuestionsIntoSections(questions, this.quizTitle.trim());
      
      for (const quiz of quizzes) {
        await this.englishService.addQuizOneAnswer(quiz);
      }

      // TODO: Update the service to handle one-answer quizzes
      // For now, we'll just show a suc          cess message
      const message = quizzes.length > 1
        ? `Quiz prepared successfully and would be split into ${quizzes.length} parts`
        : 'Quiz prepared successfully';

      this.snackBar.open(message, 'Close', { duration: 3000 });
      this.quizTitle = '';
      this.jsonContent = '';
    } catch (error) {
      this.snackBar.open('Error processing quiz: ' + (error as Error).message, 'Close', { duration: 3000 });
    }
  }

  async deleteQuiz(quizId: string) {
    // TODO: Implement delete functionality once the service is updated
    this.snackBar.open('Delete functionality will be implemented after service update', 'Close', { duration: 3000 });
  }
}
