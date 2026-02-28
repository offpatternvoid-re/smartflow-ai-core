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

    async createSession(name: string, model_config: any): Promise<any> {
        return firstValueFrom(this.http.post(`${this.base}/sessions/create/`, { name, model_config }));
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
}
