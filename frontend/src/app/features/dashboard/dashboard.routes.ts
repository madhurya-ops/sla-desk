import { Routes } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { Dashboard } from './dashboard';

// Chart.js is only needed here; registering it in this lazy route keeps it out of the initial bundle.
export const DASHBOARD_ROUTES: Routes = [
  { path: '', component: Dashboard, providers: [provideCharts(withDefaultRegisterables())] },
];
