import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/auth/auth.guard';
import { Shell } from './layout/shell';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Sign in · SLA Desk',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tickets' },
      {
        path: 'tickets',
        title: 'Tickets · SLA Desk',
        loadComponent: () => import('./features/tickets/ticket-list').then((m) => m.TicketList),
      },
      {
        path: 'tickets/new',
        title: 'New ticket · SLA Desk',
        loadComponent: () => import('./features/tickets/ticket-new').then((m) => m.TicketNew),
      },
      {
        path: 'tickets/:id',
        title: 'Ticket · SLA Desk',
        loadComponent: () =>
          import('./features/tickets/ticket-detail').then((m) => m.TicketDetail),
      },
      {
        path: 'dashboard',
        title: 'Dashboard · SLA Desk',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'sla-policies',
        title: 'SLA Policies · SLA Desk',
        canActivate: [roleGuard(['MANAGER'])],
        loadComponent: () =>
          import('./features/sla-policies/sla-policies').then((m) => m.SlaPolicies),
      },
    ],
  },
  { path: '**', redirectTo: 'tickets' },
];
