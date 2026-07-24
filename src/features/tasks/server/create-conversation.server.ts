import {
    adminSupabase,
} from "@/lib/supabase/admin";

export async function createConversationServer(
    taskId: string,
    helperId: string,
) { 
      /* =========================
         CHECK EXISTING
      ========================= */
    
      const {
        data: existingConversation,
      } = await adminSupabase
        .from("conversations")
        .select("*")
        .eq("task_id", taskId)
        .eq("helper_id", helperId)
        .maybeSingle();
    
      if (existingConversation) {
        return existingConversation;
      }
    
      /* =========================
         GET TASK
      ========================= */
    
      const {
        data: task,
        error: taskError,
      } = await adminSupabase
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .single();
    
      if (taskError) {
        throw taskError;
      }
    
      /* =========================
         CREATE CONVERSATION
      ========================= */
    
      const {
        data,
        error,
      } = await adminSupabase
        .from("conversations")
        .insert({
          task_id: taskId,
          owner_id: task.user_id,
          helper_id: helperId,
        })
        .select()
        .single();
    
      if (error) {
        throw error;
      }
    
      return data;
    }