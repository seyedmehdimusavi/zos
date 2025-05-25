import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
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
    MatCardModule,
    MatRadioModule,
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
  quizHistoryColumns: string[] = ['timestamp', 'quizTitle', 'score', 'questions', 'actions'];
  practiceHistory: PracticeResponse[] = [];
  historyColumns: string[] = ['timestamp', 'userAnswer', 'score', 'isCorrect', 'actions'];

  // MatTableDataSource instances
  quizHistoryDataSource = new MatTableDataSource<QuizResult>();
  practiceHistoryDataSource = new MatTableDataSource<PracticeResponse>();

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
      console.log('Loading quiz history...');
      const results = await this.englishService.getQuizResults();
      console.log('Raw quiz results:', results);
      
      if (!results || results.length === 0) {
        console.log('No quiz results found');
        this.quizHistory = [];
        return;
      }
      
      const mappedResults = results.map(result => {
        // Use the ID (timestamp) if completedAt is not available
        const timestamp = result.completedAt || result.id;
        result.formattedDate = this.formatDate(timestamp);

        // Find the corresponding quiz title
        const quiz = this.quizzes.find(q => q.id === result.quizId);
        result.quizTitle = quiz ? quiz.title : 'Unknown Quiz';

        return result;
      });
      
      this.quizHistory = mappedResults;
      this.quizHistoryDataSource.data = mappedResults;
      
      console.log('Quiz history processed:', {
        totalResults: mappedResults.length,
        firstResult: mappedResults[0],
        lastResult: mappedResults[mappedResults.length - 1]
      });
    } catch (error) {
      console.error('Error loading quiz history:', error);
      this.snackBar.open('Error loading quiz history', 'Close', { duration: 3000 });
    }
  }

  async loadPracticeHistory() {
    const practiceResults = await this.englishService.getPracticeHistory();
    this.practiceHistory = practiceResults;
    this.practiceHistoryDataSource.data = practiceResults;
  }

  async deleteQuizResult(result: QuizResult) {
    try {
      if (!result.id) {
        console.error('Quiz result has no ID');
        return;
      }
      await this.englishService.deleteQuizResult(result.id);
      this.quizHistory = this.quizHistory.filter(item => item.id !== result.id);
      this.quizHistoryDataSource.data = this.quizHistory;
      this.snackBar.open('Quiz result deleted successfully', 'Close', { duration: 3000 });
    } catch (error) {
      console.error('Error deleting quiz result:', error);
      this.snackBar.open('Error deleting quiz result', 'Close', { duration: 3000 });
    }
  }

  async deletePracticeResult(result: PracticeResponse) {
    try {
      await this.englishService.deletePracticeResult(result.practiceId);
      this.practiceHistory = this.practiceHistory.filter(item => item.practiceId !== result.practiceId);
      this.practiceHistoryDataSource.data = this.practiceHistory;
      this.snackBar.open('Practice result deleted successfully', 'Close', { duration: 3000 });
    } catch (error) {
      console.error('Error deleting practice result:', error);
      this.snackBar.open('Error deleting practice result', 'Close', { duration: 3000 });
    }
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

  formatDate(dateString: string | number | undefined): string {
    try {
      if (!dateString) {
        return 'N/A';
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day} ${month} ${year} ${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }

  getScoreColor(score: number): string {
    if (score >= 90) return '#4caf50';
    if (score >= 70) return '#8bc34a';
    if (score >= 50) return '#ffc107';
    if (score >= 30) return '#ff9800';
    return '#f44336';
  }

  isQuizHistoryRow = (_index: number, item: any): boolean => {
    return item && 'quizId' in item;
  }

  isPracticeHistoryRow = (_index: number, item: any): boolean => {
    return item && 'userAnswer' in item;
  }
}
