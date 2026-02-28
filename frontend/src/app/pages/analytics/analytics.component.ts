import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

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
        
        <div class="flex gap-1 p-1 bg-[#FAFAFA] border border-border rounded-lg inline-flex shadow-sm">
           <button *ngFor="let r of ranges" (click)="range = r" [class.bg-primary]="range === r" [class.text-white]="range === r" [class.shadow-sm]="range === r" [class.text-muted]="range !== r" class="px-4 py-1.5 rounded text-[13px] font-bold transition-colors">
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
                     <tr *ngFor="let i of [1,2,3,4,5]">
                        <td class="py-4 text-muted">{{ i }}</td>
                        <td class="py-4 font-medium max-w-[150px] truncate group">
                           session_model_v{{ i }}
                        </td>
                        <td class="py-4 font-mono">{{ 1000 - i * 150 }}</td>
                        <td class="py-4 font-mono">{{ 40 + i * 10 }}ms</td>
                        <td class="py-4 font-mono font-semibold" [class.text-success]="i < 4" [class.text-yellow-600]="i >= 4">9{{ 9 - i }}.2%</td>
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
                  <div class="font-mono text-primary font-bold text-[18px]">42ms</div>
               </div>
               <div class="w-[1px] h-10 bg-border"></div>
               <div class="px-2">
                  <div class="text-[12px] text-muted font-bold uppercase mb-1">P95</div>
                  <div class="font-mono text-primary font-bold text-[18px]">89ms</div>
               </div>
               <div class="w-[1px] h-10 bg-border"></div>
               <div class="px-2">
                  <div class="text-[12px] text-muted font-bold uppercase mb-1">P99</div>
                  <div class="font-mono text-primary font-bold text-[18px]">134ms</div>
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

    @ViewChild('latencyChart') latencyChart!: ElementRef;
    @ViewChild('callsChart') callsChart!: ElementRef;

    ngAfterViewInit() {
        new Chart(this.latencyChart.nativeElement, {
            type: 'line',
            data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
                datasets: [{
                    label: 'NLP Session',
                    data: [45, 52, 38, 42, 60, 48, 46],
                    borderColor: '#0A0A0A',
                    backgroundColor: 'rgba(10, 10, 10, 0.05)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6
                }, {
                    label: 'Vision Session',
                    data: [80, 85, 76, 90, 82, 78, 81],
                    borderColor: '#9CA3AF',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { min: 0, grid: { color: '#E5E7EB' }, border: { dash: [4, 4] } }
                }
            }
        });

        new Chart(this.callsChart.nativeElement, {
            type: 'bar',
            data: {
                labels: ['NLP Session', 'Vision Model', 'Categorizer', 'Spam Filter'],
                datasets: [{
                    data: [4200, 2800, 1900, 850],
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
                    x: { grid: { color: '#E5E7EB' }, border: { dash: [4, 4] } },
                    y: { grid: { display: false } }
                }
            }
        });
    }
}
