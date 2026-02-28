import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Toast } from '../../services/notification.service';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <div *ngFor="let toast of toasts" 
           class="pointer-events-auto rounded-xl shadow-modal px-4 py-3 min-w-[300px] flex items-center justify-between transition-all duration-300 transform translate-x-0 bg-white border border-border"
           [ngClass]="{
             'border-l-[3px] border-l-success': toast.type === 'success',
             'border-l-[3px] border-l-red-500': toast.type === 'error',
             'border-l-[3px] border-l-muted': toast.type === 'info'
           }">
        <div class="flex items-center gap-3">
          <svg *ngIf="toast.type === 'success'" class="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          <svg *ngIf="toast.type === 'error'" class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          <svg *ngIf="toast.type === 'info'" class="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span class="text-sm font-medium text-primary">{{ toast.message }}</span>
        </div>
        <button (click)="remove(toast.id)" class="text-muted hover:text-primary transition-colors">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </div>
  `
})
export class ToastComponent implements OnInit {
    toasts: Toast[] = [];

    constructor(private notificationService: NotificationService) { }

    ngOnInit() {
        this.notificationService.toasts$.subscribe(t => this.toasts = t);
    }

    remove(id: string) {
        this.notificationService.remove(id);
    }
}
