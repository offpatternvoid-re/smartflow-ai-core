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
            <div class="flex items-center gap-1.5 px-4 py-3 border-b border-border">
              <div class="w-3 h-3 rounded-full bg-[#E5E7EB]"></div>
              <div class="w-3 h-3 rounded-full bg-[#E5E7EB]"></div>
              <div class="w-3 h-3 rounded-full bg-[#E5E7EB]"></div>
              <div class="ml-3 flex-1 h-5 bg-[#F3F4F6] rounded-md max-w-[240px]"></div>
            </div>
            <div class="flex gap-0 h-[240px]">
              <div class="w-1/2 bg-[#0A0A0A] p-4 font-mono text-[11px] leading-6 overflow-hidden">
                <div class="text-[#60A5FA]">POST <span class="text-[#F9FAFB]">/api/v1/predict/</span></div>
                <div class="text-[#6B7280] mt-2">&#123;</div>
                <div class="pl-4 text-[#FCD34D]">"session_name": <span class="text-[#34D399]">"nlp_v2"</span>,</div>
                <div class="pl-4 text-[#FCD34D]">"inputs": <span class="text-[#F9FAFB]">[0.12, -0.5, ...]</span></div>
                <div class="text-[#6B7280]">&#125;</div>
                <div class="mt-3 text-[#6B7280]">// Response</div>
                <div class="text-[#6B7280]">&#123;</div>
                <div class="pl-4 text-[#FCD34D]">"label": <span class="text-[#34D399]">"positive"</span>,</div>
                <div class="pl-4 text-[#FCD34D]">"confidence": <span class="text-[#818CF8]">0.9123</span>,</div>
                <div class="pl-4 text-[#FCD34D]">"latency_ms": <span class="text-[#818CF8]">38.4</span>,</div>
                <div class="pl-4 text-[#FCD34D]">"p95_latency_ms": <span class="text-[#818CF8]">44.1</span></div>
                <div class="text-[#6B7280]">&#125;</div>
              </div>
              <div class="w-1/2 bg-white p-4 border-l border-border">
                <div class="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Live Metrics</div>
                <div class="grid grid-cols-2 gap-2 mb-3">
                  <div class="bg-[#F9FAFB] rounded-lg p-2 border border-border">
                    <div class="text-[10px] text-[#6B7280]">Avg Latency</div>
                    <div class="text-[14px] font-bold text-[#0A0A0A]">38ms</div>
                  </div>
                  <div class="bg-[#F9FAFB] rounded-lg p-2 border border-border">
                    <div class="text-[10px] text-[#6B7280]">Sessions</div>
                    <div class="text-[14px] font-bold text-[#0A0A0A]">4</div>
                  </div>
                </div>
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between text-[11px]">
                    <span class="font-medium text-[#0A0A0A]">nlp_v2</span>
                    <span class="text-[#6B7280]">attention</span>
                    <span class="text-[#16A34A] font-mono">38ms</span>
                    <span class="px-1.5 py-0.5 bg-[#DCFCE7] text-[#16A34A] rounded-full text-[10px]">Active</span>
                  </div>
                  <div class="flex items-center justify-between text-[11px]">
                    <span class="font-medium text-[#0A0A0A]">anomaly_det</span>
                    <span class="text-[#6B7280]">autoencoder</span>
                    <span class="text-[#16A34A] font-mono">35ms</span>
                    <span class="px-1.5 py-0.5 bg-[#DCFCE7] text-[#16A34A] rounded-full text-[10px]">Active</span>
                  </div>
                  <div class="flex items-center justify-between text-[11px]">
                    <span class="font-medium text-[#0A0A0A]">classifier</span>
                    <span class="text-[#6B7280]">mlp</span>
                    <span class="text-[#16A34A] font-mono">25ms</span>
                    <span class="px-1.5 py-0.5 bg-[#DCFCE7] text-[#16A34A] rounded-full text-[10px]">Active</span>
                  </div>
                </div>
              </div>
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
              <div class="w-[40%] shrink-0">
                <div class="rounded-lg overflow-hidden aspect-video">
                  <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
                    <rect width="320" height="180" fill="#0A0A0A"/>
                    <rect x="16" y="14" width="80" height="7" rx="3" fill="#374151"/>
                    <rect x="16" y="30" width="28" height="6" rx="2" fill="#60A5FA"/>
                    <rect x="50" y="30" width="60" height="6" rx="2" fill="#34D399"/>
                    <rect x="116" y="30" width="36" height="6" rx="2" fill="#FCD34D"/>
                    <rect x="28" y="46" width="20" height="5" rx="2" fill="#818CF8"/>
                    <rect x="54" y="46" width="48" height="5" rx="2" fill="#F9FAFB"/>
                    <rect x="28" y="60" width="36" height="5" rx="2" fill="#60A5FA"/>
                    <rect x="70" y="60" width="56" height="5" rx="2" fill="#34D399"/>
                    <rect x="28" y="74" width="44" height="5" rx="2" fill="#60A5FA"/>
                    <rect x="78" y="74" width="64" height="5" rx="2" fill="#34D399"/>
                    <rect x="28" y="88" width="32" height="5" rx="2" fill="#818CF8"/>
                    <rect x="66" y="88" width="48" height="5" rx="2" fill="#F9FAFB"/>
                    <rect x="28" y="102" width="20" height="5" rx="2" fill="#60A5FA"/>
                    <rect x="54" y="102" width="80" height="5" rx="2" fill="#FCD34D"/>
                    <rect x="16" y="118" width="32" height="5" rx="2" fill="#60A5FA"/>
                    <rect x="54" y="118" width="72" height="5" rx="2" fill="#34D399"/>
                    <rect x="236" y="56" width="68" height="36" rx="6" fill="#16A34A" opacity="0.15"/>
                    <rect x="244" y="66" width="52" height="6" rx="2" fill="#16A34A"/>
                    <rect x="244" y="78" width="36" height="5" rx="2" fill="#16A34A" opacity="0.7"/>
                  </svg>
                </div>
              </div>
              <div class="flex-1 text-left">
                <h3 class="text-[18px] font-semibold mb-2">Real-time Inference via Closures</h3>
                <p class="text-[14px] text-muted leading-relaxed">
                  Each session keeps its own weights in memory through closures — no global state,
                  no class instantiation overhead.
                </p>
              </div>
            </div>
            <div class="flex gap-6 items-start">
              <div class="w-[40%] shrink-0">
                <div class="rounded-lg overflow-hidden aspect-video">
                  <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
                    <rect width="320" height="180" fill="#F8FAFC"/>
                    <rect x="16" y="40" width="116" height="100" rx="8" fill="#0A0A0A"/>
                    <rect x="28" y="54" width="36" height="7" rx="3" fill="#34D399"/>
                    <rect x="70" y="54" width="48" height="7" rx="3" fill="#F9FAFB"/>
                    <rect x="28" y="70" width="20" height="5" rx="2" fill="#6B7280"/>
                    <rect x="54" y="70" width="56" height="5" rx="2" fill="#FCD34D"/>
                    <rect x="28" y="84" width="20" height="5" rx="2" fill="#6B7280"/>
                    <rect x="54" y="84" width="40" height="5" rx="2" fill="#60A5FA"/>
                    <rect x="28" y="98" width="20" height="5" rx="2" fill="#6B7280"/>
                    <rect x="54" y="98" width="32" height="5" rx="2" fill="#818CF8"/>
                    <path d="M146 88 L172 90" stroke="#16A34A" stroke-width="2.5" stroke-linecap="round"/>
                    <path d="M167 84 L174 90 L167 96" stroke="#16A34A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <rect x="140" y="97" width="36" height="13" rx="4" fill="#DCFCE7"/>
                    <rect x="147" y="101" width="22" height="5" rx="2" fill="#16A34A"/>
                    <rect x="188" y="40" width="116" height="100" rx="8" fill="#0A0A0A"/>
                    <rect x="200" y="54" width="56" height="7" rx="3" fill="#34D399"/>
                    <rect x="200" y="70" width="24" height="5" rx="2" fill="#6B7280"/>
                    <rect x="230" y="70" width="52" height="5" rx="2" fill="#FCD34D"/>
                    <rect x="200" y="84" width="32" height="5" rx="2" fill="#6B7280"/>
                    <rect x="238" y="84" width="36" height="5" rx="2" fill="#818CF8"/>
                    <rect x="200" y="98" width="24" height="5" rx="2" fill="#6B7280"/>
                    <rect x="230" y="98" width="44" height="5" rx="2" fill="#34D399"/>
                    <rect x="200" y="112" width="88" height="4" rx="2" fill="#1F2937"/>
                    <rect x="200" y="112" width="70" height="4" rx="2" fill="#34D399"/>
                  </svg>
                </div>
              </div>
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
              <div class="w-[40%] shrink-0">
                <div class="rounded-lg overflow-hidden aspect-video">
                  <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
                    <rect width="320" height="180" fill="#F8FAFC"/>
                    <rect x="16" y="12" width="288" height="156" rx="8" fill="#FFFFFF" stroke="#E5E7EB"/>
                    <rect x="28" y="24" width="80" height="34" rx="6" fill="#F9FAFB" stroke="#E5E7EB"/>
                    <rect x="36" y="31" width="28" height="5" rx="2" fill="#6B7280"/>
                    <rect x="36" y="41" width="44" height="8" rx="2" fill="#0A0A0A"/>
                    <rect x="120" y="24" width="80" height="34" rx="6" fill="#F9FAFB" stroke="#E5E7EB"/>
                    <rect x="128" y="31" width="28" height="5" rx="2" fill="#6B7280"/>
                    <rect x="128" y="41" width="36" height="8" rx="2" fill="#16A34A"/>
                    <rect x="212" y="24" width="80" height="34" rx="6" fill="#F9FAFB" stroke="#E5E7EB"/>
                    <rect x="220" y="31" width="28" height="5" rx="2" fill="#6B7280"/>
                    <rect x="220" y="41" width="48" height="8" rx="2" fill="#0A0A0A"/>
                    <rect x="28" y="70" width="272" height="82" rx="6" fill="#F9FAFB"/>
                    <line x1="28" y1="98" x2="300" y2="98" stroke="#E5E7EB" stroke-width="1"/>
                    <line x1="28" y1="118" x2="300" y2="118" stroke="#E5E7EB" stroke-width="1"/>
                    <polyline points="40,144 72,126 108,132 140,108 172,116 204,94 236,104 268,82 292,86"
                      stroke="#0A0A0A" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="204" cy="94" r="3.5" fill="#16A34A"/>
                    <circle cx="268" cy="82" r="3.5" fill="#16A34A"/>
                    <circle cx="280" cy="74" r="5" fill="#16A34A"/>
                    <circle cx="280" cy="74" r="9" fill="#16A34A" opacity="0.15"/>
                    <rect x="288" y="70" width="24" height="6" rx="2" fill="#16A34A"/>
                  </svg>
                </div>
              </div>
              <div class="flex-1 text-left">
                <h3 class="text-[18px] font-semibold mb-2">Live Metrics Dashboard</h3>
                <p class="text-[14px] text-muted leading-relaxed">
                  Watch calls, latency, and uptime update in real time while your sessions run.
                </p>
              </div>
            </div>
            <div class="flex gap-6 items-start">
              <div class="w-[40%] shrink-0">
                <div class="rounded-lg overflow-hidden aspect-video">
                  <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
                    <rect width="320" height="180" fill="#F8FAFC"/>
                    <rect x="12" y="30" width="68" height="16" rx="4" fill="#0A0A0A"/>
                    <rect x="12" y="52" width="68" height="16" rx="4" fill="#0A0A0A"/>
                    <rect x="12" y="74" width="68" height="16" rx="4" fill="#0A0A0A"/>
                    <rect x="12" y="96" width="68" height="16" rx="4" fill="#1F2937"/>
                    <rect x="12" y="118" width="68" height="16" rx="4" fill="#1F2937"/>
                    <rect x="20" y="35" width="20" height="5" rx="2" fill="#6B7280"/>
                    <rect x="46" y="35" width="26" height="5" rx="2" fill="#FCD34D"/>
                    <rect x="20" y="57" width="20" height="5" rx="2" fill="#6B7280"/>
                    <rect x="46" y="57" width="26" height="5" rx="2" fill="#FCD34D"/>
                    <rect x="20" y="79" width="20" height="5" rx="2" fill="#6B7280"/>
                    <rect x="46" y="79" width="26" height="5" rx="2" fill="#FCD34D"/>
                    <path d="M84 38 L116 78" stroke="#D1D5DB" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M84 60 L116 82" stroke="#D1D5DB" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M84 82 L116 86" stroke="#D1D5DB" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M84 104 L116 90" stroke="#D1D5DB" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M84 126 L116 94" stroke="#D1D5DB" stroke-width="1.5" stroke-linecap="round"/>
                    <rect x="116" y="62" width="72" height="46" rx="8" fill="#0A0A0A"/>
                    <rect x="126" y="72" width="52" height="6" rx="2" fill="#60A5FA"/>
                    <rect x="126" y="84" width="40" height="6" rx="2" fill="#34D399"/>
                    <rect x="126" y="96" width="28" height="6" rx="2" fill="#818CF8"/>
                    <path d="M192 78 L216 38" stroke="#16A34A" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M192 82 L216 60" stroke="#16A34A" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M192 86 L216 82" stroke="#16A34A" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M192 90 L216 104" stroke="#16A34A" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M192 94 L216 126" stroke="#16A34A" stroke-width="1.5" stroke-linecap="round"/>
                    <rect x="220" y="30" width="88" height="16" rx="4" fill="#DCFCE7" stroke="#16A34A"/>
                    <rect x="220" y="52" width="88" height="16" rx="4" fill="#DCFCE7" stroke="#16A34A"/>
                    <rect x="220" y="74" width="88" height="16" rx="4" fill="#DCFCE7" stroke="#16A34A"/>
                    <rect x="220" y="96" width="88" height="16" rx="4" fill="#DCFCE7" stroke="#16A34A"/>
                    <rect x="220" y="118" width="88" height="16" rx="4" fill="#DCFCE7" stroke="#16A34A"/>
                    <rect x="228" y="35" width="36" height="5" rx="2" fill="#16A34A"/>
                    <rect x="228" y="57" width="36" height="5" rx="2" fill="#16A34A"/>
                    <rect x="228" y="79" width="36" height="5" rx="2" fill="#16A34A"/>
                    <rect x="228" y="101" width="36" height="5" rx="2" fill="#16A34A"/>
                    <rect x="228" y="123" width="36" height="5" rx="2" fill="#16A34A"/>
                    <rect x="274" y="35" width="26" height="5" rx="2" fill="#6B7280"/>
                    <rect x="274" y="57" width="26" height="5" rx="2" fill="#6B7280"/>
                    <rect x="274" y="79" width="26" height="5" rx="2" fill="#6B7280"/>
                    <rect x="274" y="101" width="26" height="5" rx="2" fill="#6B7280"/>
                    <rect x="274" y="123" width="26" height="5" rx="2" fill="#6B7280"/>
                  </svg>
                </div>
              </div>
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
