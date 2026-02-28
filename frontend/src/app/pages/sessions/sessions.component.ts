import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

const ARCH_STYLES: Record<string, { bg: string; text: string }> = {
  linear: { bg: '#EFF6FF', text: '#1D4ED8' },
  mlp: { bg: '#F0FDF4', text: '#16A34A' },
  attention: { bg: '#FFF7ED', text: '#EA580C' },
  autoencoder: { bg: '#FDF4FF', text: '#9333EA' },
};

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="max-w-[1200px] mx-auto px-6 py-12 relative">
      <div class="flex items-center justify-between mb-10">
        <div>
          <div class="text-[14px] text-muted mb-4 font-medium">SmartFlow AI <span class="mx-2">&rsaquo;</span> Sessions</div>
          <h1 class="text-[32px] font-bold tracking-tight">Sessions</h1>
        </div>
        <button class="btn-primary px-5 py-2.5" (click)="showModal = true">+ New Session</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let s of sessions" class="card flex flex-col">
          <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 class="text-[20px] font-bold tracking-tight">{{ s.name }}</h3>
            <div class="flex items-center gap-2">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                [style.background]="getArchStyle(s.stats?.architecture).bg"
                [style.color]="getArchStyle(s.stats?.architecture).text"
              >
                {{ s.stats?.architecture || 'linear' }}
              </span>
              <span class="badge-active"><span class="w-[6px] h-[6px] rounded-full bg-success"></span> active</span>
            </div>
          </div>
          <div class="space-y-2 mb-4 text-[13px] text-muted">
            <div class="flex justify-between">
              <span>Classes</span>
              <span class="font-mono text-primary">{{ s.stats?.n_classes ?? s.model_config?.n_classes ?? 2 }}</span>
            </div>
            <div class="flex justify-between">
              <span>Version</span>
              <span class="font-mono text-primary">{{ s.stats?.model_version || '—' }}</span>
            </div>
            <div class="flex justify-between">
              <span>Calls</span>
              <span class="font-mono text-primary">{{ s.stats?.call_count || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span>Avg latency</span>
              <span class="font-mono text-primary">{{ s.stats?.avg_latency_ms || 0 }} ms</span>
            </div>
            <div class="flex justify-between">
              <span>Uptime</span>
              <span class="font-mono text-primary">{{ s.stats?.uptime_seconds || 0 }} s</span>
            </div>
          </div>
          <p *ngIf="s.stats?.last_prediction as lp" class="text-[12px] text-muted mb-4 truncate" [title]="lp | json">
            Last: {{ lp.label ?? lp.class_index ?? '—' }}
          </p>
          <div class="mt-auto flex gap-3 pt-4 border-t border-border">
            <button class="btn-primary flex-1 justify-center" routerLink="/predict" [queryParams]="{session: s.name}">
              Run Inference &rarr;
            </button>
            <button class="btn-outline flex-1 justify-center text-red-600 border-red-200 hover:bg-red-50" (click)="deleteSession(s.name)">
              Delete
            </button>
          </div>
        </div>

        <div *ngIf="sessions.length === 0" class="col-span-full py-24 text-center border border-dashed border-border rounded-xl">
          <p class="text-muted text-lg">No sessions available.</p>
        </div>
      </div>

      <!-- Modal -->
      <div *ngIf="showModal" class="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
        <div class="bg-white w-full max-w-[520px] rounded-[16px] p-[32px] my-8">
          <h2 class="text-[24px] font-bold tracking-tight mb-8">Create new session</h2>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="mb-5">
              <label class="block text-[14px] font-semibold text-primary mb-2">Session Name</label>
              <input type="text" formControlName="name" placeholder="e.g. sentiment_v2" class="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 outline-none focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] text-[15px]">
            </div>

            <div class="mb-5">
              <label class="block text-[14px] font-semibold text-primary mb-2">Architecture</label>
              <select formControlName="architecture" class="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 outline-none focus:border-[#0A0A0A] appearance-none bg-white text-[15px]">
                <option value="linear">linear — fast</option>
                <option value="mlp">mlp — deeper</option>
                <option value="attention">attention — transformer-like</option>
                <option value="autoencoder">autoencoder — anomaly</option>
              </select>
            </div>

            <div class="mb-5">
              <label class="block text-[14px] font-semibold text-primary mb-2">N Classes</label>
              <select formControlName="n_classes" [disabled]="form.get('architecture')?.value === 'autoencoder'" class="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 outline-none focus:border-[#0A0A0A] appearance-none bg-white text-[15px] disabled:opacity-60">
                <option [value]="2">2</option>
                <option [value]="3">3</option>
                <option [value]="4">4</option>
                <option [value]="5">5</option>
              </select>
              <p *ngIf="form.get('architecture')?.value === 'autoencoder'" class="text-[12px] text-muted mt-1">Disabled for autoencoder (anomaly detection).</p>
            </div>

            <div class="mb-5">
              <label class="block text-[14px] font-semibold text-primary mb-2">Size (input dim)</label>
              <input type="range" formControlName="size" min="1" max="512" class="w-full accent-[#0A0A0A]">
              <p class="text-[12px] text-muted mt-1">{{ form.get('size')?.value }}</p>
            </div>

            <div class="mb-5">
              <label class="block text-[14px] font-semibold text-primary mb-2">Activation</label>
              <select formControlName="activation" class="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 outline-none focus:border-[#0A0A0A] appearance-none bg-white text-[15px]">
                <option value="relu">relu</option>
                <option value="tanh">tanh</option>
                <option value="sigmoid">sigmoid</option>
                <option value="gelu">gelu</option>
              </select>
            </div>

            <div class="mb-5 flex items-center gap-3">
              <input type="checkbox" formControlName="normalize" id="normalize" class="w-4 h-4 rounded border-[#E5E7EB]">
              <label for="normalize" class="text-[14px] font-medium text-primary">Normalize inputs (Z-score)</label>
            </div>

            <div class="mb-5">
              <label class="block text-[14px] font-semibold text-primary mb-2">Seed</label>
              <input type="number" formControlName="seed" min="0" class="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 outline-none focus:border-[#0A0A0A] text-[15px]">
            </div>

            <div class="mb-8">
              <label class="block text-[14px] font-semibold text-primary mb-2">Description (optional)</label>
              <input type="text" formControlName="description" placeholder="e.g. 3-class sentiment with attention" class="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 outline-none focus:border-[#0A0A0A] text-[15px]">
            </div>

            <div class="flex items-center justify-end gap-3 border-t border-[#E5E7EB] pt-6">
              <button type="button" class="btn-outline" (click)="showModal = false">Cancel</button>
              <button type="submit" [disabled]="form.invalid || loading" class="btn-primary">
                {{ loading ? 'Creating...' : 'Create Session' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class SessionsComponent implements OnInit {
  sessions: any[] = [];
  showModal = false;
  loading = false;
  form: FormGroup;

  constructor(
    private api: ApiService,
    private notify: NotificationService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      size: [128, Validators.required],
      activation: ['relu', Validators.required],
      architecture: ['linear', Validators.required],
      n_classes: [2, Validators.required],
      normalize: [true],
      seed: [42, Validators.required],
      description: [''],
    });
  }

  ngOnInit() {
    this.loadSessions();
  }

  getArchStyle(arch: string): { bg: string; text: string } {
    return ARCH_STYLES[arch || 'linear'] ?? ARCH_STYLES['linear'];
  }

  loadSessions() {
    this.api.getSessions().then(res => {
      this.sessions = (res.sessions || []).map((s: any) => ({
        ...s,
        call_count: s.stats?.call_count ?? 0,
        avg_latency_ms: s.stats?.avg_latency_ms ?? 0,
        architecture: s.model_config?.architecture ?? s.stats?.architecture ?? 'linear',
        n_classes: s.model_config?.n_classes ?? s.stats?.n_classes ?? 2,
      }));
    }).catch(() => {
      this.notify.show('error', 'Failed to load sessions');
    });
  }

  async onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    try {
      const val = this.form.value;
      await this.api.createSession(val.name, {
        size: Number(val.size),
        activation: val.activation,
        architecture: val.architecture,
        n_classes: Number(val.n_classes),
        normalize: val.normalize,
        warmup: 5,
        seed: Number(val.seed) || 42,
        description: val.description || '',
      });
      this.notify.show('success', `Session "${val.name}" created!`);
      this.showModal = false;
      this.form.reset({ size: 128, activation: 'relu', architecture: 'linear', n_classes: 2, normalize: true, seed: 42 });
      this.loadSessions();
    } catch (e: any) {
      this.notify.show('error', e?.error?.error || e?.error?.message || 'Error creating session');
    } finally {
      this.loading = false;
    }
  }

  deleteSession(name: string) {
    if (!confirm(`Delete ${name}?`)) return;
    this.api.deleteSession(name).then(() => {
      this.notify.show('success', `Deleted ${name}`);
      this.loadSessions();
    }).catch(e => {
      this.notify.show('error', 'Delete failed');
    });
  }
}
