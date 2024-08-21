import { Knex } from "knex";
import { getFirst } from "../../modules/shared/utils/utils";
import supabase from "../../database/supabase/supabase";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  const count = await knex('user_roles').count("id").where({ role_id: 1 });
  if (Number(count[0]?.count)) return

  // Inserts seed entries
  const { data: { user }, error } = await supabase.auth.admin.createUser({
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    email_confirm: true
  })

  if (error) {
    console.log(error);
  }

  if (user) {
    const profile = getFirst(
      await knex('profiles')
        .insert({
          user_id: user.id,
          email: user.email,
          username: process.env.ADMIN_USERNAME,
          full_name: 'Demod Admin',
          company_name: 'Demod',
        }).returning("*")
    )

    if (profile) {
      await knex("user_roles").insert([
        { user_id: profile.id, role_id: 1 }
      ]);
    }
  }
};
