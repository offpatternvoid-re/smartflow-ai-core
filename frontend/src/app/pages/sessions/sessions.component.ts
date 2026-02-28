import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

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

      <!-- Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <div *ngFor="let s of sessions" class="card flex flex-col">
            <div class="flex items-center justify-between mb-6">
               <h3 class="text-[20px] font-bold tracking-tight">{{ s.name }}</h3>
               <span class="badge-active"><span class="w-[6px] h-[6px] rounded-full bg-success"></span> active</span>
            </div>

            <div class="space-y-3 mb-6">
              <div class="flex justify-between text-[13px] text-muted">
                <span>Calls</span>
                <span class="font-mono text-[14px] text-primary">{{ s.stats?.call_count || 0 }}</span>
              </div>
              <div class="flex justify-between text-[13px] text-muted">
                <span>Avg latency</span>
                <span class="font-mono text-[14px] text-primary">{{ s.stats?.avg_latency_ms || 0 }} ms</span>
              </div>
              <div class="flex justify-between text-[13px] text-muted">
                <span>Uptime</span>
                <span class="font-mono text-[14px] text-primary">{{ s.stats?.uptime_seconds || 0 }} s</span>
              </div>
            </div>

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
      <div *ngIf="showModal" class="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
         <div class="bg-white w-full max-w-[480px] rounded-modal p-[32px]">
            <h2 class="text-[24px] font-bold tracking-tight mb-8">Create new session</h2>
            
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
               <div class="mb-6">
                  <label class="block text-[14px] font-semibold text-primary mb-2">Session Name</label>
                  <input type="text" formControlName="name" placeholder="e.g. nlp_model_v1" class="w-full border border-border rounded-lg px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-[15px]">
               </div>

               <div class="mb-6">
                  <label class="block text-[14px] font-semibold text-primary mb-2">Weights size: {{ form.get('size')?.value }} MB</label>
                  <input type="range" formControlName="size" min="1" max="512" class="w-full accent-primary">
                  <div class="flex justify-between text-[12px] text-muted mt-2 font-mono">
                     <span>1</span><span>128</span><span>256</span><span>512</span>
                  </div>
               </div>

               <div class="mb-8">
                  <label class="block text-[14px] font-semibold text-primary mb-2">Activation</label>
                  <select formControlName="activation" class="w-full border border-border rounded-lg px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none bg-white text-[15px]">
                     <option value="relu">relu</option>
                     <option value="tanh">tanh</option>
                     <option value="sigmoid">sigmoid</option>
                     <option value="gelu">gelu</option>
                  </select>
               </div>

               <div class="flex items-center justify-end gap-3 mt-8 border-t border-border pt-6">
                  <button type="button" class="btn-outline" (click)="showModal = false">Cancel</button>
                  <button type="submit" [disabled]="form.invalid || loading" class="btn-primary">
                     {{ loading ? 'Creating...' : 'Create Session' }}
                  </button>
               </div>
            </form>
         </div>
      </div>
    </div>
  `
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
         activation: ['relu', Validators.required]
      });
   }

   ngOnInit() {
      this.loadSessions();
   }

   loadSessions() {
      this.api.getSessions().then(res => {
         this.sessions = res.sessions || [];
      }).catch(e => {
         this.notify.show('error', 'Failed to load sessions');
      });
   }

   getHealthColor(latency: number): string {
      if (!latency) return 'text-success';
      if (latency < 100) return 'text-success';
      if (latency < 200) return 'text-yellow-500';
      return 'text-red-500';
   }

   getHealthBgColor(latency: number): string {
      if (!latency) return 'bg-success';
      if (latency < 100) return 'bg-success';
      if (latency < 200) return 'bg-yellow-400';
      return 'bg-red-500';
   }

   getHealthLabel(latency: number): string {
      if (!latency) return 'Healthy';
      if (latency < 100) return 'Optimal';
      if (latency < 200) return 'Warning';
      return 'Critical';
   }

   async onSubmit() {
      if (this.form.invalid) return;
      this.loading = true;
      try {
         const val = this.form.value;
         await this.api.createSession(val.name, { size: Number(val.size), activation: val.activation });
         this.notify.show('success', `Session ${val.name} created!`);
         this.showModal = false;
         this.form.reset({ size: 128, activation: 'relu' });
         this.loadSessions();
      } catch (e: any) {
         this.notify.show('error', e?.error?.message || 'Error creating session');
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
