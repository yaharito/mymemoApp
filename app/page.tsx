"use client";
import { useMemoData } from '@/hooks/useMemoData';
import { useState } from 'react';

export default function MemoApp() {
  const { notes, stakeholders, addMemo, fetchData } = useMemoData();
  const [text, setText] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <main className="max-w-xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-bold">仲間うち貯金メモ</h1>
        <p className="text-gray-500">5件たまると貯金が発生します</p>
      </header>

      {/* 進捗表示セクション */}
      <section className="bg-blue-50 p-4 rounded-xl">
        <div className="flex justify-between mb-2">
          <span>現在のカウント</span>
          <span className="font-bold">{notes.length} / 5</span>
        </div>
        <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full transition-all" style={{ width: `${(notes.length / 5) * 100}%` }} />
        </div>
      </section>

      {/* 入力セクション */}
      <section className="space-y-4 border p-4 rounded-xl">
        <textarea 
          className="w-full border p-3 rounded" 
          placeholder="本文を入力してください..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div>
          <p className="text-sm font-bold mb-2">関係者をタグ付け:</p>
          <div className="flex flex-wrap gap-2">
            {stakeholders.map(s => (
              <button 
                key={s.id}
                onClick={() => setSelected(prev => prev.includes(s.id) ? prev.filter(i => i !== s.id) : [...prev, s.id])}
                className={`px-3 py-1 rounded-full text-sm border ${selected.includes(s.id) ? 'bg-blue-500 text-white' : 'bg-white'}`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
        <button 
          onClick={() => { addMemo(text, selected); setText(""); setSelected([]); }}
          className="w-full bg-black text-white py-3 rounded-lg font-bold"
        >
          メモを保存する
        </button>
      </section>

      {/* ここに関係者追加コンポーネントなどを後で追加可能 */}
    </main>
  );
}