// app/page.tsx
"use client";
import { useState } from 'react';
import { useMemoData } from '@/hooks/useMemoData';

export default function MemoApp() {
  const { 
    notes, archivedNotes, stakeholders, 
    addMemo, updateMemo, archiveCurrentNotes, 
    addStakeholder, deleteStakeholder 
  } = useMemoData();

  const [activeTab, setActiveTab] = useState<'memo' | 'stakeholders'>('memo');
  const [text, setText] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [newSName, setNewSName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const startEdit = (note: any) => {
    setEditingId(note.id);
    setText(note.content);
    setSelected(note.note_stakeholders.map((ns: any) => ns.stakeholder_id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setText("");
    setSelected([]);
  };

  // アーカイブのグループ化と貯金計算
  const groupedArchives = [];
  for (let i = 0; i < archivedNotes.length; i += 5) {
    groupedArchives.push(archivedNotes.slice(i, i + 5));
  }
  const displayArchives = [...groupedArchives].reverse();

  const totalSavings = groupedArchives.reduce((acc, group) => {
    const uniqueIds = new Set(group.flatMap(note => note.note_stakeholders.map((ns: any) => ns.stakeholder_id)));
    return acc + (uniqueIds.size * 100);
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans [scrollbar-gutter:stable]">
      <main className="max-w-xl mx-auto px-4 pt-6 space-y-6">
        
        {/* ステータスボード */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-end">
            <div>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Total Savings</p>
              <h1 className="text-4xl font-black italic">¥{totalSavings.toLocaleString()}</h1>
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-[10px] font-bold mb-2 uppercase">Progress</p>
              <div className="flex gap-1.5 bg-black/20 p-1.5 rounded-full">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-2.5 w-2.5 rounded-full ${i < notes.length ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-white/20'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* タブ */}
        <div className="flex justify-center">
          <div className="inline-flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
            {['memo', 'stakeholders'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab as any); cancelEdit(); }}
                className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab === 'memo' ? '📝 メモ' : '👥 設定'}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'memo' ? (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            
            {/* 入力フォーム / 確定ボタン */}
            <section className={`rounded-[2rem] p-5 shadow-sm border transition-all ${editingId ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}>
              {!editingId && notes.length >= 5 ? (
                <div className="text-center py-4 space-y-4">
                  <p className="text-sm font-bold text-slate-500">5件のメモがたまりました！</p>
                  <button 
                    onClick={() => archiveCurrentNotes()}
                    className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-4 rounded-xl font-black text-lg shadow-xl hover:scale-[1.02] transition-transform active:scale-95"
                  >
                    💰 貯金箱を確定して保存
                  </button>
                  <p className="text-[10px] text-slate-400">確定するまで、下のリストから内容を編集できます</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between mb-2">
                    <span className="text-[10px] font-black uppercase text-slate-400">{editingId ? "Edit Mode" : "New Note"}</span>
                    {editingId && <button onClick={cancelEdit} className="text-[10px] font-bold text-amber-600 underline">キャンセル</button>}
                  </div>
                  <textarea 
                    className="w-full text-lg outline-none bg-transparent mb-4 min-h-[100px]"
                    placeholder="誰と何をしましたか？"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {stakeholders.map(s => (
                        <button 
                          key={s.id}
                          onClick={() => setSelected(prev => prev.includes(s.id) ? prev.filter(i => i !== s.id) : [...prev, s.id])}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                            selected.includes(s.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}
                        >
                          {selected.includes(s.id) && '✓ '} {s.name}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => {
                        if (editingId) { updateMemo(editingId, text, selected); setEditingId(null); }
                        else { addMemo(text, selected); }
                        setText(""); setSelected([]);
                      }}
                      disabled={!text}
                      className={`w-full py-3.5 rounded-xl font-bold text-white transition-all ${editingId ? 'bg-amber-500' : 'bg-slate-900'} disabled:bg-slate-200`}
                    >
                      {editingId ? "変更を保存" : "記録する"}
                    </button>
                  </div>
                </>
              )}
            </section>

            {/* 現在のリスト */}
            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Current Notes ({notes.length}/5)</h3>
              {notes.map(note => (
                <div key={note.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm group">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap flex-1">{note.content}</p>
                    <button onClick={() => startEdit(note)} className="ml-4 text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">EDIT</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {note.note_stakeholders?.map((ns:any) => (
                      <span key={ns.stakeholder_id} className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-lg">@{ns.stakeholders?.name}</span>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            {/* アーカイブ */}
            {displayArchives.length > 0 && (
              <section className="pt-8 border-t border-slate-200 space-y-4">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">History</h3>
                 {displayArchives.map((group, index) => {
                   const archiveNum = displayArchives.length - index;
                   const uniqueCount = new Set(group.flatMap(note => note.note_stakeholders.map((ns: any) => ns.stakeholder_id))).size;
                   return (
                     <details key={index} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden">
                       <summary className="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50 list-none">
                         <span className="font-bold text-slate-700">💰 Archive #{archiveNum}</span>
                         <span className="font-black text-amber-500 text-lg">¥{uniqueCount * 100}</span>
                       </summary>
                       <div className="p-4 bg-slate-50 border-t space-y-2">
                         {group.map(note => (
                           <div key={note.id} className="bg-white p-3 rounded-xl border border-slate-50 text-xs text-slate-600">{note.content}</div>
                         ))}
                       </div>
                     </details>
                   );
                 })}
              </section>
            )}
          </div>
        ) : (
          /* 関係者設定 */
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 flex gap-2">
              <input type="text" className="flex-1 bg-slate-50 p-3 rounded-xl outline-none text-sm" placeholder="メンバー名..." value={newSName} onChange={(e) => setNewSName(e.target.value)} />
              <button onClick={() => { addStakeholder(newSName); setNewSName(""); }} className="bg-indigo-600 text-white px-5 rounded-xl font-bold text-sm">追加</button>
            </div>
            <div className="grid gap-2">
              {stakeholders.map((s) => (
                <div key={s.id} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 text-xs font-bold">{s.name[0]}</div>
                    <span className="font-bold text-slate-700">{s.name}</span>
                  </div>
                  <button onClick={() => deleteStakeholder(s.id)} className="text-xs text-red-400 opacity-0 group-hover:opacity-100 px-3">削除</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}