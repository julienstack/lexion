import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarLeft } from '../sidebar-left/sidebar-left';
import { SidebarRight } from '../sidebar-right/sidebar-right';
import { FeedbackBadgeComponent } from '../../features/feedback/feedback-badge/feedback-badge.component';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SidebarLeft, SidebarRight, FeedbackBadgeComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {

}
