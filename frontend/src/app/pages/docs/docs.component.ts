import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
   selector: 'app-docs',
   standalone: true,
   imports: [CommonModule],
   template: `
    <div class="max-w-[1400px] mx-auto px-6 py-12">
      <div class="flex flex-col lg:flex-row gap-12">
         
         <!-- Left Column: Quick Start -->
         <div class="flex-[4] lg:sticky lg:top-[120px] self-start mt-6">
            <h1 class="text-[32px] font-bold tracking-tight mb-2 text-primary">Documentation</h1>
            <p class="text-[16px] text-muted mb-10 leading-relaxed max-w-sm">
               Complete API reference and quick start guide for integrating SmartFlow AI into your stack.
            </p>

            <h3 class="text-[20px] font-bold tracking-tight mb-8 text-primary">Quick Start</h3>
            
            <div class="space-y-8 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
               <div class="relative pl-12 group">
                  <div class="absolute w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center left-0 border-[3px] border-white shadow-sm transition-transform group-hover:scale-110">1</div>
                  <h4 class="font-bold text-[15px] mb-3 text-primary">Create Session</h4>
                  <div class="relative code-block p-4 group shadow-sm bg-black rounded-xl">
                     <pre class="text-[12px] overflow-x-auto whitespace-pre-wrap"><span class="text-pink-400 font-semibold">curl</span> -X POST http://localhost:8000/api/v1/sessions/create/ \
  -H <span class="text-[#86EFAC]">'Content-Type: application/json'</span> \
  -d <span class="text-[#86EFAC]">'{{ jsonCreate }}'</span></pre>
                  </div>
               </div>

               <div class="relative pl-12 group">
                  <div class="absolute w-8 h-8 rounded-full bg-white border-2 border-border text-primary font-bold text-sm flex items-center justify-center left-0 shadow-sm transition-transform group-hover:border-primary group-hover:scale-110">2</div>
                  <h4 class="font-bold text-[15px] mb-3 text-primary">Run Prediction</h4>
                  <div class="relative code-block p-4 shadow-sm bg-black rounded-xl">
                     <pre class="text-[12px] overflow-x-auto whitespace-pre-wrap"><span class="text-pink-400 font-semibold">curl</span> -X POST http://localhost:8000/api/v1/predict/ \
  -H <span class="text-[#86EFAC]">'Content-Type: application/json'</span> \
  -d <span class="text-[#86EFAC]">'{{ jsonPredict }}'</span></pre>
                  </div>
               </div>

               <div class="relative pl-12 group">
                  <div class="absolute w-8 h-8 rounded-full bg-white border-2 border-border text-primary font-bold text-sm flex items-center justify-center left-0 shadow-sm transition-transform group-hover:border-primary group-hover:scale-110">3</div>
                  <h4 class="font-bold text-[15px] mb-3 text-primary">Get Metrics</h4>
                  <div class="relative code-block p-4 shadow-sm bg-black rounded-xl">
                     <pre class="text-[12px] overflow-x-auto whitespace-pre-wrap"><span class="text-pink-400 font-semibold">curl</span> http://localhost:8000/api/v1/metrics/</pre>
                  </div>
               </div>
            </div>
         </div>

         <!-- Right Column: Embedded API reference -->
         <div class="flex-[6] mt-4">
           <div class="flex items-center justify-between mb-6">
             <h2 class="text-[20px] font-bold tracking-tight text-primary">API Reference</h2>
             <a
               href="http://localhost:8000/api/v1/docs"
               target="_blank"
               rel="noreferrer"
               class="text-[13px] font-medium text-primary hover:underline"
             >
               Open Swagger UI ↗
             </a>
           </div>

           <div class="space-y-4">
             <!-- GET /health -->
             <div class="card">
               <div class="flex items-center justify-between mb-2">
                 <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EFF6FF] text-[#1D4ED8]">
                   GET
                 </span>
                 <code class="text-[13px] font-mono text-primary">/api/v1/health/</code>
               </div>
               <p class="text-[14px] text-muted mb-3">
                 Lightweight health check for the SmartFlow backend and Redis connection.
               </p>
               <div class="code-block text-[12px]">
                 <pre>curl http://localhost:8000/api/v1/health/</pre>
               </div>
             </div>

             <!-- GET /sessions -->
             <div class="card">
               <div class="flex items-center justify-between mb-2">
                 <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EFF6FF] text-[#1D4ED8]">
                   GET
                 </span>
                 <code class="text-[13px] font-mono text-primary">/api/v1/sessions/</code>
               </div>
               <p class="text-[14px] text-muted mb-3">
                 Returns all active inference sessions with their current statistics.
               </p>
               <div class="code-block text-[12px]">
<pre>curl http://localhost:8000/api/v1/sessions/</pre>
               </div>
             </div>

             <!-- POST /sessions/create -->
             <div class="card">
               <div class="flex items-center justify-between mb-2">
                 <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0FDF4] text-[#16A34A]">
                   POST
                 </span>
                 <code class="text-[13px] font-mono text-primary">/api/v1/sessions/create/</code>
               </div>
               <p class="text-[14px] text-muted mb-3">
                 Creates a new inference session backed by a closure with private weights.
               </p>
               <div class="code-block text-[12px]">
<pre>&#123;
  "name": "sentiment_v2",
  "model_config": &#123;
    "size": 128,
    "activation": "gelu",
    "architecture": "attention",
    "n_classes": 3,
    "normalize": true,
    "warmup": 5,
    "seed": 42,
    "description": "3-class sentiment with attention"
  &#125;
&#125;</pre>
               </div>
             </div>

             <!-- GET /sessions/:name/stats/ -->
             <div class="card">
               <div class="flex items-center justify-between mb-2">
                 <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EFF6FF] text-[#1D4ED8]">GET</span>
                 <code class="text-[13px] font-mono text-primary">/api/v1/sessions/:name/stats/</code>
               </div>
               <p class="text-[14px] text-muted mb-3">
                 Detailed stats for a single session: call_count, error_rate, latency_stats (p50/p95/p99), architecture, model_version.
               </p>
               <div class="code-block text-[12px]">
<pre>curl http://localhost:8000/api/v1/sessions/sentiment_v2/stats/</pre>
               </div>
             </div>

             <!-- DELETE /sessions/:name/ -->
             <div class="card">
               <div class="flex items-center justify-between mb-2">
                 <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF2F2] text-[#DC2626]">
                   DELETE
                 </span>
                 <code class="text-[13px] font-mono text-primary">/api/v1/sessions/:name/</code>
               </div>
               <p class="text-[14px] text-muted mb-3">
                 Deletes an existing session and frees its in-memory weights.
               </p>
               <div class="code-block text-[12px]">
<pre>curl -X DELETE http://localhost:8000/api/v1/sessions/demo_model/</pre>
               </div>
             </div>

             <!-- POST /predict -->
             <div class="card">
               <div class="flex items-center justify-between mb-2">
                 <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0FDF4] text-[#16A34A]">
                   POST
                 </span>
                 <code class="text-[13px] font-mono text-primary">/api/v1/predict/</code>
               </div>
               <p class="text-[14px] text-muted mb-3">
                 Runs a single prediction against the specified session and returns label, score and latency.
               </p>
               <div class="code-block text-[12px]">
<pre>&#123;
  "session_name": "demo_model",
  "inputs": [1.5, -0.2]
&#125;</pre>
               </div>
             </div>

             <!-- POST /batch -->
             <div class="card">
               <div class="flex items-center justify-between mb-2">
                 <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0FDF4] text-[#16A34A]">
                   POST
                 </span>
                 <code class="text-[13px] font-mono text-primary">/api/v1/batch/</code>
               </div>
               <p class="text-[14px] text-muted mb-3">
                 Executes batch predictions using <code class="font-mono">asyncio.gather()</code> and aggregates results.
               </p>
               <div class="code-block text-[12px]">
<pre>&#123;
  "session_name": "demo_model",
  "inputs": [
    [1.5, -0.2],
    [0.3, 0.9]
  ]
&#125;</pre>
               </div>
             </div>

             <!-- GET /metrics -->
             <div class="card">
               <div class="flex items-center justify-between mb-2">
                 <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EFF6FF] text-[#1D4ED8]">GET</span>
                 <code class="text-[13px] font-mono text-primary">/api/v1/metrics/</code>
               </div>
               <p class="text-[14px] text-muted mb-3">
                 Returns global counters, latency aggregates and a list of recent calls.
               </p>
               <div class="code-block text-[12px]">
<pre>curl http://localhost:8000/api/v1/metrics/</pre>
               </div>
             </div>

             <!-- GET /metrics/history/ -->
             <div class="card">
               <div class="flex items-center justify-between mb-2">
                 <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EFF6FF] text-[#1D4ED8]">GET</span>
                 <code class="text-[13px] font-mono text-primary">/api/v1/metrics/history/?limit=100</code>
               </div>
               <p class="text-[14px] text-muted mb-3">
                 Call history for charts. Returns list of calls with session_name, result, and timestamp.
               </p>
               <div class="code-block text-[12px]">
<pre>curl "http://localhost:8000/api/v1/metrics/history/?limit=100"</pre>
               </div>
             </div>

             <!-- POST /compare/ -->
             <div class="card">
               <div class="flex items-center justify-between mb-2">
                 <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0FDF4] text-[#16A34A]">POST</span>
                 <code class="text-[13px] font-mono text-primary">/api/v1/compare/</code>
               </div>
               <p class="text-[14px] text-muted mb-3">
                 A/B compare two sessions on the same input. Returns agreement and latency_diff_ms.
               </p>
               <div class="code-block text-[12px]">
<pre>&#123;
  "session_a": "model_linear",
  "session_b": "model_attention",
  "inputs": [0.1, -0.5, 0.3]
&#125;</pre>
               </div>
             </div>

             <!-- POST /benchmark/ -->
             <div class="card">
               <div class="flex items-center justify-between mb-2">
                 <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0FDF4] text-[#16A34A]">POST</span>
                 <code class="text-[13px] font-mono text-primary">/api/v1/benchmark/</code>
               </div>
               <p class="text-[14px] text-muted mb-3">
                 Run N auto-generated inputs concurrently. Returns throughput_rps, latency p50/p95/p99, total_time_ms.
               </p>
               <div class="code-block text-[12px]">
<pre>&#123;
  "session_name": "sentiment_v2",
  "n_calls": 20,
  "input_dim": 128
&#125;</pre>
               </div>
             </div>
           </div>
         </div>

      </div>
    </div>
  `
})
export class DocsComponent {
   jsonCreate: string = '{"name": "demo_model", "model_config": {"size": 128, "activation": "relu"}}';
   jsonPredict: string = '{"session_name": "demo_model", "inputs": [1.5, -0.2]}';
}
