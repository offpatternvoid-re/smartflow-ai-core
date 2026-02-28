import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MetricsService } from '../../services/metrics.service';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';

const ARCH_COLORS: Record<string, { bg: string; text: string }> = {
  linear: { bg: '#EFF6FF', text: '#1D4ED8' },
  mlp: { bg: '#F0FDF4', text: '#16A34A' },
  attention: { bg: '#FFF7ED', text: '#EA580C' },
  autoencoder: { bg: '#FDF4FF', text: '#9333EA' },
};

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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="card flex flex-col">
          <span class="text-[15px] font-medium text-muted mb-4">Active Sessions</span>
          <span class="text-[40px] font-bold text-primary mb-2">{{ activeSessions }}</span>
        </div>
        <div class="card flex flex-col">
          <span class="text-[15px] font-medium text-muted mb-4">Total Calls</span>
          <span class="text-[40px] font-bold text-primary mb-2">{{ totalCalls | number }}</span>
        </div>
        <div class="card flex flex-col">
          <span class="text-[15px] font-medium text-muted mb-4">Avg Latency</span>
          <span class="text-[40px] font-bold text-primary mb-2">{{ avgLatency }}<span class="text-[20px] text-muted ml-1">ms</span></span>
        </div>
        <div class="card flex flex-col">
          <span class="text-[15px] font-medium text-muted mb-4">Success Rate</span>
          <span class="text-[40px] font-bold text-primary mb-2">{{ successRate }}<span class="text-[20px] text-muted ml-1">%</span></span>
        </div>
      </div>

      <!-- Architecture distribution -->
      <div class="mb-10 text-[14px] text-muted font-medium">
        <span *ngIf="archCounts.linear > 0">Linear: {{ archCounts.linear }}</span>
        <span *ngIf="archCounts.mlp > 0" class="ml-4">MLP: {{ archCounts.mlp }}</span>
        <span *ngIf="archCounts.attention > 0" class="ml-4">Attention: {{ archCounts.attention }}</span>
        <span *ngIf="archCounts.autoencoder > 0" class="ml-4">Autoencoder: {{ archCounts.autoencoder }}</span>
        <span *ngIf="totalCalls === 0 && sessions?.length === 0" class="text-muted">No sessions yet.</span>
      </div>

      <!-- Main Area: 2 Columns -->
      <div class="flex flex-col lg:flex-row gap-12">
        
        <!-- Left Column: Sessions (70%) -->
        <div class="flex-[7]">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-[20px] font-semibold tracking-tight tracking-[-0.01em]">Active Sessions</h2>
            <button class="btn-primary px-4 py-2 text-[14px]" routerLink="/sessions">
              + New Session
            </button>
          </div>
          
          <div class="border border-border rounded-card overflow-hidden bg-white">
            <ng-container *ngIf="sessionRows && sessionRows.length; else sessionsEmpty">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-[#FAFAFA] border-b border-border">
                    <th class="py-3 px-4 text-[13px] font-semibold text-muted uppercase tracking-wide">Session</th>
                    <th class="py-3 px-4 text-[13px] font-semibold text-muted uppercase tracking-wide">Architecture</th>
                    <th class="py-3 px-4 text-[13px] font-semibold text-muted uppercase tracking-wide">Calls</th>
                    <th class="py-3 px-4 text-[13px] font-semibold text-muted uppercase tracking-wide">Avg latency</th>
                    <th class="py-3 px-4 text-[13px] font-semibold text-muted uppercase tracking-wide">P95 latency</th>
                    <th class="py-3 px-4 text-[13px] font-semibold text-muted uppercase tracking-wide">Version</th>
                    <th class="py-3 px-4 text-[13px] font-semibold text-muted uppercase tracking-wide">Status</th>
                    <th class="py-3 px-4 text-[13px] font-semibold text-muted uppercase tracking-wide text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border text-[15px]">
                  <tr *ngFor="let s of sessionRows" class="hover:bg-[#F9FAFB] transition-colors">
                    <td class="py-4 px-4">
                      <span class="font-medium">{{ s.name }}</span>
                    </td>
                    <td class="py-4 px-4">
                      <span
                        class="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold"
                        [style.background]="getArchBg(s.architecture)"
                        [style.color]="getArchColor(s.architecture)"
                      >
                        {{ s.architecture }}
                      </span>
                    </td>
                    <td class="py-4 px-4 font-mono">{{ s.call_count }}</td>
                    <td class="py-4 px-4 font-mono">{{ s.avg_latency_ms }} ms</td>
                    <td class="py-4 px-4 font-mono">{{ s.p95 }} ms</td>
                    <td class="py-4 px-4 font-mono text-[13px]">—</td>
                    <td class="py-4 px-4">
                      <span class="badge-active">
                        <span class="w-[6px] h-[6px] rounded-full bg-success"></span>
                        {{ s.status }}
                      </span>
                    </td>
                    <td class="py-4 px-4 text-right">
                      <a routerLink="/predict" [queryParams]="{ session: s.name }" class="text-[14px] font-medium text-primary hover:underline">Predict &rarr;</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </ng-container>

            <ng-template #sessionsEmpty>
              <div class="py-20 flex flex-col items-center justify-center text-center">
                <svg class="w-12 h-12 text-[#E5E7EB] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4">
                  </path>
                </svg>
                <h3 class="text-xl font-bold mb-2">No sessions yet</h3>
                <p class="text-muted mb-6">Instantiate your first ML inference session to see it here.</p>
                <button class="btn-primary" routerLink="/sessions">Create first session &rarr;</button>
              </div>
            </ng-template>
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
                   <span class="bg-[#F3F4F6] border border-border text-primary px-2 py-0.5 rounded text-xs font-semibold">{{ call.result?.prediction?.label ?? call.result?.label }}</span>
                   <span class="text-muted">{{ call.result?.prediction?.confidence ?? call.result?.score }}</span>
                   <span class="ml-auto text-success font-semibold">{{ call.result?.latency_ms ?? call.result?.latency }}ms</span>
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
    sessionRows: any[] = [];
    recentCalls: any[] = [];
    activeSessions = 0;
    totalCalls = 0;
    avgLatency = 0;
    successRate = 99.2;
    sub?: Subscription;

    get archCounts(): { linear: number; mlp: number; attention: number; autoencoder: number } {
      const a = (this.sessions ?? []).map(s => s.stats?.architecture || 'linear');
      return {
        linear: a.filter(x => x === 'linear').length,
        mlp: a.filter(x => x === 'mlp').length,
        attention: a.filter(x => x === 'attention').length,
        autoencoder: a.filter(x => x === 'autoencoder').length,
      };
    }

    getArchBg(arch: string): string { return ARCH_COLORS[arch || 'linear']?.bg ?? ARCH_COLORS['linear'].bg; }
    getArchColor(arch: string): string { return ARCH_COLORS[arch || 'linear']?.text ?? ARCH_COLORS['linear'].text; }

    constructor(
        private metricsService: MetricsService,
        private apiService: ApiService,
        private notify: NotificationService
    ) { }

    ngOnInit() {
        this.loadData();
        this.sub = this.metricsService.metrics$.subscribe(data => {
            if (data) {
                this.metrics = data;
                this.recentCalls = data.recent_calls || [];
            }
        });
    }

    ngOnDestroy() {
        if (this.sub) this.sub.unsubscribe();
    }

    async loadData(): Promise<void> {
      try {
        const [sessionsRes, metricsRes] = await Promise.all([
          this.apiService.getSessions(),
          this.apiService.getMetrics()
        ]);
        this.sessions = sessionsRes?.sessions ?? [];
        this.activeSessions = this.sessions.length;
        this.totalCalls = this.sessions.reduce(
          (sum: number, s: any) => sum + (s?.stats?.call_count ?? 0), 0
        );
        this.avgLatency = metricsRes?.avg_latency_ms ?? 0;
        this.successRate = metricsRes?.success_rate ?? 99.2;
        this.sessionRows = this.sessions.map((s: any) => ({
          name: s.name,
          architecture: s.model_config?.architecture ?? s.stats?.architecture ?? 'linear',
          call_count: s.stats?.call_count ?? 0,
          avg_latency_ms: s.stats?.avg_latency_ms ?? 0,
          p95: s.stats?.latency_stats?.p95 ?? 0,
          status: s.status ?? 'active',
        }));
      } catch (e) {
        console.error('Dashboard error:', e);
      }
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
