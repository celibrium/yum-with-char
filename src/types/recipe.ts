import type { Database } from "@/types/database";

export type Recipe = Database["public"]["Tables"]["recipes"]["Row"];
export type RecipeInsert = Database["public"]["Tables"]["recipes"]["Insert"];
export type Ingredient =
  Database["public"]["Tables"]["ingredients"]["Row"];
export type Instruction =
  Database["public"]["Tables"]["instructions"]["Row"];
export type Tag = Database["public"]["Tables"]["tags"]["Row"];

export type RecipeWithDetails = Recipe & {
  ingredients: Ingredient[];
  instructions: Instruction[];
  tags: Tag[];
};

export type RecipeListItem = Pick<
  Recipe,
  | "id"
  | "slug"
  | "title"
  | "description"
  | "cuisine"
  | "hero_image_path"
  | "prep_time_minutes"
  | "cook_time_minutes"
  | "published"
  | "like_count"
  | "created_at"
>;
