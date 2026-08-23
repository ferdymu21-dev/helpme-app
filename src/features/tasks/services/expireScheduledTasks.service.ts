import { expireScheduledTasksRepository } from "../repositories";

export interface ExpireScheduledTasksResult {
  scanned: number;
  expired: number;
}

export async function expireScheduledTasksService(): Promise<ExpireScheduledTasksResult> {
  const tasks = await expireScheduledTasksRepository();

  return {
    scanned: tasks.length,
    expired: tasks.length,
  };
}