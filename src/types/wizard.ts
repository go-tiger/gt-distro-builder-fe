export type ModOption = 'required' | 'optional-on' | 'optional-off';

export interface SelectedMod {
  project_id: string;
  title: string;
  author: string;
  icon_url: string | null;
  version_id: string;
  version_number: string;
  option: ModOption;
}

export interface SelectedExtraFile {
  // File 타입: instanceDirectory/{serverId}/{path} 에 저장
  path: string;
  url: string;
  tracked: boolean;
}

export interface SelectedShaderPack {
  type: 'modrinth' | 'manual';
  project_id?: string;
  title?: string;
  author?: string;
  icon_url?: string | null;
  version_id?: string;
  version_number?: string;
  url?: string;
  tracked: boolean;
}

export interface SelectedResourcePack {
  type: 'modrinth' | 'manual';
  // Modrinth
  project_id?: string;
  title?: string;
  author?: string;
  icon_url?: string | null;
  version_id?: string;
  version_number?: string;
  // Manual
  url?: string;
  // 파일 추적 여부 — true: 런처가 MD5로 변경 감지·재다운로드 (tracked)
  //               false: 런처가 파일 건드리지 않음, 유저 수정 허용 (untracked)
  tracked: boolean;
}
