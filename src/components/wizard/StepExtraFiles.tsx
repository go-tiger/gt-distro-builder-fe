'use client';

import { useState } from 'react';
import type { SelectedExtraFile } from '@/types/wizard';

interface Props {
  onBack: () => void;
  onNext: (files: SelectedExtraFile[]) => void;
}

function TrackedToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      title={value ? 'Tracked — 파일 변경 감지 · 재다운로드 (무결성 검사)' : 'Untracked — 파일 건드리지 않음 (유저 수정 허용)'}
      className={`flex items-center gap-1.5 font-mono text-[10px] px-2 py-1 rounded border transition-colors flex-shrink-0 ${
        value
          ? 'text-[#0ea5e9] bg-[#0ea5e9]/10 border-[#0ea5e9]/40'
          : 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/40'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${value ? 'bg-[#0ea5e9]' : 'bg-[#f59e0b]'}`} />
      {value ? 'Tracked' : 'Untracked'}
    </button>
  );
}

export default function StepExtraFiles({ onBack, onNext }: Props) {
  const [files, setFiles] = useState<SelectedExtraFile[]>([]);

  const [path, setPath] = useState('');
  const [url, setUrl] = useState('');
  const [tracked, setTracked] = useState(true);

  function addFile() {
    const trimPath = path.trim();
    const trimUrl = url.trim();
    if (!trimPath || !trimUrl) return;
    setFiles(prev => [...prev, { path: trimPath, url: trimUrl, tracked }]);
    setPath('');
    setUrl('');
    setTracked(true);
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }

  function updateFileTracked(index: number, val: boolean) {
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, tracked: val } : f));
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#e2e8f0] mb-2">기타 파일</h2>
      <p className="text-sm text-[#475569] font-mono mb-6">
        config 등 추가 파일을 URL로 직접 등록하세요
      </p>

      {/* 입력 폼 */}
      <div className="bg-[#0d1424] border border-[#1e2d45] rounded-xl p-4 mb-6">
        <div className="grid gap-3 mb-4">
          {/* 경로 */}
          <div>
            <label className="font-mono text-xs text-[#475569] mb-1.5 block">
              경로 <span className="text-[#475569]/60">(instanceDirectory 기준 상대경로)</span>
            </label>
            <input
              type="text"
              placeholder="config/example.cfg"
              value={path}
              onChange={e => setPath(e.target.value)}
              className="w-full bg-[#080c14] border border-[#1e2d45] focus:border-[#00d4aa] outline-none rounded-lg px-4 py-2.5 text-sm text-[#e2e8f0] placeholder:text-[#475569] transition-colors font-mono"
            />
          </div>

          {/* URL */}
          <div>
            <label className="font-mono text-xs text-[#475569] mb-1.5 block">다운로드 URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full bg-[#080c14] border border-[#1e2d45] focus:border-[#00d4aa] outline-none rounded-lg px-4 py-2.5 text-sm text-[#e2e8f0] placeholder:text-[#475569] transition-colors font-mono"
            />
          </div>

          {/* 파일 추적 */}
          <div>
            <label className="font-mono text-xs text-[#475569] mb-1.5 block">파일 추적</label>
            <div className="flex gap-2">
              {([true, false] as const).map(v => (
                <button
                  key={String(v)}
                  onClick={() => setTracked(v)}
                  className={`font-mono text-xs px-4 py-2 rounded-lg border transition-colors ${
                    tracked === v
                      ? v
                        ? 'text-[#0ea5e9] bg-[#0ea5e9]/10 border-[#0ea5e9]/40'
                        : 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/40'
                      : 'text-[#475569] bg-[#080c14] border-[#1e2d45] hover:border-[#2d4a6b] hover:text-[#94a3b8]'
                  }`}
                >
                  {v ? 'Tracked' : 'Untracked'}
                </button>
              ))}
            </div>
            <p className="font-mono text-[10px] text-[#475569] mt-1.5">
              Tracked: 파일 변경 감지 · 재다운로드 (무결성 검사) / Untracked: 파일 건드리지 않음 (유저 수정 허용)
            </p>
          </div>
        </div>

        <button
          onClick={addFile}
          disabled={!path.trim() || !url.trim()}
          className="w-full font-mono text-sm font-semibold bg-[#00d4aa]/10 border border-[#00d4aa]/40 text-[#00d4aa] py-2.5 rounded-lg hover:bg-[#00d4aa]/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          + 추가
        </button>
      </div>

      {/* 추가된 파일 목록 */}
      {files.length > 0 && (
        <div className="grid gap-2 mb-8">
          {files.map((file, i) => (
            <div key={i} className="bg-[#0d1424] border border-[#1e2d45] rounded-xl p-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-[#e2e8f0] truncate mb-0.5">{file.path}</p>
                  <p className="font-mono text-[10px] text-[#475569] truncate mb-2">{file.url}</p>
                  <div className="flex items-center gap-2">
                    <TrackedToggle
                      value={file.tracked}
                      onChange={v => updateFileTracked(i, v)}
                    />
                    <span className="font-mono text-[10px] text-[#475569]">
                      {file.tracked
                        ? '파일 변경 감지 · 재다운로드 (무결성 검사)'
                        : '파일 건드리지 않음 (유저 수정 허용)'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="text-[#475569] hover:text-[#ef4444] transition-colors font-mono text-sm flex-shrink-0"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 네비게이션 */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="font-mono text-sm text-[#475569] hover:text-[#94a3b8] transition-colors"
        >
          ← 이전
        </button>
        <button
          onClick={() => onNext(files)}
          className="font-mono text-sm font-semibold bg-[#00d4aa]/10 border border-[#00d4aa]/40 text-[#00d4aa] px-6 py-2.5 rounded-lg hover:bg-[#00d4aa]/20 transition-colors"
        >
          {files.length > 0 ? `다음 → (${files.length})` : '건너뛰기 →'}
        </button>
      </div>
    </div>
  );
}
