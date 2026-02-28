import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private base = 'http://localhost:8000/api/v1';

    constructor(private http: HttpClient) { }

    async getHealth(): Promise<any> {
        return firstValueFrom(this.http.get(`${this.base}/health/`));
    }

    async getSessions(): Promise<any> {
        return firstValueFrom(this.http.get(`${this.base}/sessions/`));
    }

    async createSession(name: string, cfg: any): Promise<any> {
        return firstValueFrom(this.http.post(`${this.base}/sessions/create/`, { name, cfg }));
    }

    async deleteSession(name: string): Promise<any> {
        return firstValueFrom(this.http.delete(`${this.base}/sessions/${name}/`));
    }

    async predict(session_name: string, inputs: number[]): Promise<any> {
        return firstValueFrom(this.http.post(`${this.base}/predict/`, { session_name, inputs }));
    }

    async batchPredict(session_name: string, inputs: number[][]): Promise<any> {
        return firstValueFrom(this.http.post(`${this.base}/batch/`, { session_name, inputs }));
    }

    async getMetrics(): Promise<any> {
        return firstValueFrom(this.http.get(`${this.base}/metrics/`));
    }

    async getSessionStats(name: string): Promise<any> {
        return firstValueFrom(this.http.get(`${this.base}/sessions/${encodeURIComponent(name)}/stats/`));
    }

    async compareSessions(session_a: string, session_b: string, inputs: number[]): Promise<any> {
        return firstValueFrom(this.http.post(`${this.base}/compare/`, { session_a, session_b, inputs }));
    }

    async benchmarkSession(session_name: string, n_calls: number = 20, input_dim?: number): Promise<any> {
        const body: any = { session_name, n_calls };
        if (input_dim != null) body.input_dim = input_dim;
        return firstValueFrom(this.http.post(`${this.base}/benchmark/`, body));
    }

    async getMetricsHistory(limit: number = 100): Promise<any> {
        return firstValueFrom(this.http.get(`${this.base}/metrics/history/?limit=${limit}`));
    }
}
