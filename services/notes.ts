import { supabase } from './supabase';

export type Note = {
    id: string;
    title: string;
    body: string;
    tags: string[] | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null; // ✅ Add this line
};

export async function listNotes() {
    const { data, error } = await supabase
        .from('notes')
        .select('*')
        .is('deleted_at', null) // ✅ Only get non-deleted notes
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('listNotes error:', error);
        throw new Error(error.message || 'Failed to fetch notes');
    }

    return (data ?? []) as Note[];
}

export async function getNote(id: string) {
    if (!id) {
        throw new Error('Note ID is required');
    }

    const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null) // ✅ Only get non-deleted notes
        .single();

    if (error) {
        console.error('getNote error:', error);
        if (error.code === 'PGRST116') {
            throw new Error('Note not found');
        }
        throw new Error(error.message || 'Failed to fetch note');
    }

    return data as Note;
}

export async function createNote(input: { title: string; body: string; tags?: string[] | null }) {
    const payload = {
        title: input.title.trim(),
        body: input.body.trim(),
        tags: input.tags ?? null,
        deleted_at: null, // ✅ Explicitly set as not deleted
    };

    if (!payload.title) {
        throw new Error('Title is required');
    }

    const { data, error } = await supabase
        .from('notes')
        .insert([payload])
        .select()
        .single();

    if (error) {
        console.error('createNote error:', error);
        throw new Error(error.message || 'Failed to create note');
    }

    return data as Note;
}

export async function updateNote(id: string, patch: Partial<Pick<Note, 'title' | 'body' | 'tags'>>) {
    if (!id) {
        throw new Error('Note ID is required');
    }

    const updateData = {
        ...(patch.title !== undefined && { title: patch.title.trim() }),
        ...(patch.body !== undefined && { body: patch.body.trim() }),
        ...(patch.tags !== undefined && { tags: patch.tags }),
    };

    if (updateData.title === '') {
        throw new Error('Title cannot be empty');
    }

    const { data, error } = await supabase
        .from('notes')
        .update(updateData)
        .eq('id', id)
        .is('deleted_at', null) // ✅ Only update non-deleted notes
        .select()
        .single();

    if (error) {
        console.error('updateNote error:', error);
        if (error.code === 'PGRST116') {
            throw new Error('Note not found');
        }
        throw new Error(error.message || 'Failed to update note');
    }

    return data as Note;
}

// ✅ Updated deleteNote function for soft delete
export async function deleteNote(id: string) {
    if (!id) {
        throw new Error('Note ID is required');
    }

    const { error } = await supabase
        .from('notes')
        .update({ deleted_at: new Date().toISOString() }) // ✅ Soft delete
        .eq('id', id)
        .is('deleted_at', null); // ✅ Only delete if not already deleted

    if (error) {
        console.error('deleteNote error:', error);
        throw new Error(error.message || 'Failed to delete note');
    }

    return true;
}

// ✅ Optional: Add function to permanently delete
export async function permanentlyDeleteNote(id: string) {
    if (!id) {
        throw new Error('Note ID is required');
    }

    const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('permanentlyDeleteNote error:', error);
        throw new Error(error.message || 'Failed to permanently delete note');
    }

    return true;
}

// ✅ Optional: Add function to restore deleted notes
export async function restoreNote(id: string) {
    if (!id) {
        throw new Error('Note ID is required');
    }

    const { data, error } = await supabase
        .from('notes')
        .update({ deleted_at: null })
        .eq('id', id)
        .is('deleted_at', 'not.null') // Only restore if actually deleted
        .select()
        .single();

    if (error) {
        console.error('restoreNote error:', error);
        throw new Error(error.message || 'Failed to restore note');
    }

    return data as Note;
}

// ✅ Optional: Add function to list deleted notes
export async function listDeletedNotes() {
    const { data, error } = await supabase
        .from('notes')
        .select('*')
        .is('deleted_at', 'not.null')
        .order('deleted_at', { ascending: false });

    if (error) {
        console.error('listDeletedNotes error:', error);
        throw new Error(error.message || 'Failed to fetch deleted notes');
    }

    return (data ?? []) as Note[];
}
