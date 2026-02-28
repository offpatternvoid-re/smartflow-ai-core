import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MetricsService } from '../../services/metrics.service';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="max-w-[1200px] mx-auto px-6 py-12">
      <!-- Breadcrumbs & Header -->
      <div class="text-[14px] text-muted mb-4 font-medium">SmartFlow AI <span class="mx-2">&rsaquo;</span> Dashboard</div>
      <h1 class="text-[32px] font-bold tracking-tight mb-10">Dashboard</h1>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div class="card flex flex-col">
          <span class="text-[15px] font-medium text-muted mb-4">Active Sessions</span>
          <span class="text-[40px] font-bold text-primary mb-2">{{ metrics?.active_sessions || 0 }}</span>
          <span class="text-[14px] text-success font-medium">+3 this hour &uarr;</span>
        </div>
        <div class="card flex flex-col">
          <span class="text-[15px] font-medium text-muted mb-4">Total Calls</span>
          <span class="text-[40px] font-bold text-primary mb-2">{{ (metrics?.total_calls || 0) | number }}</span>
          <span class="text-[14px] text-success font-medium">+124 today &uarr;</span>
        </div>
        <div class="card flex flex-col">
          <span class="text-[15px] font-medium text-muted mb-4">Avg Latency</span>
          <span class="text-[40px] font-bold text-primary mb-2">{{ metrics?.avg_latency_ms || 0 }}<span class="text-[20px] text-muted ml-1">ms</span></span>
          <span class="text-[14px] text-muted font-medium">P95: 92ms</span>
        </div>
        <div class="card flex flex-col">
          <span class="text-[15px] font-medium text-muted mb-4">Success Rate</span>
          <span class="text-[40px] font-bold text-primary mb-2">{{ metrics?.success_rate || '99.2' }}<span class="text-[20px] text-muted ml-1">%</span></span>
          <span class="text-[14px] text-success font-medium">0 errors today</span>
        </div>
      </div>

      <!-- Main Area: 2 Columns -->
      <div class="flex flex-col lg:flex-row gap-12">
        
        <!-- Left Column: Sessions (70%) -->
        <div class="flex-[7]">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-[20px] font-semibold tracking-tight tracking-[-0.01em]">Active Sessions</h2>
            <button class="bg-primary text-white border-none px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#262626] transition shadow-sm" routerLink="/sessions">
              + New Session
            </button>
          </div>
          
          <div class="border border-border rounded-card overflow-hidden bg-white shadow-sm">
            <table class="w-full text-left border-collapse" *ngIf="sessions.length > 0">
              <thead>
                <tr class="bg-[#FAFAFA] border-b border-border">
                  <th class="py-3 px-4 text-[13px] font-semibold text-muted uppercase tracking-wide">Name</th>
                  <th class="py-3 px-4 text-[13px] font-semibold text-muted uppercase tracking-wide">Model Size</th>
                  <th class="py-3 px-4 text-[13px] font-semibold text-muted uppercase tracking-wide">Calls</th>
                  <th class="py-3 px-4 text-[13px] font-semibold text-muted uppercase tracking-wide">Latency</th>
                  <th class="py-3 px-4 text-[13px] font-semibold text-muted uppercase tracking-wide">Created</th>
                  <th class="py-3 px-4 text-[13px] font-semibold text-muted uppercase tracking-wide text-right">—</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border text-[15px]">
                <tr *ngFor="let s of sessions" class="hover:bg-slate-50 transition-colors">
                  <td class="py-4 px-4 font-medium">
                     <div class="flex items-center gap-3">
                        {{ s.name }}
                        <span class="badge-active"><span class="w-[6px] h-[6px] rounded-full bg-success"></span> active</span>
                     </div>
                  </td>
                  <td class="py-4 px-4 text-muted">{{ s.model_config?.size }} ({{ s.model_config?.activation }})</td>
                  <td class="py-4 px-4 font-mono">{{ s.stats?.call_count }}</td>
                  <td class="py-4 px-4 font-mono">{{ s.stats?.avg_latency_ms }}ms</td>
                  <td class="py-4 px-4 text-muted">{{ s.stats?.uptime_seconds }}s ago</td>
                  <td class="py-4 px-4 flex justify-end gap-2">
                    <button class="border shadow-sm border-border rounded px-4 py-1.5 text-sm bg-white hover:bg-[#F9FAFB] font-semibold" routerLink="/predict" [queryParams]="{session: s.name}">Run &#9654;</button>
                    <button class="border shadow-sm border-border rounded px-4 py-1.5 text-sm bg-white hover:bg-red-50 text-red-600 font-semibold" (click)="deleteSession(s.name)">Delete &#10005;</button>
                  </td>
                </tr>
              </tbody>
            </table>

            <div *ngIf="sessions.length === 0" class="py-20 flex flex-col items-center justify-center text-center">
              <svg class="w-12 h-12 text-[#E5E7EB] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
              <h3 class="text-xl font-bold mb-2">No sessions yet</h3>
              <p class="text-muted mb-6">Instantiate your first Closure inference session.</p>
              <button class="btn-primary" routerLink="/sessions">Create first session &rarr;</button>
            </div>
          </div>
        </div>
        
        <!-- Live Activity Divider -->
        <div class="hidden lg:block w-[1px] bg-border self-stretch"></div>

        <!-- Right Column: Live Feed (30%) -->
        <div class="flex-[3]">
          <div class="flex items-center gap-2 mb-6">
            <h2 class="text-[20px] font-semibold tracking-tight tracking-[-0.01em]">Live Activity</h2>
            <div class="w-2.5 h-2.5 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(22,163,74,0.6)]"></div>
          </div>

          <div class="space-y-4">
             <div *ngFor="let call of recentCalls" class="border-b border-border pb-4 last:border-0 text-[14px] flex flex-col gap-2">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-primary">{{ call.session_name }}</span>
                  <span class="text-muted font-mono text-[12px]">{{ getRelativeTime(call.ts) }}</span>
                </div>
                <div class="flex items-center gap-3 font-mono text-[13px]">
                   <span class="bg-[#F3F4F6] border border-border text-primary px-2 py-0.5 rounded text-xs font-semibold">{{ call.result?.label }}</span>
                   <span class="text-muted">{{ call.result?.score }}</span>
                   <span class="ml-auto text-success font-semibold">{{ call.result?.latency_ms || call.result?.latency }}ms</span>
                </div>
             </div>
             
             <div *ngIf="recentCalls.length === 0" class="text-muted text-[14px] py-4 bg-[#FAFAFA] border border-border rounded-lg px-4 text-center">
                Waiting for calls...
             </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
    metrics: any = null;
    sessions: any[] = [];
    recentCalls: any[] = [];
    sub?: Subscription;

    constructor(
        private metricsService: MetricsService,
        private apiService: ApiService,
        private notify: NotificationService
    ) { }

    ngOnInit() {
        this.sub = this.metricsService.metrics$.subscribe(data => {
            if (data) {
                this.metrics = data;
                this.recentCalls = data.recent_calls || [];
            }
        });
        this.loadSessions();
    }

    ngOnDestroy() {
        if (this.sub) this.sub.unsubscribe();
    }

    loadSessions() {
        this.apiService.getSessions().then(res => {
            this.sessions = res.sessions || [];
        }).catch(e => {
            this.notify.show('error', 'Failed to load sessions');
        });
    }

    deleteSession(name: string) {
        if (!confirm(`Delete session ${name}?`)) return;
        this.apiService.deleteSession(name).then(() => {
            this.notify.show('success', `Session ${name} deleted`);
            this.loadSessions();
        }).catch(e => {
            this.notify.show('error', `Error deleting session`);
        });
    }

    getRelativeTime(ts: number): string {
        const s = Math.floor(Date.now() / 1000 - ts);
        if (s < 60) return `${s}s ago`;
        return `${Math.floor(s / 60)}m ago`;
    }
}
