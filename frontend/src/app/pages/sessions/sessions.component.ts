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
        <button class="bg-primary text-white px-5 py-2.5 rounded-pill font-semibold hover:bg-[#262626] transition shadow-sm" (click)="showModal = true">+ New Session</button>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div *ngFor="let s of sessions" class="card flex flex-col hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-6">
               <h3 class="text-[20px] font-bold tracking-tight">{{ s.name }}</h3>
               <span class="badge-active"><span class="w-[6px] h-[6px] rounded-full bg-success"></span> active</span>
            </div>
            
            <div class="grid grid-cols-3 gap-4 mb-6 text-center divide-x divide-border bg-[#FAFAFA] border border-border rounded-lg p-4">
               <div>
                  <div class="text-[12px] text-muted uppercase tracking-wide font-semibold mb-1">Calls</div>
                  <div class="font-mono font-medium text-[15px]">{{ s.stats?.call_count }}</div>
               </div>
               <div>
                  <div class="text-[12px] text-muted uppercase tracking-wide font-semibold mb-1">Avg Latency</div>
                  <div class="font-mono font-medium text-[15px]">{{ s.stats?.avg_latency_ms }}ms</div>
               </div>
               <div>
                  <div class="text-[12px] text-muted uppercase tracking-wide font-semibold mb-1">Uptime</div>
                  <div class="font-mono font-medium text-[15px]">{{ s.stats?.uptime_seconds }}s</div>
               </div>
            </div>

            <!-- Health Bar -->
            <div class="mb-6">
               <div class="text-[13px] font-medium text-muted mb-2 flex justify-between">
                  <span>Health Status</span>
                  <span [ngClass]="getHealthColor(s.stats?.avg_latency_ms)">{{ getHealthLabel(s.stats?.avg_latency_ms) }}</span>
               </div>
               <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-500" 
                       [ngClass]="getHealthBgColor(s.stats?.avg_latency_ms)"
                       [style.width.%]="100"></div>
               </div>
            </div>

            <div class="mt-auto flex gap-3 pt-4 border-t border-border">
               <button class="bg-[#FAFAFA] border border-border px-4 py-2 rounded-full text-[14px] font-semibold flex-1 hover:bg-slate-100 transition shadow-sm" routerLink="/predict" [queryParams]="{session: s.name}">&#9654; Predict</button>
               <button class="bg-[#FAFAFA] border border-border px-4 py-2 rounded-full text-[14px] font-semibold flex-1 hover:bg-slate-100 transition shadow-sm" routerLink="/analytics">Stats</button>
               <button class="bg-white border border-border px-4 py-2 rounded-full text-[14px] font-semibold text-red-600 hover:bg-red-50 transition shadow-sm" (click)="deleteSession(s.name)">&#10005; Delete</button>
            </div>
         </div>
         
         <div *ngIf="sessions.length === 0" class="col-span-full py-24 text-center border border-dashed border-border rounded-xl">
            <p class="text-muted text-lg">No sessions available.</p>
         </div>
      </div>

      <!-- Modal -->
      <div *ngIf="showModal" class="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
         <div class="bg-white w-full max-w-[500px] rounded-modal shadow-modal p-[32px] transform transition-all">
            <h2 class="text-[24px] font-bold tracking-tight mb-8">Create New Session</h2>
            
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
               <div class="mb-6">
                  <label class="block text-[14px] font-semibold text-primary mb-2">Session Name</label>
                  <input type="text" formControlName="name" placeholder="e.g. nlp_model_v1" class="w-full border border-border rounded-lg px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-[15px]">
               </div>

               <div class="mb-6">
                  <label class="block text-[14px] font-semibold text-primary mb-2">Model Size: {{ form.get('size')?.value }}</label>
                  <input type="range" formControlName="size" min="64" max="512" step="64" class="w-full accent-primary">
                  <div class="flex justify-between text-[12px] text-muted mt-2 font-mono">
                     <span>64</span><span>128</span><span>256</span><span>512</span>
                  </div>
               </div>

               <div class="mb-8">
                  <label class="block text-[14px] font-semibold text-primary mb-2">Activation</label>
                  <select formControlName="activation" class="w-full border border-border rounded-lg px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none bg-white text-[15px]">
                     <option value="relu">relu</option>
                     <option value="tanh">tanh</option>
                     <option value="sigmoid">sigmoid</option>
                  </select>
               </div>

               <div class="flex items-center justify-end gap-3 mt-8 border-t border-border pt-6">
                  <button type="button" class="px-6 py-2.5 rounded-full font-semibold text-[15px] hover:bg-slate-50 transition border border-transparent hover:border-border" (click)="showModal = false">Cancel</button>
                  <button type="submit" [disabled]="form.invalid || loading" class="bg-primary text-white px-6 py-2.5 rounded-full font-semibold text-[15px] hover:bg-[#262626] disabled:opacity-50 transition-colors shadow-sm">
                     {{ loading ? 'Creating...' : 'Create Session &rarr;' }}
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
