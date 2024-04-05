import { isEmpty } from "class-validator";
import { IDefaultQuery, ISearchQuery } from "../shared/interface/query.interface";
import ErrorResponse from "../shared/utils/errorResponse";
import { IComment, ICreateComment, ICreateCommentBody, IFilterComment, IUpdateComment } from "./interface/comments.interface";
import CommentsDAO from './dao/comments.dao';
import ModelsDAO from '../models/dao/models.dao';
import InteriorsDAO from '../interiors/dao/interiors.dao';
import { IUser } from '../users/interface/users.interface';
import flat from 'flat';

export default class CommentsService {
    private dao = new CommentsDAO()
    private modelsDao = new ModelsDAO()
    private interiorsDao = new InteriorsDAO()

    async create(
        values: ICreateCommentBody,
        user: IUser
    ) {
        if (values.entity_source == 'models') {
            await this.modelsDao.getByIdMinimal(values.entity_id)
        }
        else if (values.entity_source == 'interiors') {
            await this.interiorsDao.getByIdMinimal(values.entity_id)
        }

        const data = await this.dao.create({
            ...values,
            user_id: user.id
        })

        return data
    }

    async update(
        id: string,
        values: IUpdateComment,
    ) {
        const data = await this.dao.update(id, values)
        return data
    }

    async findAll(filters: IFilterComment, sorts: IDefaultQuery) {
        const data = await this.dao.getAll(filters, sorts);

        data.forEach((c, i) => data[i] = flat.unflatten(c))

        return data
    }

    async delete(where: IFilterComment): Promise<number> {
        return await this.dao.delete(where);
    }
}