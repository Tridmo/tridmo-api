import { getFirst } from "../../shared/utils/utils";
import KnexService from '../../../database/connection';
import { ICreateInteriorView } from "./interface";

export default class InteriorViewsDAO {
  async create(values: ICreateInteriorView) {
    const { interior_id, user_id, ip_address, client_agent } = values;

    if (user_id) {
      // Registered user
      const query = KnexService('interior_views')
        .insert({
          interior_id,
          user_id,
          ip_address: null,
          client_agent: null
        })
        .onConflict(KnexService.raw(`(interior_id, user_id) WHERE user_id IS NOT NULL`))
        .ignore()
        .returning('*');

      const res = await query;
      console.log(res);
      return res;
    } else {
      // Unregistered user
      const query = KnexService('interior_views')
        .insert({
          interior_id,
          user_id: null,
          ip_address,
          client_agent
        })
        .onConflict(KnexService.raw(`(interior_id, ip_address, client_agent) WHERE user_id IS NULL`))
        .ignore()
        .returning('*');

      const res = await query;
      console.log(res);
      return res;
    }
  }


  async deleteById(id: number) {
    return await KnexService('interior_views')
      .where({ id: id })
      .delete()
  }

  async deleteByInterior(interior_id: string) {
    return await KnexService('interior_views')
      .where({
        interior_id
      })
      .delete()
  }
}