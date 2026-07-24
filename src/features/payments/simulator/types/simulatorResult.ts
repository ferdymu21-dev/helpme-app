export interface SimulatorResult {

    status:

        | "SUCCESS"

        | "ERROR"

        | "PENDING";

    response: string;

    executionTime: number;

}