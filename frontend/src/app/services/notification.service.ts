import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private toastsSubject = new BehaviorSubject<Toast[]>([]);
    public toasts$ = this.toastsSubject.asObservable();

    show(type: 'success' | 'error' | 'info', message: string, duration: number = 3000) {
        const id = Math.random().toString(36).substr(2, 9);
        const toast: Toast = { id, type, message };

        this.toastsSubject.next([...this.toastsSubject.value, toast]);

        setTimeout(() => {
            this.remove(id);
        }, duration);
    }

    remove(id: string) {
        const current = this.toastsSubject.value;
        this.toastsSubject.next(current.filter(t => t.id !== id));
    }
}
