import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="w-full bg-white">
      <!-- Hero -->
      <section class="pt-[140px] pb-[80px] text-center px-4 bg-white">
        <p class="text-[12px] text-muted tracking-[0.1em] uppercase mb-4 font-medium">
          PLATFORM FOR ML INFERENCE
        </p>

        <h1
          class="font-bold tracking-[-0.03em] leading-[1.05] text-primary mx-auto max-w-[780px]"
          style="font-size: clamp(56px, 8vw, 88px);"
        >
          ML Inference,<br>Without Limits
        </h1>

        <p class="text-[18px] text-muted max-w-[480px] mx-auto mt-6 leading-relaxed">
          Run, monitor, and scale async inference sessions with real-time metrics. Zero configuration.
        </p>

        <div class="flex items-center justify-center gap-3 mt-8">
          <button routerLink="/dashboard" class="btn-primary">
            Open Dashboard
          </button>
          <button routerLink="/docs" class="btn-outline">
            View API Docs
          </button>
        </div>

        <hr class="mt-12 mb-12 max-w-[800px] mx-auto">

        <!-- Dashboard mockup -->
        <div class="max-w-[900px] mx-auto">
          <div class="card p-0 rounded-[16px] overflow-hidden">
            <div class="h-10 border-b border-border flex items-center px-4 gap-2 bg-[#F9FAFB]">
              <div class="w-3 h-3 rounded-full bg-[#E5E7EB]"></div>
              <div class="w-3 h-3 rounded-full bg-[#E5E7EB]"></div>
              <div class="w-3 h-3 rounded-full bg-[#E5E7EB]"></div>
            </div>
            <div class="p-6">
              <div class="w-40 h-5 bg-[#F3F4F6] rounded mb-6"></div>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div class="h-20 bg-[#F3F4F6] rounded-md"></div>
                <div class="h-20 bg-[#F3F4F6] rounded-md"></div>
                <div class="h-20 bg-[#F3F4F6] rounded-md"></div>
                <div class="h-20 bg-[#F3F4F6] rounded-md"></div>
              </div>
              <div class="h-[220px] bg-[#F3F4F6] rounded-md"></div>
            </div>
          </div>
        </div>

        <hr class="mt-12 max-w-[800px] mx-auto">
      </section>

      <!-- Four ways section -->
      <section class="py-20 max-w-5xl mx-auto px-4 bg-white">
        <h2 class="text-[40px] font-bold tracking-[-0.02em] text-center mb-12">
          Four ways SmartFlow accelerates your ML
        </h2>

        <div class="space-y-10">
          <!-- Row 1 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div class="flex gap-6 items-start">
              <div class="w-[40%] aspect-[16/9] bg-[#F3F4F6] border border-border rounded-lg"></div>
              <div class="flex-1 text-left">
                <h3 class="text-[18px] font-semibold mb-2">Real-time Inference via Closures</h3>
                <p class="text-[14px] text-muted leading-relaxed">
                  Each session keeps its own weights in memory through closures — no global state,
                  no class instantiation overhead.
                </p>
              </div>
            </div>
            <div class="flex gap-6 items-start">
              <div class="w-[40%] aspect-[16/9] bg-[#F3F4F6] border border-border rounded-lg"></div>
              <div class="flex-1 text-left">
                <h3 class="text-[18px] font-semibold mb-2">Instant Predictions</h3>
                <p class="text-[14px] text-muted leading-relaxed">
                  Send a JSON vector and get latency, label, and confidence back in a single HTTP call.
                </p>
              </div>
            </div>
          </div>

          <hr>

          <!-- Row 2 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div class="flex gap-6 items-start">
              <div class="w-[40%] aspect-[16/9] bg-[#F3F4F6] border border-border rounded-lg"></div>
              <div class="flex-1 text-left">
                <h3 class="text-[18px] font-semibold mb-2">Live Metrics Dashboard</h3>
                <p class="text-[14px] text-muted leading-relaxed">
                  Watch calls, latency, and uptime update in real time while your sessions run.
                </p>
              </div>
            </div>
            <div class="flex gap-6 items-start">
              <div class="w-[40%] aspect-[16/9] bg-[#F3F4F6] border border-border rounded-lg"></div>
              <div class="flex-1 text-left">
                <h3 class="text-[18px] font-semibold mb-2">Batch Processing at Scale</h3>
                <p class="text-[14px] text-muted leading-relaxed">
                  Use batch endpoints backed by <code class="font-mono">asyncio.gather()</code> to fan out
                  thousands of inputs concurrently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3 steps -->
      <section class="py-20 bg-white">
        <div class="max-w-5xl mx-auto px-4">
          <h2 class="text-[40px] font-bold tracking-[-0.02em] text-center mb-10">
            ML inference in 3 steps
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div class="relative pt-4">
              <div class="absolute -top-4 left-0 text-[64px] font-bold text-[#E5E7EB] leading-none select-none">
                01
              </div>
              <div class="mt-10">
                <h3 class="text-[18px] font-semibold mb-2">Start Session</h3>
                <p class="text-[14px] text-muted leading-relaxed">
                  Create a named inference session with the weight size and activation that match your model.
                </p>
              </div>
            </div>

            <div class="relative pt-4">
              <div class="absolute -top-4 left-0 text-[64px] font-bold text-[#E5E7EB] leading-none select-none">
                02
              </div>
              <div class="mt-10">
                <h3 class="text-[18px] font-semibold mb-2">Send Inputs</h3>
                <p class="text-[14px] text-muted leading-relaxed">
                  Stream single vectors or batches of inputs via the UI or REST API.
                </p>
              </div>
            </div>

            <div class="relative pt-4">
              <div class="absolute -top-4 left-0 text-[64px] font-bold text-[#E5E7EB] leading-none select-none">
                03
              </div>
              <div class="mt-10">
                <h3 class="text-[18px] font-semibold mb-2">Get Predictions</h3>
                <p class="text-[14px] text-muted leading-relaxed">
                  Inspect predictions, latency, and call counts in real time from the dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats -->
      <section class="py-20 bg-white">
        <div class="max-w-4xl mx-auto px-4">
          <hr class="mb-12">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div>
              <div class="text-[56px] font-bold tracking-[-0.03em] mb-2">1,247+</div>
              <div class="text-[14px] text-muted">Sessions created</div>
            </div>
            <div>
              <div class="text-[56px] font-bold tracking-[-0.03em] mb-2">&lt; 50ms</div>
              <div class="text-[14px] text-muted">Average latency</div>
            </div>
            <div>
              <div class="text-[56px] font-bold tracking-[-0.03em] mb-2">99.9%</div>
              <div class="text-[14px] text-muted">Uptime</div>
            </div>
          </div>
          <hr class="mt-12">
        </div>
      </section>

      <!-- CTA -->
      <section class="bg-[#0A0A0A] text-white py-20 text-center px-4">
        <div class="max-w-3xl mx-auto">
          <h2 class="text-[40px] font-bold tracking-[-0.02em] mb-4">
            Start using SmartFlow today
          </h2>
          <p class="text-[16px] text-[#E5E7EB] mb-8">
            Spin up your first ML inference session in seconds and keep latency under control from day one.
          </p>
          <button routerLink="/dashboard" class="btn-outline border-white text-white">
            Get started for free
          </button>
        </div>
      </section>
    </div>
  `
})
export class LandingPageComponent { }
