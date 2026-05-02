import { RecipeForm } from "@/components/admin/recipe-form";
import { createRecipeAction } from "@/app/admin/actions";

export const metadata = { title: "New recipe" };

export default function NewRecipePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl">
        New recipe
      </h1>
      <RecipeForm
        action={createRecipeAction}
        submitLabel="Create recipe"
        initial={{
          title: "",
          slug: "",
          description: null,
          cuisine: null,
          course: null,
          difficulty: null,
          prep_time_minutes: null,
          cook_time_minutes: null,
          servings: null,
          hero_image_path: null,
          published: false,
          ingredients: [],
          instructions: [],
          tagSlugs: [],
        }}
      />
    </div>
  );
}
