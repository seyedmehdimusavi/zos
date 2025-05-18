import { Routes } from '@angular/router';
import { EnglishPracticeComponent } from './components/english-practice/english-practice.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';

export const routes: Routes = [
  { path: 'practice', component: EnglishPracticeComponent },
  { path: 'admin', component: AdminPanelComponent },
  { path: '', redirectTo: '/practice', pathMatch: 'full' }
];
