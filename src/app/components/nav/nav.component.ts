import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class NavComponent {
  navItems = [
    { path: '/practice', icon: 'school', label: 'Practice' },
    { path: '/word-quiz', icon: 'abc', label: 'Word Quiz' },
    { path: '/quiz', icon: 'quiz', label: 'Quizzes' },
    { path: '/admin', icon: 'admin_panel_settings', label: 'Admin' }
  ];
}
