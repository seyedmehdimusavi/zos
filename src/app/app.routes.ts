import { Routes } from '@angular/router';
import { EnglishPracticeComponent } from './components/english-practice/english-practice.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { WordQuizComponent } from './components/word-quiz/word-quiz.component';
import { QuizComponent } from './components/quiz/quiz.component';
import { LearningItemsComponent } from './components/learning-items/learning-items.component';
import { QuizManagementOneAnswerComponent } from './components/quiz-management-one-answer/quiz-management-one-answer.component';

export const routes: Routes = [
  { path: 'practice', component: EnglishPracticeComponent },
  { path: 'admin', component: AdminPanelComponent },
  { path: 'learning-items', component: LearningItemsComponent },
  { path: 'word-quiz', component: WordQuizComponent },
  { path: 'quiz', component: QuizComponent },
  { path: '', redirectTo: '/practice', pathMatch: 'full' }
];
