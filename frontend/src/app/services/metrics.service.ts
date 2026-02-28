import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class MetricsService implements OnDestroy {
    private metricsSubject = new BehaviorSubject<any>(null);
    public metrics$ = this.metricsSubject.asObservable();
    private pollingSub?: Subscription;

    constructor(private api: ApiService) {
        this.startPolling();
    }

    private startPolling() {
        this.pollingSub = interval(3000)
            .pipe(
                startWith(0),
                switchMap(() => this.api.getMetrics())
            )
            .subscribe({
                next: (data) => this.metricsSubject.next(data),
                error: (err) => console.error('Metrics polling error', err)
            });
    }

    ngOnDestroy() {
        if (this.pollingSub) {
            this.pollingSub.unsubscribe();
        }
    }
}
