import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { ApiService } from '../../services/api.service';

Chart.register(...registerables);

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

      <!-- First Row: Charts -->
      <div class="flex flex-col lg:flex-row gap-6 mb-6">
         <!-- Latency Over Time -->
         <div class="flex-[6] card min-h-[400px]">
            <h3 class="text-[16px] font-bold tracking-tight mb-6">Latency Over Time</h3>
            <div class="h-[300px]">
               <canvas #latencyChart></canvas>
            </div>
         </div>

         <!-- Calls per Session -->
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

            <div class="space-y-6">
               <div>
                  <div class="flex justify-between text-[14px] font-semibold mb-3">
                     <span>Positive Label</span>
                     <span>62%</span>
                  </div>
                  <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-[#E5E7EB]">
                     <div class="h-full bg-primary rounded-full w-[62%]"></div>
                  </div>
               </div>
               
               <div>
                  <div class="flex justify-between text-[14px] font-semibold mb-3">
                     <span>Negative Label</span>
                     <span>38%</span>
                  </div>
                  <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-[#E5E7EB]">
                     <div class="h-full bg-slate-400 rounded-full w-[38%]"></div>
                  </div>
               </div>
            </div>
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
    private recentCalls: any[] = [];
    private latencyChartInstance?: Chart;
    private callsChartInstance?: Chart;

    @ViewChild('latencyChart') latencyChart!: ElementRef<HTMLCanvasElement>;
    @ViewChild('callsChart') callsChart!: ElementRef<HTMLCanvasElement>;

    constructor(private api: ApiService) { }

    async ngAfterViewInit() {
        await this.loadData();
    }

    async loadData() {
        try {
            const [metrics, sessionsRes] = await Promise.all([
                this.api.getMetrics(),
                this.api.getSessions()
            ]);
            this.metrics = metrics;
            this.sessions = sessionsRes.sessions || [];
            this.topSessions = [...this.sessions]
                .sort((a, b) => (b.stats?.call_count || 0) - (a.stats?.call_count || 0))
                .slice(0, 5);
            this.recentCalls = metrics.recent_calls || [];
            this.buildCharts();
        } catch (err) {
            console.error('Failed to load analytics data', err);
        }
    }

    onRangeChange(r: string) {
        this.range = r;
        this.buildCharts();
    }

    private buildCharts() {
        this.buildLatencyChart();
        this.buildCallsChart();
    }

    private buildLatencyChart() {
        const nowSec = Date.now() / 1000;
        const windowSeconds = this.rangeToSeconds(this.range);
        const cutoff = nowSec - windowSeconds;
        const points = (this.recentCalls || []).filter((c: any) => (c.ts ?? 0) >= cutoff);

        const labels = points.map((c: any) =>
            new Date((c.ts ?? nowSec) * 1000).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        );
        const data = points.map((c: any) => c.result?.latency_ms ?? c.result?.latency ?? 0);

        if (this.latencyChartInstance) {
            this.latencyChartInstance.destroy();
        }

        const hasData = data.length > 0;
        const chartData = hasData ? data : [0, 0, 0, 0];
        const chartLabels = hasData ? labels : ['-', '-', '-', '-'];

        this.latencyChartInstance = new Chart(this.latencyChart.nativeElement, {
            type: 'line',
            data: {
                labels: chartLabels,
                datasets: [{
                    data: chartData,
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
                plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { min: 0, grid: { color: '#E5E7EB' } }
                }
            }
        });
    }

    private buildCallsChart() {
        if (this.callsChartInstance) {
            this.callsChartInstance.destroy();
        }
        const labels = this.sessions.map(s => s.name);
        const data = this.sessions.map(s => s.stats?.call_count || 0);

        this.callsChartInstance = new Chart(this.callsChart.nativeElement, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: '#0A0A0A',
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
