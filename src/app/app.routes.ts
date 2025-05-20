import { Routes } from '@angular/router';
import { EnglishPracticeComponent } from './components/english-practice/english-practice.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { WordQuizComponent } from './components/word-quiz/word-quiz.component';

export const routes: Routes = [
  { path: 'practice', component: EnglishPracticeComponent },
  { path: 'admin', component: AdminPanelComponent },
  { path: 'quiz', component: WordQuizComponent },
  { path: '', redirectTo: '/practice', pathMatch: 'full' }
];
