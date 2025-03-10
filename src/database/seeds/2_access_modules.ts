import { type Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("access_modules").del();

  // Inserts seed entries
  await knex("access_modules").insert([
    { id: 1, name: "get_role" },
    { id: 2, name: "get_roles" },
    { id: 3, name: "create_role" },
    { id: 4, name: "update_role" },
    { id: 5, name: "delete_role" },

    { id: 6, name: "get_user" },
    { id: 7, name: "get_users" },
    { id: 8, name: "create_user" },
    { id: 9, name: "update_user" },
    { id: 10, name: "delete_user" },

    { id: 11, name: "get_brand" },
    { id: 12, name: "get_brands" },
    { id: 13, name: "create_brand" },
    { id: 14, name: "update_brand" },
    { id: 15, name: "delete_brand" },

    { id: 16, name: "get_category" },
    { id: 17, name: "get_categories" },
    { id: 18, name: "create_category" },
    { id: 19, name: "update_category" },
    { id: 20, name: "delete_category" },

    { id: 21, name: "get_color" },
    { id: 22, name: "get_colors" },
    { id: 23, name: "create_color" },
    { id: 24, name: "update_color" },
    { id: 25, name: "delete_color" },

    { id: 26, name: "get_material" },
    { id: 27, name: "get_materials" },
    { id: 28, name: "create_material" },
    { id: 29, name: "update_material" },
    { id: 30, name: "delete_material" },

    { id: 31, name: "get_style" },
    { id: 32, name: "get_styles" },
    { id: 33, name: "create_style" },
    { id: 34, name: "update_style" },
    { id: 35, name: "delete_style" },

    { id: 36, name: "get_product" },
    { id: 37, name: "get_products" },
    { id: 38, name: "create_product" },
    { id: 39, name: "update_product" },
    { id: 40, name: "delete_product" },

    { id: 41, name: "get_interior" },
    { id: 42, name: "get_interiors" },
    { id: 43, name: "create_interior" },
    { id: 44, name: "update_interior" },
    { id: 45, name: "delete_interior" },

    { id: 46, name: "frontend_content_control" },
  ]);
};  