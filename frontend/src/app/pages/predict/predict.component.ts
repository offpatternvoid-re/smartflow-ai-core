import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-predict',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="max-w-[1400px] mx-auto min-h-[calc(100vh-56px)] grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
      
      <!-- Left Column: Form -->
      <div class="p-8 lg:p-12 lg:pr-16 bg-white">
        <h2 class="text-[32px] font-bold tracking-tight mb-8">Run Inference</h2>
        
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="mb-6">
            <label class="block text-[14px] font-semibold text-primary mb-2">Select Session</label>
            <select formControlName="session_name" class="w-full border border-border rounded-lg px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none bg-white text-[15px]">
               <option value="" disabled>Select a deployed closure</option>
               <option *ngFor="let s of sessions" [value]="s.name">{{ s.name }}</option>
            </select>
          </div>

          <div class="mb-6">
            <label class="block text-[14px] font-semibold text-primary mb-2">Mode</label>
            <div class="flex gap-2 p-1 bg-[#FAFAFA] border border-border rounded-lg inline-flex">
               <button type="button" class="px-6 py-2 rounded-md text-[14px] font-medium transition-colors"
                       [class.bg-white]="mode === 'single'" [class.shadow-sm]="mode === 'single'" [class.text-primary]="mode === 'single'"
                       [class.text-muted]="mode !== 'single'" (click)="mode = 'single'">
                 &bull; Single
               </button>
               <button type="button" class="px-6 py-2 rounded-md text-[14px] font-medium transition-colors"
                       [class.bg-white]="mode === 'batch'" [class.shadow-sm]="mode === 'batch'" [class.text-primary]="mode === 'batch'"
                       [class.text-muted]="mode !== 'batch'" (click)="mode = 'batch'">
                 &#9675; Batch
               </button>
            </div>
          </div>

          <div class="mb-8">
            <div class="flex items-center justify-between mb-2">
               <label class="block text-[14px] font-semibold text-primary">Input Vector</label>
               <button *ngIf="mode === 'single'" type="button" class="text-[13px] text-primary hover:underline font-medium" (click)="generateRandom()">Generate random input</button>
            </div>
            <textarea formControlName="inputs" rows="4" 
                      [placeholder]="mode === 'single' ? '[0.5, -1.2, 3.4, 0.8]' : '[[0.5, -1.2], [0.8, 2.1]]'"
                      class="w-full border border-border rounded-lg px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono text-[14px] resize-none"></textarea>
            
            <div *ngIf="mode === 'batch'" class="mt-4 border-2 border-dashed border-border rounded-lg p-8 text-center bg-[#FAFAFA]">
               <svg class="mx-auto h-8 w-8 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
               <span class="text-[14px] text-muted font-medium">Drag & drop JSON file</span>
            </div>
          </div>

          <button type="submit" [disabled]="form.invalid || loading" class="w-full bg-primary text-white py-3.5 rounded-pill font-semibold text-[15px] hover:bg-[#262626] disabled:opacity-50 transition-colors shadow-sm">
             &#9654; Run Inference
          </button>
        </form>
      </div>

      <!-- Right Column: Results -->
      <div class="p-8 lg:p-12 lg:pl-16 bg-[#FAFAFA] flex flex-col justify-center relative min-h-[500px]">
        
        <div *ngIf="!result && !loading" class="text-center">
           <h3 class="text-[32px] font-bold text-[#E5E7EB] tracking-tight">Results will appear here</h3>
        </div>

        <div *ngIf="loading" class="text-center py-20 flex flex-col items-center justify-center">
           <div class="inline-block w-8 h-8 border-2 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
           <p class="text-primary font-medium tracking-wide animate-pulse">Computing...</p>
        </div>

        <div *ngIf="result && !loading" class="w-full max-w-2xl mx-auto space-y-6 animate-[fadeIn_0.3s_ease-out]">
           <!-- Badges -->
           <div class="flex flex-wrap gap-3">
              <span class="bg-[#F3F4F6] text-primary px-3 py-1.5 rounded-md text-[13px] font-semibold border border-border shadow-sm">Score: {{ result.prediction?.score || result.score || result.results?.[0]?.score }}</span>
              <span class="bg-[#F3F4F6] text-primary px-3 py-1.5 rounded-md text-[13px] font-semibold border border-border shadow-sm">{{ result.prediction?.label || result.label || result.results?.[0]?.label }}</span>
              <span class="bg-[#F3F4F6] text-success px-3 py-1.5 rounded-md text-[13px] font-semibold border border-border shadow-sm">{{ result.latency_ms || result.latency || result.results?.[0]?.latency_ms }}ms</span>
              <span *ngIf="result.call_count" class="bg-[#F3F4F6] text-primary px-3 py-1.5 rounded-md text-[13px] font-semibold border border-border shadow-sm">Call #{{ result.call_count }}</span>
           </div>

           <!-- JSON Block -->
           <div class="code-block overflow-x-auto shadow-card">
              <pre><code><span class="text-[#818CF8]">"status":</span> <span class="text-[#86EFAC]">"success"</span>,
<span class="text-[#818CF8]">"prediction":</span> {{ result | json }}</code></pre>
           </div>

           <!-- History Collapse -->
           <div class="pt-4 border-t border-border mt-8">
              <button class="flex items-center gap-2 text-[14px] font-semibold text-primary hover:text-muted transition-colors" (click)="showHistory = !showHistory">
                 <svg class="w-4 h-4 transform transition-transform" [class.-rotate-90]="!showHistory" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                 Previous Results
              </button>
              
              <div *ngIf="showHistory" class="mt-4 space-y-2">
                 <div *ngFor="let h of history" class="text-[13px] font-mono flex items-center gap-3 py-1">
                    <span class="text-primary font-medium">#{{ h.call_count || '?' }}</span>
                    <span class="text-[#E5E7EB]">&middot;</span>
                    <span class="text-muted">{{ h.prediction?.score || h.score || h.results?.[0]?.score }}</span>
                    <span class="text-[#E5E7EB]">&middot;</span>
                    <span [class.text-red-500]="(h.prediction?.label || h.label || h.results?.[0]?.label) === 'negative'" [class.text-success]="(h.prediction?.label || h.label || h.results?.[0]?.label) === 'positive'">{{ h.prediction?.label || h.label || h.results?.[0]?.label }}</span>
                    <span class="text-[#E5E7EB]">&middot;</span>
                    <span class="text-muted">{{ h.latency_ms || h.latency || h.results?.[0]?.latency_ms }}ms</span>
                 </div>
                 <div *ngIf="history.length === 0" class="text-[13px] text-muted italic">No previous results for this session.</div>
              </div>
           </div>
        </div>

      </div>
    </div>
  `,
    styles: [`
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class PredictComponent implements OnInit {
    sessions: any[] = [];
    form: FormGroup;
    mode: 'single' | 'batch' = 'single';
    loading = false;
    result: any = null;
    history: any[] = [];
    showHistory = false;

    constructor(
        private fb: FormBuilder,
        private api: ApiService,
        private notify: NotificationService,
        private route: ActivatedRoute
    ) {
        this.form = this.fb.group({
            session_name: ['', Validators.required],
            inputs: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.api.getSessions().then(res => {
            this.sessions = res.sessions || [];
            this.route.queryParams.subscribe(p => {
                if (p['session']) this.form.patchValue({ session_name: p['session'] });
            });
        });
    }

    generateRandom() {
        const s = this.sessions.find(x => x.name === this.form.value.session_name);
        const size = s?.model_config?.size || 128;
        const arr = Array.from({ length: size }, () => parseFloat((Math.random() * 2 - 1).toFixed(4)));
        this.form.patchValue({ inputs: JSON.stringify(arr) });
    }

    async onSubmit() {
        if (this.form.invalid) return;
        try {
            let data = JSON.parse(this.form.value.inputs);
            this.loading = true;
            let res;
            if (this.mode === 'single') {
                res = await this.api.predict(this.form.value.session_name, data);
            } else {
                res = await this.api.batchPredict(this.form.value.session_name, data);
            }
            if (this.result) this.history.unshift(this.result);
            if (this.history.length > 5) this.history.pop();
            this.result = res;
            this.notify.show('success', 'Inference completed!');
        } catch (e: any) {
            this.notify.show('error', e?.error?.error || 'Invalid JSON or Request failed');
        } finally {
            this.loading = false;
        }
    }
}
