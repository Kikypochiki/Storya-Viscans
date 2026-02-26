import { createClient } from "./supabase/client"

export type UpdateCounts = {
    upvote_count?: number;
    downvote_count?: number;
}

export async function updateThreadCounts(threadId: string, updates: UpdateCounts) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('threads')
        .update(updates)
        .eq('id', threadId)
        .select()
        .single()

    if (error) {
        throw new Error(error.message)
    }
    return data
}

export async function updateCommentCounts(commentId: string, updates: UpdateCounts) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('comments')
        .update(updates)
        .eq('id', commentId)
        .select()
        .single()

    if (error) {
        throw new Error(error.message)
    }
    return data
}
