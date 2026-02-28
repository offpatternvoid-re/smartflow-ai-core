import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { ApiService } from '../../services/api.service';

Chart.register(...registerables);

const ARCH_CHART_COLORS: Record<string, string> = {
  linear: '#3B82F6',
  mlp: '#10B981',
  attention: '#F97316',
  autoencoder: '#A855F7',
};

@Component({
    selector: 'app-analytics',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="max-w-[1200px] mx-auto px-6 py-12">
      <div class="flex items-center justify-between mb-10">
        <div>
           <div class="text-[14px] text-muted mb-4 font-medium">SmartFlow AI <span class="mx-2">&rsaquo;</span> Analytics</div>
           <h1 class="text-[32px] font-bold tracking-tight">Analytics</h1>
        </div>
        
        <div class="flex gap-1 p-1 bg-[#FAFAFA] border border-border rounded-lg inline-flex">
           <button
             *ngFor="let r of ranges"
             (click)="onRangeChange(r)"
             [class.bg-primary]="range === r"
             [class.text-white]="range === r"
             [class.text-muted]="range !== r"
             class="px-4 py-1.5 rounded text-[13px] font-bold transition-colors"
           >
              {{ r }}
           </button>
        </div>
      </div>

      <!-- Row 1: Architecture donut + Latency by session -->
      <div class="flex flex-col lg:flex-row gap-6 mb-6">
         <div class="flex-[2] card min-h-[320px]">
            <h3 class="text-[16px] font-bold tracking-tight mb-6">Architecture usage</h3>
            <div class="h-[260px]">
               <canvas #archChart></canvas>
            </div>
         </div>
         <div class="flex-[4] card min-h-[320px]">
            <h3 class="text-[16px] font-bold tracking-tight mb-6">Latency by session (avg ms)</h3>
            <div class="h-[260px]">
               <canvas #latencyBarChart></canvas>
            </div>
         </div>
      </div>

      <!-- Row 2: Latency over time + Calls per session -->
      <div class="flex flex-col lg:flex-row gap-6 mb-6">
         <div class="flex-[6] card min-h-[400px]">
            <h3 class="text-[16px] font-bold tracking-tight mb-6">Calls over time</h3>
            <div class="h-[300px]">
               <canvas #latencyChart></canvas>
            </div>
         </div>
         <div class="flex-[4] card min-h-[400px]">
            <h3 class="text-[16px] font-bold tracking-tight mb-6">Calls per Session</h3>
            <div class="h-[300px]">
               <canvas #callsChart></canvas>
            </div>
         </div>
      </div>

      <!-- Second Row -->
      <div class="flex flex-col lg:flex-row gap-6">
         <!-- Top 5 Sessions -->
         <div class="flex-[6] card">
            <h3 class="text-[16px] font-bold tracking-tight mb-6">Top 5 Sessions</h3>
            <div class="overflow-x-auto">
               <table class="w-full text-left">
                  <thead>
                     <tr class="border-b border-border text-muted text-[12px] uppercase">
                        <th class="py-3 font-semibold">#</th>
                        <th class="py-3 font-semibold">Name</th>
                        <th class="py-3 font-semibold">Calls</th>
                        <th class="py-3 font-semibold">Avg Latency</th>
                        <th class="py-3 font-semibold">Success %</th>
                     </tr>
                  </thead>
                  <tbody class="divide-y divide-border text-[14px]">
                     <tr *ngFor="let s of topSessions; let i = index">
                        <td class="py-4 text-muted">{{ i + 1 }}</td>
                        <td class="py-4 font-medium max-w-[150px] truncate group">
                           {{ s.name }}
                        </td>
                        <td class="py-4 font-mono">{{ s.stats?.call_count || 0 }}</td>
                        <td class="py-4 font-mono">{{ s.stats?.avg_latency_ms || 0 }}ms</td>
                        <td class="py-4 font-mono font-semibold text-success">
                          {{ metrics?.success_rate || 99.2 }}%
                        </td>
                     </tr>
                  </tbody>
               </table>
            </div>
         </div>

         <!-- Performance Summary -->
         <div class="flex-[4] card">
            <h3 class="text-[16px] font-bold tracking-tight mb-6">Performance Summary</h3>
            
            <div class="flex items-center justify-between mb-8 p-4 bg-[#FAFAFA] border border-border rounded-lg text-center shadow-sm">
               <div class="px-2">
                  <div class="text-[12px] text-muted font-bold uppercase mb-1">P50</div>
                  <div class="font-mono text-primary font-bold text-[18px]">{{ metrics?.p50_latency_ms || 0 }}ms</div>
               </div>
               <div class="w-[1px] h-10 bg-border"></div>
               <div class="px-2">
                  <div class="text-[12px] text-muted font-bold uppercase mb-1">P95</div>
                  <div class="font-mono text-primary font-bold text-[18px]">{{ metrics?.p95_latency_ms || 0 }}ms</div>
               </div>
               <div class="w-[1px] h-10 bg-border"></div>
               <div class="px-2">
                  <div class="text-[12px] text-muted font-bold uppercase mb-1">P99</div>
                  <div class="font-mono text-primary font-bold text-[18px]">{{ metrics?.p99_latency_ms || 0 }}ms</div>
               </div>
            </div>

            <div class="space-y-6" *ngIf="classDistribution && classDistribution.length">
               <div *ngFor="let item of classDistribution" class="flex justify-between items-center gap-2">
                  <span class="text-[14px] font-semibold truncate">{{ item.label }}</span>
                  <span class="text-[14px] font-mono">{{ item.pct }}%</span>
                  <div class="flex-1 min-w-0 max-w-[120px] h-2.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                     <div class="h-full bg-[#0A0A0A] rounded-full" [style.width.%]="item.pct"></div>
                  </div>
               </div>
            </div>
            <p *ngIf="!classDistribution?.length" class="text-[14px] text-muted">Run predictions to see class distribution.</p>
         </div>
      </div>
    </div>
  `
})
export class AnalyticsComponent implements AfterViewInit {
    ranges = ['1h', '6h', '24h', '7d'];
    range = '24h';
    metrics: any = null;
    sessions: any[] = [];
    topSessions: any[] = [];
    classDistribution: { label: string; count: number; pct: number }[] = [];
    private recentCalls: any[] = [];
    private historyCalls: any[] = [];
    private latencyChartInstance?: Chart;
    private callsChartInstance?: Chart;
    private archChartInstance?: Chart;
    private latencyBarChartInstance?: Chart;

    @ViewChild('latencyChart') latencyChart!: ElementRef<HTMLCanvasElement>;
    @ViewChild('callsChart') callsChart!: ElementRef<HTMLCanvasElement>;
    @ViewChild('archChart') archChart!: ElementRef<HTMLCanvasElement>;
    @ViewChild('latencyBarChart') latencyBarChart!: ElementRef<HTMLCanvasElement>;

    constructor(private api: ApiService) { }

    async ngAfterViewInit() {
        await this.loadData();
    }

    getArchColor(arch: string): string {
      const map: Record<string, string> = {
        linear: '#3B82F6',
        mlp: '#10B981',
        attention: '#F97316',
        autoencoder: '#A855F7',
      };
      return map[arch] ?? '#6B7280';
    }

    async loadData() {
        try {
            const [metrics, sessionsRes, historyRes] = await Promise.all([
                this.api.getMetrics(),
                this.api.getSessions(),
                this.api.getMetricsHistory(100).catch(() => ({ calls: [] }))
            ]);
            this.metrics = metrics;
            this.sessions = sessionsRes.sessions || [];
            this.topSessions = [...this.sessions]
                .sort((a, b) => (b.stats?.call_count || 0) - (a.stats?.call_count || 0))
                .slice(0, 5);
            this.recentCalls = metrics.recent_calls || [];
            this.historyCalls = historyRes?.calls || [];
            this.buildClassDistribution();
            this.buildCharts();
        } catch (err) {
            console.error('Failed to load analytics data', err);
        }
    }

    private buildClassDistribution() {
        const all = [...this.recentCalls, ...this.historyCalls];
        const labelCount: Record<string, number> = {};
        for (const c of all) {
            const label = c.result?.prediction?.label ?? c.result?.label ?? 'unknown';
            labelCount[label] = (labelCount[label] || 0) + 1;
        }
        const total = Object.values(labelCount).reduce((a, b) => a + b, 0);
        this.classDistribution = total > 0
            ? Object.entries(labelCount).map(([label, count]) => ({
                label,
                count,
                pct: Math.round((count / total) * 100)
            })).sort((a, b) => b.count - a.count)
            : [];
    }

    onRangeChange(r: string) {
        this.range = r;
        this.buildCharts();
    }

    private buildCharts() {
        this.buildArchChart();
        this.buildLatencyBarChart();
        this.buildLatencyChart();
        this.buildCallsChart();
    }

    private buildArchChart() {
        if (this.archChartInstance) this.archChartInstance.destroy();
        const counts: Record<string, number> = { linear: 0, mlp: 0, attention: 0, autoencoder: 0 };
        for (const s of this.sessions) {
            const a = s.stats?.architecture || 'linear';
            if (counts[a] !== undefined) counts[a]++;
        }
        const labels = Object.keys(counts).filter(k => counts[k] > 0);
        const data = labels.map(k => counts[k]);
        const colors = labels.map(k => ARCH_CHART_COLORS[k] || '#9CA3AF');
        this.archChartInstance = new Chart(this.archChart.nativeElement, {
            type: 'doughnut',
            data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0 }] },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    private buildLatencyBarChart() {
        if (this.latencyBarChartInstance) this.latencyBarChartInstance.destroy();
        const labels = this.sessions.map(s => s.name);
        const data = this.sessions.map(s => s.stats?.avg_latency_ms || 0);
        const colors = this.sessions.map((s: any) =>
          this.getArchColor(s.model_config?.architecture ?? s.stats?.architecture ?? 'linear')
        );
        this.latencyBarChartInstance = new Chart(this.latencyBarChart.nativeElement, {
            type: 'bar',
            data: {
                labels,
                datasets: [{ data, backgroundColor: colors, borderRadius: 4, barPercentage: 0.6 }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: {
                    x: { min: 0, grid: { color: '#E5E7EB' } },
                    y: { grid: { display: false } }
                }
            }
        });
    }

    private buildLatencyChart() {
        const windowSeconds = this.rangeToSeconds(this.range);
        const cutoff = (Date.now() / 1000) - windowSeconds;
        const points = (this.historyCalls || []).filter((c: any) => (c.ts ?? 0) >= cutoff);
        const byMinute: Record<string, number> = {};
        for (const c of points) {
            const ts = c.ts ?? 0;
            const key = new Date(ts * 1000).toISOString().slice(0, 16);
            byMinute[key] = (byMinute[key] || 0) + 1;
        }
        const sorted = Object.entries(byMinute).sort(([a], [b]) => a.localeCompare(b)).slice(-24);
        const labels = sorted.map(([k]) => k.slice(11, 16));
        const data = sorted.map(([, v]) => v);

        if (this.latencyChartInstance) this.latencyChartInstance.destroy();
        this.latencyChartInstance = new Chart(this.latencyChart.nativeElement, {
            type: 'line',
            data: {
                labels: labels.length ? labels : ['-'],
                datasets: [{
                    data: data.length ? data : [0],
                    borderColor: '#0A0A0A',
                    backgroundColor: 'rgba(10, 10, 10, 0.04)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { mode: 'index' } },
                scales: {
                    x: { grid: { display: false } },
                    y: { min: 0, grid: { color: '#E5E7EB' } }
                }
            }
        });
    }

    private buildCallsChart() {
        if (this.callsChartInstance) this.callsChartInstance.destroy();
        const labels = this.sessions.map(s => s.name);
        const data = this.sessions.map(s => s.stats?.call_count || 0);
        const colors = this.sessions.map((s: any) =>
          this.getArchColor(s.model_config?.architecture ?? s.stats?.architecture ?? 'linear')
        );
        this.callsChartInstance = new Chart(this.callsChart.nativeElement, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors,
                    borderRadius: 4,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: '#E5E7EB' } },
                    y: { grid: { display: false } }
                }
            }
        });
    }

    private rangeToSeconds(r: string): number {
        switch (r) {
            case '1h': return 3600;
            case '6h': return 6 * 3600;
            case '24h': return 24 * 3600;
            case '7d': return 7 * 24 * 3600;
            default: return 24 * 3600;
        }
    }
}
