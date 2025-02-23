import { type Knex } from "knex";
import supabase from "../supabase/supabase.js";
import { authVariables } from "../../modules/auth/variables.js";

export async function seed(knex: Knex): Promise<void> {

  // Function to create user and insert profile
  async function createAdminUser(email: string, password: string, fullName: string, companyName: string, username: string) {
    // Check if user profile already exists in the database
    const existingProfile = await knex('profiles').select('id', 'user_id').where({ email, username }).first();

    if (existingProfile) {
      console.log(`User ${email} already exists.`);
      return;
    }

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, company_name: companyName },
    });

    let user = data?.user;

    if (error) {
      if (error.code === 'email_exists') {
        console.log(`Email ${email} already exists in Supabase. Fetching existing user.`);
        const existingUser = await knex('auth.users').select('*').where({ email });
        console.log("NIGGA: ", existingUser);
        user = existingUser[0]; // Get first matched user
      } else {
        console.error(`Error creating user ${email}:`, error);
        return;
      }
    }

    if (!user) {
      console.error(`Failed to retrieve or create user ${email}.`);
      return;
    }

    // Insert user profile
    const profile = (await knex('profiles')
      .insert({
        user_id: user.id,
        email: user.email,
        username,
        full_name: fullName,
        company_name: companyName,
      })
      .returning("*"))[0];

    // Assign role
    await knex("user_roles").insert([{ user_id: profile.id, role_id: authVariables.roles.admin }]);

    console.log(`Admin profile created for ${email}`);
  }

  // Create Demod Admin
  await createAdminUser(
    process.env.ADMIN_EMAIL!,
    process.env.ADMIN_PASSWORD!,
    'Demod Admin',
    'Demod',
    process.env.ADMIN_USERNAME!
  );

  // Create Timber Admin
  await createAdminUser(
    process.env.TIMBER_ADMIN_EMAIL!,
    process.env.TIMBER_ADMIN_PASSWORD!,
    'Timber Admin',
    'Timber',
    process.env.TIMBER_ADMIN_USERNAME!
  );
}
