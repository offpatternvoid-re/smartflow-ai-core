import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="w-full">
      <!-- Section 1: Hero -->
      <section class="pt-[160px] pb-[80px] text-center px-4">
        <hr class="w-full border-t border-border mb-[80px] max-w-5xl mx-auto">
        
        <p class="text-[14px] text-muted tracking-[0.05em] uppercase mb-[24px] font-medium">
          Platform for ML Inference
        </p>
        
        <h1 class="text-[80px] font-bold tracking-[-0.03em] leading-[1.05] text-primary max-w-[720px] mx-auto">
          ML Pipelines,<br>Simplified.
        </h1>
        
        <p class="text-[18px] text-muted max-w-[480px] mx-auto mt-[24px] leading-relaxed">
          Run, monitor and scale async inference sessions with real-time metrics. Zero configuration.
        </p>

        <div class="flex items-center justify-center gap-[12px] mt-[40px]">
          <button routerLink="/dashboard" class="btn-primary">
            Open Dashboard
          </button>
          <button routerLink="/docs" class="btn-outline">
            View API Docs
          </button>
        </div>

        <div class="mt-[64px] max-w-[900px] mx-auto border border-border rounded-xl shadow-hero bg-white overflow-hidden h-[400px] relative">
          <!-- Mock window controls -->
          <div class="h-10 border-b border-border flex items-center px-4 gap-2 bg-[#FAFAFA]">
            <div class="w-3 h-3 rounded-full bg-[#E5E7EB]"></div>
            <div class="w-3 h-3 rounded-full bg-[#E5E7EB]"></div>
            <div class="w-3 h-3 rounded-full bg-[#E5E7EB]"></div>
          </div>
          <!-- Fake Dashboard Content -->
          <div class="p-6">
            <div class="w-48 h-6 bg-slate-100 rounded mb-8"></div>
            <div class="grid grid-cols-4 gap-4 mb-8">
              <div class="h-24 bg-slate-50 border border-slate-100 rounded-lg"></div>
              <div class="h-24 bg-slate-50 border border-slate-100 rounded-lg"></div>
              <div class="h-24 bg-slate-50 border border-slate-100 rounded-lg"></div>
              <div class="h-24 bg-slate-50 border border-slate-100 rounded-lg"></div>
            </div>
            <div class="w-full h-80 bg-slate-50 border border-slate-100 rounded-lg inline-block"></div>
          </div>
        </div>
      </section>

      <hr class="border-t border-border">

      <!-- Section 2: Four ways -->
      <section class="py-24 max-w-6xl mx-auto px-4">
        <h2 class="text-[48px] font-bold tracking-[-0.02em] text-center mb-16">Four ways we accelerate your ML</h2>
        
        <div class="space-y-6">
          <!-- Block 1 -->
          <div class="border border-border rounded-[12px] overflow-hidden flex flex-col md:flex-row shadow-card bg-white">
            <div class="w-full md:w-[55%] bg-slate-50 border-r border-border min-h-[300px] flex items-center justify-center text-slate-400">
               [Dashboard Screenshot]
            </div>
            <div class="w-full md:w-[45%] p-10 flex flex-col justify-center">
              <h3 class="text-[24px] font-semibold tracking-[-0.01em] mb-4">Real-time inference via closures</h3>
              <p class="text-[16px] text-muted leading-[1.6]">
                No class instantiation, no global state. Each session owns its weights privately.
              </p>
            </div>
          </div>

          <!-- Block 2 (Two side by side) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="border border-border rounded-[12px] p-10 shadow-card bg-white">
              <div class="h-40 bg-slate-50 rounded-lg border border-border mb-8 flex items-center justify-center text-slate-400">[Predict Mockup]</div>
              <h3 class="text-[24px] font-semibold tracking-[-0.01em] mb-4">Instant predictions</h3>
              <p class="text-[16px] text-muted leading-[1.6]">Fire HTTP requests and receive fast async responses.</p>
            </div>
            <div class="border border-border rounded-[12px] p-10 shadow-card bg-white">
              <div class="h-40 bg-slate-50 rounded-lg border border-border mb-8 flex items-center justify-center text-slate-400">[Analytics Mockup]</div>
              <h3 class="text-[24px] font-semibold tracking-[-0.01em] mb-4">Live metrics dashboard</h3>
              <p class="text-[16px] text-muted leading-[1.6]">Monitor latency, active calls, and throughput in real-time.</p>
            </div>
          </div>

          <!-- Block 3 -->
          <div class="border border-border rounded-[12px] overflow-hidden flex flex-col-reverse md:flex-row shadow-card bg-white">
            <div class="w-full md:w-[45%] p-10 flex flex-col justify-center">
              <h3 class="text-[24px] font-semibold tracking-[-0.01em] mb-4">Batch processing at scale</h3>
              <p class="text-[16px] text-muted leading-[1.6]">
                Upload large datasets and use asyncio.gather for concurrent resolution.
              </p>
            </div>
             <div class="w-full md:w-[55%] bg-slate-50 border-l border-border min-h-[300px] flex items-center justify-center text-slate-400">
               [Batch Interface Mockup]
            </div>
          </div>
        </div>
      </section>

      <!-- Section 3: 3 Steps -->
      <section class="py-24 bg-[#FAFAFA] border-y border-border">
        <div class="max-w-6xl mx-auto px-4 text-center">
          <h2 class="text-[48px] font-bold tracking-[-0.02em] mb-4">ML inference in 3 steps</h2>
          <p class="text-[18px] text-muted mb-16">The fastest way to run production ML pipelines.</p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
            <div>
               <div class="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl mb-6 shadow-sm">1</div>
               <h3 class="text-[24px] font-semibold tracking-[-0.01em] mb-3">Start Session</h3>
               <p class="text-[16px] text-muted leading-[1.6]">Create a named inference session with your model config in seconds.</p>
            </div>
            <div>
               <div class="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl mb-6 shadow-sm">2</div>
               <h3 class="text-[24px] font-semibold tracking-[-0.01em] mb-3">Send Inputs</h3>
               <p class="text-[16px] text-muted leading-[1.6]">Send your input vector through the UI or REST API.</p>
            </div>
            <div>
               <div class="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl mb-6 shadow-sm">3</div>
               <h3 class="text-[24px] font-semibold tracking-[-0.01em] mb-3">Get Predictions</h3>
               <p class="text-[16px] text-muted leading-[1.6]">Get score, label, confidence, and latency metrics instantly.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 4: Stats -->
      <section class="py-24 max-w-5xl mx-auto px-4">
        <hr class="border-t border-border mb-16">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border">
          <div class="py-4">
            <div class="text-[56px] font-bold text-primary mb-2">10ms</div>
            <div class="text-[14px] text-muted mx-auto max-w-[160px] font-medium uppercase tracking-wide">Min Latency</div>
          </div>
          <div class="py-4">
            <div class="text-[56px] font-bold text-primary mb-2">99.2%</div>
            <div class="text-[14px] text-muted mx-auto max-w-[160px] font-medium uppercase tracking-wide">Success Rate</div>
          </div>
          <div class="py-4">
            <div class="text-[56px] font-bold text-primary mb-2">7+</div>
            <div class="text-[14px] text-muted mx-auto max-w-[160px] font-medium uppercase tracking-wide">API Endpoints</div>
          </div>
        </div>
        <hr class="border-t border-border mt-16">
      </section>

      <!-- Section 5: CTA Footer Block -->
      <section class="bg-primary text-white py-32 text-center px-4">
        <h2 class="text-[40px] font-bold tracking-[-0.02em] mb-10 max-w-2xl mx-auto">
          ML that helps during inference, not after.
        </h2>
        <button routerLink="/dashboard" class="bg-white text-primary hover:bg-slate-100 rounded-pill px-8 py-4 font-semibold text-[15px] transition-colors inline-flex items-center gap-2">
          Open Dashboard <span class="text-xl leading-none font-bold">&rarr;</span>
        </button>
      </section>

      <!-- Footer -->
      <footer class="bg-white py-16 border-t border-border">
        <div class="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-12 justify-between">
          <div class="max-w-xs">
            <div class="flex items-center gap-2 mb-4">
              <svg class="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z"/></svg>
              <span class="font-bold text-[18px] text-primary tracking-tight">SmartFlow AI</span>
            </div>
            <p class="text-[14px] text-muted mb-6">Platform for async ML inferences via closures.</p>
            <p class="text-[14px] text-muted">&copy; 2026 SmartFlow AI</p>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-12 font-medium">
            <div class="flex flex-col gap-4">
              <h4 class="text-primary mb-2 tracking-wide text-[13px] uppercase">Product</h4>
              <a href="#" class="text-[15px] text-muted hover:text-primary transition-colors">Dashboard</a>
              <a href="#" class="text-[15px] text-muted hover:text-primary transition-colors">Sessions</a>
              <a href="#" class="text-[15px] text-muted hover:text-primary transition-colors">Predict</a>
              <a href="#" class="text-[15px] text-muted hover:text-primary transition-colors">Analytics</a>
            </div>
            <div class="flex flex-col gap-4">
              <h4 class="text-primary mb-2 tracking-wide text-[13px] uppercase">Docs</h4>
              <a href="#" class="text-[15px] text-muted hover:text-primary transition-colors">API Reference</a>
              <a href="#" class="text-[15px] text-muted hover:text-primary transition-colors">Quick Start</a>
              <a href="#" class="text-[15px] text-muted hover:text-primary transition-colors">Examples</a>
            </div>
            <div class="flex flex-col gap-4">
              <h4 class="text-primary mb-2 tracking-wide text-[13px] uppercase">Tech</h4>
              <a href="#" class="text-[15px] text-muted hover:text-primary transition-colors">Django Ninja</a>
              <a href="#" class="text-[15px] text-muted hover:text-primary transition-colors">Angular 17</a>
              <a href="#" class="text-[15px] text-muted hover:text-primary transition-colors">Docker</a>
            </div>
            <div class="flex flex-col gap-4">
              <h4 class="text-primary mb-2 tracking-wide text-[13px] uppercase">Legal</h4>
              <a href="#" class="text-[15px] text-muted hover:text-primary transition-colors">MIT License</a>
              <a href="#" class="text-[15px] text-muted hover:text-primary transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class LandingPageComponent { }
