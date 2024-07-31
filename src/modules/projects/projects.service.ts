import { isEmpty } from "class-validator";
import ErrorResponse from "../shared/utils/errorResponse";
import { IProject, ICreateProject, IUpdateProject, IFilterProject, ICreateProjectModel, IProjectModel } from "./projects.interface";
import ProjectsDAO from "./projects.dao";
import { IDefaultQuery } from "../shared/interface/query.interface";
import flat from 'flat';
import { reqT } from "../shared/utils/language";
import ModelsDAO from "../models/models.dao";
import { IUser } from "../users/users.interface";

export default class ProjectsService {
  private dao = new ProjectsDAO()
  private models = new ModelsDAO()

  async create(values: ICreateProject): Promise<IProject> {
    const newProject = await this.dao.create(values)
    return newProject
  }

  async update(id: string, values: IUpdateProject, user: IUser): Promise<IProject> {
    const foundProject = await this.dao.getById(id);
    if (isEmpty(foundProject)) throw new ErrorResponse(404, reqT('project_404'));
    if (foundProject.user_id != user.id) throw new ErrorResponse(403, reqT('access_denied'));
    const data = await this.dao.update(id, values)
    return data
  }

  async addModel({ project_id, model_id }: ICreateProjectModel, user: IUser): Promise<IProjectModel> {

    const foundProject = await this.dao.getById_min(project_id);
    if (!foundProject) throw new ErrorResponse(404, reqT('project_404'));

    if (foundProject.user_id != user.id) throw new ErrorResponse(403, reqT('access_denied'));

    const foundModel = await this.models.getByIdMinimal(model_id);
    if (!foundModel) throw new ErrorResponse(404, reqT('project_404'));

    const exits = await this.dao.getProjectModel(project_id, model_id);
    if (!!exits) return exits;

    const data = await this.dao.createProjectModel({ project_id, model_id });
    return data
  }


  async addModelToManyProjects(model_id: string, projects: string[], user: IUser): Promise<IProjectModel[]> {
    const foundModel = await this.models.getByIdMinimal(model_id);
    if (!foundModel) throw new ErrorResponse(404, reqT('project_404'));

    const records = []
    projects.map(id => {
      records.push({
        project_id: id,
        model_id
      })
    })

    const data = await this.dao.bulkUpsertProjectModels(records);
    return data
  }

  async findById(id: string, user: IUser): Promise<IProject> {
    const project = await this.dao.getById(id);
    if (!project) throw new ErrorResponse(404, reqT('project_404'));
    if (project.user_id != user.id) throw new ErrorResponse(403, reqT('access_denied'));

    if (project.project_models?.length && !project.project_models[0]) {
      project.project_models = [];
    }

    return project
  }

  async findBy(filters: IFilterProject): Promise<IProject[]> {
    const data = await this.dao.getBy(filters);
    // for (let i = 0; i < data.length; i++) {
    //   data[i] = flat.unflatten(data[i])
    // }
    return data
  }
  async findAll(filters: IFilterProject, sorts: IDefaultQuery): Promise<IProject[]> {
    const data = await this.dao.getAll(filters, sorts);
    // for (let i = 0; i < data.length; i++) {
    //   data[i] = flat.unflatten(data[i])
    // }
    return data
  }

  async count(filters: IFilterProject): Promise<number> {
    const data = await this.dao.count(filters);
    return Number(data)
  }

  async delete(project_id, user: IUser): Promise<number> {
    const foundProject = await this.dao.getById_min(project_id);
    if (!foundProject) throw new ErrorResponse(404, reqT('project_404'));
    if (foundProject.user_id != user.id) throw new ErrorResponse(403, reqT('access_denied'));
    return await this.dao.deleteBy({ id: project_id });
  }
  async deletepProjectModel(project_id, model_id, user: IUser): Promise<number> {
    const foundProject = await this.dao.getById_min(project_id);
    if (!foundProject) throw new ErrorResponse(404, reqT('project_404'));
    if (foundProject.user_id != user.id) throw new ErrorResponse(403, reqT('access_denied'));
    return await this.dao.deleteProjectModel(project_id, model_id);
  }
}