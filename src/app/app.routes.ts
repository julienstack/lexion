import { Routes } from '@angular/router';
import { adminGuard } from './shared/guards/admin.guard';
import { issueTrackerGuard } from './shared/guards/issue-tracker.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/public/landing-page/landing-page').then(m => m.LandingPage)
    },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayout),
        children: [
            { path: '', loadComponent: () => import('./features/dashboard/dashboard-home/dashboard-home').then(m => m.DashboardHome) },
            { path: 'members', canActivate: [adminGuard], loadComponent: () => import('./features/dashboard/members/members').then(m => m.MembersComponent) },
            { path: 'calendar', loadComponent: () => import('./features/dashboard/calendar/calendar').then(m => m.CalendarComponent) },
            { path: 'wiki', loadComponent: () => import('./features/dashboard/wiki/wiki').then(m => m.WikiComponent) },
            { path: 'ags', loadComponent: () => import('./features/dashboard/working-groups/working-groups').then(m => m.WorkingGroupsComponent) },
            { path: 'contacts', loadComponent: () => import('./features/dashboard/contacts/contacts').then(m => m.ContactsComponent) },
            { path: 'issue-tracker', canActivate: [issueTrackerGuard], loadComponent: () => import('./features/dashboard/issue-tracker/issue-tracker.component').then(m => m.IssueTrackerComponent) }
        ]
    }
];
