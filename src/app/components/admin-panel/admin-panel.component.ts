import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { QuizManagementComponent } from '../quiz-management/quiz-management.component';
import { MatDialog } from '@angular/material/dialog';
import { PracticeFeedbackDialogComponent } from '../practice-feedback-dialog/practice-feedback-dialog.component';
import { EnglishLearningService } from '../../services/english-learning.service';
import { LearningItem, PracticeResponse } from '../../models/english-learning.model';
import { Quiz, QuizResult } from '../../models/quiz.model';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
    MatIconModule,
    MatDialogModule,
    MatDividerModule,
    QuizManagementComponent
  ]
})
export class AdminPanelComponent implements OnInit {
  quizHistory: QuizResult[] = [];
  quizzes: Quiz[] = [];
  quizHistoryColumns: string[] = ['timestamp', 'quizTitle', 'score', 'questions'];
  practiceHistory: PracticeResponse[] = [];
  historyColumns: string[] = ['timestamp', 'userAnswer', 'score', 'isCorrect'];

  constructor(
    private englishService: EnglishLearningService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    await Promise.all([
      this.loadQuizHistory(),
      this.loadPracticeHistory(),
      this.loadQuizzes()
    ]);
  }

  async loadQuizHistory() {
    try {
      const results = await this.englishService.getQuizResults();
      this.quizHistory = results.map(result => ({
        ...result,
        completedAt: new Date(result.completedAt)
      }));
      console.log('Quiz history loaded:', this.quizHistory);
    } catch (error) {
      console.error('Error loading quiz history:', error);
      this.snackBar.open('Error loading quiz history', 'Close', { duration: 3000 });
    }
  }

  async loadPracticeHistory() {
    this.practiceHistory = await this.englishService.getPracticeHistory();
  }

  async loadQuizzes() {
    this.quizzes = await this.englishService.getQuizzes();
  }

  getQuizTitle(quizId: string): string {
    if (!quizId) return 'Unknown Quiz';
    const quiz = this.quizzes.find(q => q.id === quizId);
    return quiz?.title || 'Unknown Quiz';
  }

  showFeedback(practice: PracticeResponse) {
    this.dialog.open(PracticeFeedbackDialogComponent, {
      data: practice,
      maxWidth: '90vw',
      maxHeight: '90vh'
    });
  }

  getScoreColor(score: number): string {
    if (score >= 90) return '#4caf50';
    if (score >= 70) return '#8bc34a';
    if (score >= 50) return '#ffc107';
    if (score >= 30) return '#ff9800';
    return '#f44336';
  }
}
