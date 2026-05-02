import { notFound } from "next/navigation";
import { RecipeForm } from "@/components/admin/recipe-form";
import { updateRecipeAction } from "@/app/admin/actions";
import { getRecipeById } from "@/lib/recipes";

export const metadata = { title: "Edit recipe" };
export const dynamic = "force-dynamic";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await getRecipeById(id);
  if (!recipe) notFound();

  const updateForRecipe = updateRecipeAction.bind(null, id);

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl">
        Edit: {recipe.title}
      </h1>
      <RecipeForm
        action={updateForRecipe}
        submitLabel="Save changes"
        initial={{
          id: recipe.id,
          title: recipe.title,
          slug: recipe.slug,
          description: recipe.description,
          cuisine: recipe.cuisine,
          prep_time_minutes: recipe.prep_time_minutes,
          cook_time_minutes: recipe.cook_time_minutes,
          servings: recipe.servings,
          hero_image_path: recipe.hero_image_path,
          published: recipe.published,
          ingredients: recipe.ingredients.map((i) => ({
            quantity: i.quantity,
            unit: i.unit,
            name: i.name,
            notes: i.notes,
          })),
          instructions: recipe.instructions.map((i) => ({ step: i.step })),
          tagSlugs: recipe.tags.map((t) => t.slug),
        }}
      />
    </div>
  );
}
