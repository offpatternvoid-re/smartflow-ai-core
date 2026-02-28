import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-predict',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="max-w-[1400px] mx-auto min-h-[calc(100vh-56px)] grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E7EB]">
      <!-- Left: Form -->
      <div class="p-8 lg:p-12 lg:pr-16 bg-white">
        <h2 class="text-[32px] font-bold tracking-tight mb-8">Run Inference</h2>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="mb-6">
            <label class="block text-[14px] font-semibold text-[#0A0A0A] mb-2">Select Session</label>
            <select formControlName="session_name" class="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 outline-none focus:border-[#0A0A0A] appearance-none bg-white text-[15px]">
              <option value="" disabled>Select a session</option>
              <option *ngFor="let s of sessions" [value]="s.name">{{ s.name }}</option>
            </select>
          </div>

          <div class="mb-6">
            <label class="block text-[14px] font-semibold text-[#0A0A0A] mb-2">Compare with (optional)</label>
            <select formControlName="compare_session" class="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 outline-none focus:border-[#0A0A0A] appearance-none bg-white text-[15px]">
              <option value="">— None —</option>
              <option *ngFor="let s of sessions" [value]="s.name">{{ s.name }}</option>
            </select>
          </div>

          <div class="mb-6">
            <label class="block text-[14px] font-semibold text-[#0A0A0A] mb-2">Mode</label>
            <div class="flex gap-2 p-1 bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg inline-flex">
              <button type="button" class="px-6 py-2 rounded-md text-[14px] font-medium transition-colors"
                [class.bg-white]="mode === 'single'" [class.shadow-sm]="mode === 'single'" [class.text-[#0A0A0A]]="mode === 'single'"
                [class.text-[#6B7280]]="mode !== 'single'" (click)="mode = 'single'">Single</button>
              <button type="button" class="px-6 py-2 rounded-md text-[14px] font-medium transition-colors"
                [class.bg-white]="mode === 'batch'" [class.shadow-sm]="mode === 'batch'" [class.text-[#0A0A0A]]="mode === 'batch'"
                [class.text-[#6B7280]]="mode !== 'batch'" (click)="mode = 'batch'">Batch</button>
            </div>
          </div>

          <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <label class="block text-[14px] font-semibold text-[#0A0A0A]">Input Vector</label>
              <button *ngIf="mode === 'single'" type="button" class="text-[13px] text-[#0A0A0A] hover:underline font-medium" (click)="generateRandom()">Generate random</button>
            </div>
            <textarea formControlName="inputs" rows="4"
              [placeholder]="mode === 'single' ? '[0.5, -1.2, 3.4, 0.8]' : '[[0.5, -1.2], [0.8, 2.1]]'"
              class="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 outline-none focus:border-[#0A0A0A] font-mono text-[14px] resize-none"></textarea>
          </div>

          <div class="flex flex-wrap gap-3">
            <button type="submit" [disabled]="form.invalid || loading" class="btn-primary">
              &#9654; Run Inference
            </button>
            <button type="button" class="btn-outline" [disabled]="!form.value.session_name || benchmarkLoading" (click)="runBenchmark()">
              {{ benchmarkLoading ? 'Running...' : 'Run Benchmark' }}
            </button>
            <button type="button" class="btn-outline" *ngIf="form.value.compare_session && form.value.session_name !== form.value.compare_session" [disabled]="form.invalid || loading" (click)="runCompare()">
              Compare &#8594;
            </button>
          </div>
        </form>

        <!-- Benchmark result card -->
        <div *ngIf="benchmarkResult" class="mt-8 card">
          <h3 class="text-[16px] font-bold mb-4">Benchmark</h3>
          <div class="grid grid-cols-2 gap-4 text-[14px]">
            <div><span class="text-[#6B7280]">Throughput</span><br><span class="font-mono font-semibold">{{ benchmarkResult.throughput_rps }} rps</span></div>
            <div><span class="text-[#6B7280]">Total time</span><br><span class="font-mono font-semibold">{{ benchmarkResult.total_time_ms }} ms</span></div>
            <div><span class="text-[#6B7280]">P50</span><br><span class="font-mono font-semibold">{{ benchmarkResult.latency?.p50 }} ms</span></div>
            <div><span class="text-[#6B7280]">P95</span><br><span class="font-mono font-semibold">{{ benchmarkResult.latency?.p95 }} ms</span></div>
            <div><span class="text-[#6B7280]">P99</span><br><span class="font-mono font-semibold">{{ benchmarkResult.latency?.p99 }} ms</span></div>
          </div>
        </div>

        <!-- Compare result -->
        <div *ngIf="compareResult" class="mt-8 card">
          <h3 class="text-[16px] font-bold mb-4">Compare</h3>
          <div class="flex items-center gap-4 mb-4">
            <span class="font-medium">{{ compareResult.session_a?.name }}: {{ compareResult.session_a?.result?.prediction?.label }}</span>
            <span class="font-medium">{{ compareResult.session_b?.name }}: {{ compareResult.session_b?.result?.prediction?.label }}</span>
            <span class="inline-flex px-2.5 py-0.5 rounded-full text-[12px] font-semibold"
              [class.bg-[#F0FDF4]]="compareResult.agreement" [class.text-[#16A34A]]="compareResult.agreement"
              [class.bg-[#FEF2F2]]="!compareResult.agreement" [class.text-[#DC2626]]="!compareResult.agreement">
              {{ compareResult.agreement ? 'Agree' : 'Disagree' }}
            </span>
          </div>
          <p class="text-[14px] text-[#6B7280]">Latency diff: {{ compareResult.latency_diff_ms }} ms</p>
        </div>
      </div>

      <!-- Right: Results -->
      <div class="p-8 lg:p-12 lg:pl-16 bg-[#FAFAFA] flex flex-col min-h-[500px]">
        <div class="flex-1 flex flex-col min-h-[500px] bg-white border border-border rounded-xl overflow-hidden">

          <div *ngIf="loading" class="flex-1 flex flex-col items-center justify-center gap-4 p-8">
            <div class="w-10 h-10 border-2 border-[#E5E7EB] border-t-[#0A0A0A] rounded-full animate-spin"></div>
            <p class="text-[14px] text-muted">Running inference...</p>
          </div>

          <div *ngIf="!loading && error" class="flex-1 flex items-start p-6">
            <div class="w-full p-4 bg-red-50 border border-red-200 rounded-xl">
              <p class="text-[13px] font-semibold text-red-700 mb-1">Error</p>
              <p class="text-[12px] text-red-600 font-mono break-all">{{ error }}</p>
            </div>
          </div>

          <div *ngIf="!loading && !error && !result"
               class="flex-1 flex flex-col items-center justify-center gap-3 text-muted p-8">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="14" width="32" height="22" rx="4" stroke="#E5E7EB" stroke-width="1.5"/>
              <path d="M16 24h16M16 30h10" stroke="#E5E7EB" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <p class="text-[14px] font-medium">No results yet</p>
            <p class="text-[12px]">Select a session and press Run Inference</p>
          </div>

          <div *ngIf="!loading && !error && result" class="flex-1 overflow-auto p-6 space-y-6">

            <div class="flex items-center gap-3 flex-wrap">
              <span class="text-[32px] font-bold tracking-tight">
                {{ result?.prediction?.label ?? result?.label ?? '—' }}
              </span>
              <span class="px-3 py-1 bg-[#DCFCE7] text-[#16A34A] rounded-full text-[13px] font-semibold">
                {{ ((result?.prediction?.confidence ?? result?.confidence ?? 0) * 100).toFixed(1) }}%
              </span>
              <span *ngIf="result?.is_warmup"
                    class="px-2 py-1 bg-yellow-50 text-yellow-600 border border-yellow-200 rounded-full text-[11px]">
                🔥 Warmup
              </span>
            </div>

            <div *ngIf="result?.drift?.drift_detected"
                 class="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-[13px] text-yellow-700">
              ⚠ Input distribution shifted (z={{ result.drift.drift_score }})
            </div>

            <div *ngIf="result?.prediction?.is_anomaly !== undefined"
                 class="p-4 rounded-xl border"
                 [class.bg-red-50]="result.prediction.is_anomaly"
                 [class.border-red-200]="result.prediction.is_anomaly"
                 [class.bg-green-50]="!result.prediction.is_anomaly"
                 [class.border-green-200]="!result.prediction.is_anomaly">
              <p class="font-semibold text-[14px]"
                 [class.text-red-700]="result.prediction.is_anomaly"
                 [class.text-green-700]="!result.prediction.is_anomaly">
                {{ result.prediction.is_anomaly ? '⚠ Anomaly Detected' : '✓ Normal' }}
              </p>
              <p class="text-[12px] text-muted mt-1">
                error: {{ result.prediction.reconstruction_error }}
                · score: {{ result.prediction.anomaly_score }}
              </p>
            </div>

            <div *ngIf="result?.prediction?.probabilities">
              <p class="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3">Probabilities</p>
              <div class="space-y-3">
                <div *ngFor="let item of getProbs(result.prediction.probabilities)"
                     class="flex items-center gap-3">
                  <span class="text-[12px] text-muted w-28 truncate">{{ item.label }}</span>
                  <div class="flex-1 h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div class="h-full bg-[#0A0A0A] rounded-full transition-all"
                         [style.width.%]="item.pct"></div>
                  </div>
                  <span class="text-[12px] font-mono w-14 text-right">{{ item.pct.toFixed(1) }}%</span>
                </div>
              </div>
            </div>

            <div *ngIf="result?.prediction?.attention_weight !== undefined">
              <p class="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Attention Weight</p>
              <div class="flex items-center gap-3">
                <div class="flex-1 h-2 bg-[#F3F4F6] rounded-full">
                  <div class="h-full bg-[#F97316] rounded-full"
                       [style.width.%]="result.prediction.attention_weight * 100"></div>
                </div>
                <span class="text-[12px] font-mono">{{ result.prediction.attention_weight }}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="bg-[#F9FAFB] border border-border rounded-xl p-4">
                <p class="text-[11px] text-muted mb-1">Latency</p>
                <p class="text-[22px] font-bold font-mono">{{ result.latency_ms }}<span class="text-[13px] text-muted ml-1">ms</span></p>
              </div>
              <div class="bg-[#F9FAFB] border border-border rounded-xl p-4">
                <p class="text-[11px] text-muted mb-1">P95</p>
                <p class="text-[22px] font-bold font-mono">{{ result.p95_latency_ms }}<span class="text-[13px] text-muted ml-1">ms</span></p>
              </div>
              <div class="bg-[#F9FAFB] border border-border rounded-xl p-4">
                <p class="text-[11px] text-muted mb-1">Call #</p>
                <p class="text-[22px] font-bold font-mono">{{ result.call_count }}</p>
              </div>
              <div class="bg-[#F9FAFB] border border-border rounded-xl p-4">
                <p class="text-[11px] text-muted mb-1">Architecture</p>
                <p class="text-[14px] font-semibold">{{ result.architecture }}</p>
              </div>
            </div>

            <details>
              <summary class="text-[12px] text-muted cursor-pointer hover:text-primary select-none">
                Raw JSON ↓
              </summary>
              <pre class="mt-2 bg-[#0A0A0A] text-[#4ADE80] text-[11px] font-mono p-4 rounded-xl overflow-auto max-h-64">{{ result | json }}</pre>
            </details>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  `],
})
export class PredictComponent implements OnInit {
  sessions: any[] = [];
  form: FormGroup;
  mode: 'single' | 'batch' = 'single';
  loading = false;
  benchmarkLoading = false;
  result: any = null;
  error: string = '';
  summary: any = null;
  benchmarkResult: any = null;
  compareResult: any = null;
  showHistory = false;
  historyFromApi: any[] = [];

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private notify: NotificationService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      session_name: ['', Validators.required],
      compare_session: [''],
      inputs: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.api.getSessions().then(res => {
      this.sessions = res.sessions || [];
      this.route.queryParams.subscribe(p => {
        if (p['session']) this.form.patchValue({ session_name: p['session'] });
      });
    });
    this.loadHistory();
  }

  objectKeys(obj: Record<string, unknown>): string[] {
    return obj ? Object.keys(obj) : [];
  }

  loadHistory() {
    this.api.getMetricsHistory(10).then(res => {
      this.historyFromApi = (res?.calls || []).slice(0, 10);
    }).catch(() => {});
  }

  getProbs(probs: Record<string, number>): {label: string; pct: number}[] {
    if (!probs) return [];
    return Object.entries(probs).map(([label, val]) => ({ label, pct: val * 100 }));
  }

  formatTs(ts: number): string {
    if (!ts) return '—';
    const d = new Date(ts * 1000);
    const now = Date.now() / 1000;
    const diff = Math.floor(now - ts);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return d.toLocaleTimeString();
  }

  generateRandom() {
    const s = this.sessions.find(x => x.name === this.form.value.session_name);
    const size = s?.model_config?.size ?? s?.stats?.input_dim ?? 128;
    const arr = Array.from({ length: size }, () => parseFloat((Math.random() * 2 - 1).toFixed(4)));
    this.form.patchValue({ inputs: JSON.stringify(arr) });
  }

  async onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.result = null;
    this.error = '';
    this.cdr.detectChanges();
    try {
      const data = JSON.parse(this.form.value.inputs);
      let res: any;
      if (this.mode === 'single') {
        res = await this.api.predict(this.form.value.session_name, data);
      } else {
        res = await this.api.batchPredict(this.form.value.session_name, data);
      }
      this.result = res;
      const lat = res.latency_ms ?? res.latency ?? (res.results?.[0]?.latency_ms ?? 0);
      this.summary = {
        session_name: this.form.value.session_name,
        latency_ms: lat,
        architecture: res.architecture,
        prediction: res.prediction ?? res.results?.[0],
        p50_latency_ms: res.p50_latency_ms,
        p95_latency_ms: res.p95_latency_ms,
        p99_latency_ms: res.p99_latency_ms,
        timestamp: new Date().toISOString(),
      };
      this.loadHistory();
      this.notify.show('success', 'Inference completed!');
    } catch (e: any) {
      this.error = e?.error?.error || e?.error?.message || e?.message || 'Failed';
      this.notify.show('error', this.error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async runBenchmark() {
    const name = this.form.value.session_name;
    if (!name) return;
    this.benchmarkLoading = true;
    this.benchmarkResult = null;
    try {
      this.benchmarkResult = await this.api.benchmarkSession(name, 20);
      this.notify.show('success', 'Benchmark done');
    } catch (e: any) {
      this.notify.show('error', e?.error?.error || 'Benchmark failed');
    } finally {
      this.benchmarkLoading = false;
    }
  }

  async runCompare() {
    const a = this.form.value.session_name;
    const b = this.form.value.compare_session;
    if (!a || !b || a === b) return;
    try {
      const inputs = JSON.parse(this.form.value.inputs);
      const arr = Array.isArray(inputs) && !Array.isArray(inputs[0]) ? inputs : (inputs[0] ?? inputs);
      this.loading = true;
      this.compareResult = null;
      this.compareResult = await this.api.compareSessions(a, b, arr);
      this.notify.show('success', 'Compare done');
    } catch (e: any) {
      this.notify.show('error', e?.error?.error || 'Compare failed');
    } finally {
      this.loading = false;
    }
  }
}
