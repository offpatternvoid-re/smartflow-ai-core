import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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

         <!-- Right Column: Swagger iframe -->
         <div class="flex-[6] rounded-xl border border-border shadow-sm overflow-hidden min-h-[calc(100vh-120px)] bg-white mt-4">
             <iframe [src]="swaggerUrl" class="w-full h-full border-none min-h-[600px] lg:min-h-full"></iframe>
         </div>

      </div>
    </div>
  `
})
export class DocsComponent {
   swaggerUrl: SafeResourceUrl;
   jsonCreate: string = '{"name": "demo_model", "model_config": {"size": 128, "activation": "relu"}}';
   jsonPredict: string = '{"session_name": "demo_model", "inputs": [1.5, -0.2]}';

   constructor(private sanitizer: DomSanitizer) {
      this.swaggerUrl = this.sanitizer.bypassSecurityTrustResourceUrl('http://localhost:8000/api/v1/docs');
   }
}
