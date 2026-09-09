"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import {
  IngredientEditor,
  type IngredientDraft,
} from "@/components/admin/ingredient-editor";
import {
  InstructionEditor,
  type InstructionDraft,
} from "@/components/admin/instruction-editor";
import { recipeImageUrl } from "@/lib/storage";
import { slugify } from "@/lib/slug";
import type { RecipeFormState } from "@/app/admin/actions";

export type RecipeFormInitial = {
  id?: string;
  title: string;
  slug: string;
  description: string | null;
  cuisine: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  hero_image_path: string | null;
  published: boolean;
  ingredients: IngredientDraft[];
  instructions: InstructionDraft[];
  tagSlugs: string[];
};

export function RecipeForm({
  initial,
  action,
  submitLabel,
}: {
  initial: RecipeFormInitial;
  action: (
    prev: RecipeFormState,
    formData: FormData,
  ) => Promise<RecipeFormState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<
    RecipeFormState,
    FormData
  >(action, undefined);

  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugDirty, setSlugDirty] = useState(initial.slug.length > 0);
  const [ingredients, setIngredients] = useState<IngredientDraft[]>(
    initial.ingredients,
  );
  const [instructions, setInstructions] = useState<InstructionDraft[]>(
    initial.instructions,
  );
  const [tagsInput, setTagsInput] = useState(initial.tagSlugs.join(", "));

  const heroUrl = recipeImageUrl(initial.hero_image_path);

  return (
    <form action={formAction} className="space-y-8">
      <input
        type="hidden"
        name="ingredients"
        value={JSON.stringify(
          ingredients.map((r, i) => ({
            position: i + 1,
            quantity: r.quantity,
            unit: r.unit,
            name: r.name,
            notes: r.notes,
          })),
        )}
      />
      <input
        type="hidden"
        name="instructions"
        value={JSON.stringify(
          instructions.map((r, i) => ({ position: i + 1, step: r.step })),
        )}
      />
      <input
        type="hidden"
        name="tagSlugs"
        value={JSON.stringify(
          tagsInput
            .split(",")
            .map((t) => slugify(t))
            .filter((t) => t.length > 0),
        )}
      />

      {state?.ok === false && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <fieldset className="space-y-4">
        <Field label="Title" required>
          <input
            name="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugDirty) setSlug(slugify(e.target.value));
            }}
            required
            maxLength={200}
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 bg-white"
          />
        </Field>
        <Field label="Slug" hint="Lowercase letters, numbers, and dashes only.">
          <input
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlugDirty(true);
              setSlug(e.target.value);
            }}
            pattern="[a-z0-9-]+"
            maxLength={80}
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 bg-white font-mono text-sm"
          />
        </Field>
        <Field label="Description">
          <textarea
            name="description"
            defaultValue={initial.description ?? ""}
            rows={3}
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 bg-white"
            maxLength={2000}
          />
        </Field>
        <Field label="Cuisine">
          <input
            name="cuisine"
            defaultValue={initial.cuisine ?? ""}
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 bg-white"
            maxLength={80}
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Prep (min)">
            <input
              type="number"
              min={0}
              name="prep_time_minutes"
              defaultValue={initial.prep_time_minutes ?? ""}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 bg-white"
            />
          </Field>
          <Field label="Cook (min)">
            <input
              type="number"
              min={0}
              name="cook_time_minutes"
              defaultValue={initial.cook_time_minutes ?? ""}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 bg-white"
            />
          </Field>
          <Field label="Servings">
            <input
              type="number"
              min={1}
              name="servings"
              defaultValue={initial.servings ?? ""}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 bg-white"
            />
          </Field>
        </div>
        <Field
          label="Tags"
          hint="Comma-separated. New tags are created automatically."
        >
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="weeknight, vegetarian, comfort"
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 bg-white"
          />
        </Field>

        <Field label="Hero image">
          <div className="space-y-2">
            {heroUrl && (
              <div className="flex items-center gap-3">
                <div className="relative w-32 aspect-[4/3] rounded-lg overflow-hidden border border-[var(--color-border)]">
                  <Image
                    src={heroUrl}
                    alt="Current"
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                </div>
                <label className="text-xs flex items-center gap-1 text-[var(--color-ink-soft)]">
                  <input type="checkbox" name="remove_hero_image" />
                  Remove current image
                </label>
              </div>
            )}
            <input
              type="file"
              name="hero_image"
              accept="image/*,.heic,.heif"
              className="text-sm"
            />
          </div>
        </Field>

        <Field label="">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="published"
              defaultChecked={initial.published}
            />
            Published (visible to everyone)
          </label>
        </Field>
      </fieldset>

      <section className="space-y-2">
        <h2 className="font-[family-name:var(--font-display)] text-xl">
          Ingredients
        </h2>
        <IngredientEditor
          initial={initial.ingredients}
          onChange={setIngredients}
        />
      </section>

      <section className="space-y-2">
        <h2 className="font-[family-name:var(--font-display)] text-xl">
          Instructions
        </h2>
        <InstructionEditor
          initial={initial.instructions}
          onChange={setInstructions}
        />
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-[var(--color-accent)] text-white px-5 py-2 text-sm hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      {label && (
        <span className="block mb-1 text-[var(--color-ink-soft)]">
          {label}
          {required && <span className="text-red-600"> *</span>}
        </span>
      )}
      {children}
      {hint && (
        <span className="block mt-1 text-xs text-[var(--color-ink-soft)]/80">
          {hint}
        </span>
      )}
    </label>
  );
}
