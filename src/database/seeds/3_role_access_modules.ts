import { type Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("role_access_modules").del();

  // Inserts seed entries
  await knex("role_access_modules").insert([
    //Admin
    { access_module_id: 1, role_id: 1 },
    { access_module_id: 2, role_id: 1 },
    { access_module_id: 3, role_id: 1 },
    { access_module_id: 4, role_id: 1 },
    { access_module_id: 5, role_id: 1 },

    { access_module_id: 6, role_id: 1 },
    { access_module_id: 7, role_id: 1 },
    { access_module_id: 8, role_id: 1 },
    { access_module_id: 9, role_id: 1 },
    { access_module_id: 10, role_id: 1 },

    { access_module_id: 11, role_id: 1 },
    { access_module_id: 12, role_id: 1 },
    { access_module_id: 13, role_id: 1 },
    { access_module_id: 14, role_id: 1 },
    { access_module_id: 15, role_id: 1 },

    { access_module_id: 16, role_id: 1 },
    { access_module_id: 17, role_id: 1 },
    { access_module_id: 18, role_id: 1 },
    { access_module_id: 19, role_id: 1 },
    { access_module_id: 20, role_id: 1 },

    { access_module_id: 21, role_id: 1 },
    { access_module_id: 22, role_id: 1 },
    { access_module_id: 23, role_id: 1 },
    { access_module_id: 24, role_id: 1 },
    { access_module_id: 25, role_id: 1 },

    { access_module_id: 26, role_id: 1 },
    { access_module_id: 27, role_id: 1 },
    { access_module_id: 28, role_id: 1 },
    { access_module_id: 29, role_id: 1 },
    { access_module_id: 30, role_id: 1 },

    { access_module_id: 31, role_id: 1 },
    { access_module_id: 32, role_id: 1 },
    { access_module_id: 33, role_id: 1 },
    { access_module_id: 34, role_id: 1 },
    { access_module_id: 35, role_id: 1 },

    { access_module_id: 36, role_id: 1 },
    { access_module_id: 37, role_id: 1 },
    { access_module_id: 38, role_id: 1 },
    { access_module_id: 39, role_id: 1 },
    { access_module_id: 40, role_id: 1 },

    { access_module_id: 41, role_id: 1 },
    { access_module_id: 42, role_id: 1 },
    { access_module_id: 43, role_id: 1 },
    { access_module_id: 44, role_id: 1 },
    { access_module_id: 45, role_id: 1 },

    { access_module_id: 46, role_id: 1 },

    //Brand
    { access_module_id: 6, role_id: 2 },
    { access_module_id: 9, role_id: 2 },
    { access_module_id: 14, role_id: 2 },
    { access_module_id: 11, role_id: 2 },
    { access_module_id: 12, role_id: 2 },
    { access_module_id: 16, role_id: 2 },
    { access_module_id: 17, role_id: 2 },
    { access_module_id: 21, role_id: 2 },
    { access_module_id: 23, role_id: 2 },
    { access_module_id: 26, role_id: 2 },
    { access_module_id: 27, role_id: 2 },
    { access_module_id: 31, role_id: 2 },
    { access_module_id: 32, role_id: 2 },
    { access_module_id: 38, role_id: 2 },
    { access_module_id: 39, role_id: 2 },
    { access_module_id: 40, role_id: 2 },
    { access_module_id: 41, role_id: 2 },
    { access_module_id: 42, role_id: 2 },
    { access_module_id: 43, role_id: 2 },
    { access_module_id: 44, role_id: 2 },
    { access_module_id: 45, role_id: 2 },

    // Designer
    { access_module_id: 6, role_id: 3 },
    { access_module_id: 9, role_id: 3 },
    { access_module_id: 11, role_id: 3 },
    { access_module_id: 12, role_id: 3 },
    { access_module_id: 16, role_id: 3 },
    { access_module_id: 17, role_id: 3 },
    { access_module_id: 21, role_id: 3 },
    { access_module_id: 23, role_id: 3 },
    { access_module_id: 26, role_id: 3 },
    { access_module_id: 27, role_id: 3 },
    { access_module_id: 31, role_id: 3 },
    { access_module_id: 32, role_id: 3 },
    { access_module_id: 41, role_id: 3 },
    { access_module_id: 42, role_id: 3 },
    { access_module_id: 43, role_id: 3 },
    { access_module_id: 44, role_id: 3 },
    { access_module_id: 45, role_id: 3 },
  ]);
};  