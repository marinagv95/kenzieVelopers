interface IProject {
  id: number;
  name: string;
  description: string;
  estimatedTime: string;
  repository: string;
  startDate: Date;
  endDate: Date;
  developerId?: number;
}
type IProjectRequest = Omit<IProject, "id">;

type ITechnologie = {
  id: number;
  name: string;
};
type ITechnologieRequest = Omit<ITechnologie, "id">;

interface IInsertTec {
  name: string;
}

interface IProjectTechnologies extends IProjectRequest {
  developerId: number;
  tec: Array<IInsertTec>;
}

export {
  IProject,
  IProjectRequest,
  IProjectTechnologies,
  ITechnologie,
  ITechnologieRequest,
  IInsertTec,
};
