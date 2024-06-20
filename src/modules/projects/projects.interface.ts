export interface IProject {
  id: string;
  user_id: string;
  name: string;
  created_at: Date;
}

export interface ICreateProject {
  user_id: string;
  name: string;
}

export interface IProjectModel {
  id: string;
  project_id: string;
  model_id: string;
  created_at: Date;
}
export interface ICreateProjectModel {
  project_id: string;
  model_id: string;
}

export interface IUpdateProject {
  name?: string;
}

export interface IFilterProject {
  id?: string;
  user_id?: string;
  name?: string;
}