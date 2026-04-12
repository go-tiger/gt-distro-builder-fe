export type ModOption = 'required' | 'optional-on' | 'optional-off';

export interface SelectedMod {
  project_id: string;
  title: string;
  author: string;
  icon_url: string | null;
  version_id: string;
  version_number: string;
  artifact_url: string;
  artifact_size: number;
  option: ModOption;
}

export interface SelectedExtraFile {
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
  artifact_url?: string;
  artifact_size?: number;
  url?: string;          // manual only
  tracked: boolean;
}

export interface SelectedResourcePack {
  type: 'modrinth' | 'manual';
  project_id?: string;
  title?: string;
  author?: string;
  icon_url?: string | null;
  version_id?: string;
  version_number?: string;
  artifact_url?: string;
  artifact_size?: number;
  url?: string;          // manual only
  tracked: boolean;
}
