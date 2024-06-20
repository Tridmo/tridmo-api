import knexInstance from "../../../database/connection";
import { getFirst } from "../../shared/utils/utils";
import { IChatToken, ICreateChatToken, IFilterChatToken } from "./chat_tokens.interface";

export class ChatDao {
  public async create(values: ICreateChatToken): Promise<IChatToken> {
    return getFirst(
      await knexInstance('chat_tokens')
        .insert(values)
        .returning('*')
    )
  }
  public async update(id: string, values: IFilterChatToken): Promise<IChatToken> {
    return getFirst(
      await knexInstance('chat_tokens')
        .update(values)
        .where({ id })
        .returning('*')
    )
  }
  public async getByUser(user_id: string): Promise<IChatToken> {
    return (
      await knexInstance('chat_tokens')
        .select('*')
        .where({ user_id })
        .first()
    )
  }
  public async getBy(filters: IFilterChatToken): Promise<IChatToken[]> {
    return (
      await knexInstance('chat_tokens').select('*').where(filters)
    )
  }
  public async delete(filters: IFilterChatToken): Promise<void> {
    await knexInstance('chat_tokens').where(filters).delete()
  }
}