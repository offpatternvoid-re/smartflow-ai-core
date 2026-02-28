import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing/landing.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SessionsComponent } from './pages/sessions/sessions.component';
import { PredictComponent } from './pages/predict/predict.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { DocsComponent } from './pages/docs/docs.component';

export const routes: Routes = [
    { path: '', component: LandingPageComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'sessions', component: SessionsComponent },
    { path: 'predict', component: PredictComponent },
    { path: 'analytics', component: AnalyticsComponent },
    { path: 'docs', component: DocsComponent },
];
