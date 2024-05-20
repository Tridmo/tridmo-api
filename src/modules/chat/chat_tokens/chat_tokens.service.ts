import { IChatToken, ICreateChatToken, IFilterChatToken } from "./chat_tokens.interface";
import { ChatDao } from "./chat_tokens.dao";
import { ChatUtils } from "../utils";
import UsersService from "../../users/users.service";
import ErrorResponse from "../../shared/utils/errorResponse";
import { reqT } from "../../shared/utils/language";
import { secondsDiff } from "../../shared/utils/utils";
import { chatApi } from "../../../config/conf";

export default class ChatService {
  private dao = new ChatDao()
  private userService = new UsersService()
  private chat = new ChatUtils()

  async create(user_id: string): Promise<IChatToken> {
    const user = await this.userService.getById(user_id)
    if (!user) throw new ErrorResponse(404, reqT('user_404'))

    const tokens = await this.dao.getBy({ user_id });
    const exist = tokens.length ? tokens[0] : null

    if (!!exist) {
      const diff = secondsDiff(exist.created_at, new Date())
      if (diff >= chatApi.expiresIn) {
        const token = await this.chat.getChatToken(user_id);
        return await this.update(exist.id, { user_id, token })
      } else {
        return exist;
      }
    }

    const token = await this.chat.getChatToken(user_id);
    return await this.dao.create({ user_id, token, created_at: new Date() });
  }

  async update(id: string, values: IFilterChatToken): Promise<IChatToken | null> {
    const token = await this.dao.getBy({ id });
    if (!token[0]) return null;
    return await this.dao.update(id, values);
  }

  async findBy(values: IFilterChatToken): Promise<IChatToken[]> {
    return await this.dao.getBy(values);
  }

  async delete(where: IFilterChatToken) {
    await this.dao.delete(where);
  }
}