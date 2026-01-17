import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';
import { ThemeService } from '../../shared/services/theme.service';

@Component({
  selector: 'app-sidebar-left',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar-left.html',
  styleUrl: './sidebar-left.css',
})
export class SidebarLeft {
  public auth = inject(AuthService);
  public theme = inject(ThemeService);
}

