// hooks/useMemoData.ts
"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useMemoData() {
  const [notes, setNotes] = useState<any[]>([]);
  const [archivedNotes, setArchivedNotes] = useState<any[]>([]);
  const [stakeholders, setStakeholders] = useState<any[]>([]);

  const fetchData = async () => {
    // 関係者マスタ
    const { data: s } = await supabase.from('stakeholders').select('*').order('name');
    setStakeholders(s || []);

    // 未アーカイブのメモ
    const { data: n } = await supabase.from('notes')
      .select('*, note_stakeholders(*, stakeholders(name))')
      .eq('is_archived', false)
      .order('created_at', { ascending: true });
    setNotes(n || []);

    // アーカイブ済みのメモ
    const { data: an } = await supabase.from('notes')
      .select('*, note_stakeholders(*, stakeholders(name))')
      .eq('is_archived', true)
      .order('created_at', { ascending: true });
    setArchivedNotes(an || []);
  };

  const addMemo = async (content: string, stakeholderIds: string[]) => {
    if (!content) return;
    const { data: note, error } = await supabase.from('notes').insert([{ content }]).select().single();
    if (error) return;

    if (stakeholderIds.length > 0) {
      const links = stakeholderIds.map(id => ({ note_id: note.id, stakeholder_id: id }));
      await supabase.from('note_stakeholders').insert(links);
    }
    fetchData();
  };

  const updateMemo = async (id: string, content: string, stakeholderIds: string[]) => {
    await supabase.from('notes').update({ content }).eq('id', id);
    await supabase.from('note_stakeholders').delete().eq('note_id', id);
    if (stakeholderIds.length > 0) {
      const links = stakeholderIds.map(sid => ({ note_id: id, stakeholder_id: sid }));
      await supabase.from('note_stakeholders').insert(links);
    }
    fetchData();
  };

  const archiveCurrentNotes = async () => {
    // 現在の5件を取得
    const { data: currentNotes } = await supabase.from('notes')
      .select('*, note_stakeholders(*)')
      .eq('is_archived', false);

    if (!currentNotes || currentNotes.length < 5) return;

    // アーカイブ実行
    await supabase.from('notes')
      .update({ is_archived: true })
      .in('id', currentNotes.map(n => n.id));

    fetchData();
  };

  const addStakeholder = async (name: string) => {
    await supabase.from('stakeholders').insert([{ name }]);
    fetchData();
  };

  const deleteStakeholder = async (id: string) => {
    if (!confirm("削除してよろしいですか？")) return;
    await supabase.from('stakeholders').delete().eq('id', id);
    fetchData();
  };

  useEffect(() => { fetchData(); }, []);

  return { notes, archivedNotes, stakeholders, addMemo, updateMemo, archiveCurrentNotes, addStakeholder, deleteStakeholder, fetchData };
}