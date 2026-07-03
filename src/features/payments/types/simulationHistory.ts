import type {

    SimulatorResult,

}

from "./simulatorResult";

export interface SimulationHistoryItem {

    id: string;

    createdAt: Date;

    orderId: string;

    amount: number;

    result: SimulatorResult;

}