import type { AxiosInstance } from "axios";
import { httpClientService } from "./http-client.service";
import type { DashboardData } from "../types/dashboard";

class DashboardService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async getOverview(): Promise<DashboardData> {
        const response = await this.httpClient.get<DashboardData>(
            "/dashboard/overview",
        );
        return response.data;
    }
}

export const dashboardService = new DashboardService();
