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
