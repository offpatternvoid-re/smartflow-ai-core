import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <nav class="sticky top-0 z-[100] h-[56px] w-full bg-white/90 backdrop-blur-[12px] border-b border-border flex items-center justify-between px-6 transition-all">
      <div class="flex items-center gap-2 cursor-pointer" routerLink="/">
        <svg class="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z"/>
        </svg>
        <span class="font-bold text-[16px] text-primary tracking-tight">SmartFlow AI</span>
      </div>

      <div class="hidden md:flex items-center gap-[32px]">
        <a routerLink="/dashboard" routerLinkActive="text-primary font-medium" class="text-[14px] text-muted hover:text-primary transition-colors duration-150">Dashboard</a>
        <a routerLink="/sessions" routerLinkActive="text-primary font-medium" class="text-[14px] text-muted hover:text-primary transition-colors duration-150">Sessions</a>
        <a routerLink="/predict" routerLinkActive="text-primary font-medium" class="text-[14px] text-muted hover:text-primary transition-colors duration-150">Predict</a>
        <a routerLink="/analytics" routerLinkActive="text-primary font-medium" class="text-[14px] text-muted hover:text-primary transition-colors duration-150">Analytics</a>
        <a routerLink="/docs" routerLinkActive="text-primary font-medium" class="text-[14px] text-muted hover:text-primary transition-colors duration-150">Docs</a>
      </div>

      <div class="flex items-center gap-5">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(22,163,74,0.6)]"></div>
          <span class="text-[12px] font-medium text-success">API Online</span>
        </div>
        <button routerLink="/dashboard" class="btn-primary px-[18px] py-[8px] text-[14px]">
          Get started &rarr;
        </button>
      </div>
    </nav>
  `
})
export class NavbarComponent { }
