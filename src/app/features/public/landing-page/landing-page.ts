import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FeedbackBadgeComponent } from '../../feedback/feedback-badge/feedback-badge.component';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink, FeedbackBadgeComponent],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {

}
