import { recipes } from '../recipes';
import { recipeIconMap } from '../../components/icons/RecipeIcons';

describe('recipes data', () => {
  it('has at least one recipe', () => {
    expect(recipes.length).toBeGreaterThan(0);
  });

  it('every recipe has a unique id', () => {
    const ids = recipes.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every recipe has required fields', () => {
    for (const recipe of recipes) {
      expect(recipe.id).toBeTruthy();
      expect(recipe.name).toBeTruthy();
      expect(recipe.description).toBeTruthy();
      expect(recipe.category).toBeTruthy();
      expect(recipe.icon).toBeTruthy();
      expect(recipe.totalTimeMinutes).toBeGreaterThan(0);
      expect(recipe.steps.length).toBeGreaterThan(0);
    }
  });

  it('every recipe icon key maps to a valid icon component', () => {
    const validKeys = Object.keys(recipeIconMap);
    for (const recipe of recipes) {
      expect(validKeys).toContain(recipe.icon);
    }
  });

  it('every step has an instruction', () => {
    for (const recipe of recipes) {
      for (const step of recipe.steps) {
        expect(step.instruction).toBeTruthy();
      }
    }
  });

  it('timed steps have positive timeMinutes', () => {
    for (const recipe of recipes) {
      for (const step of recipe.steps) {
        if (step.timeMinutes !== undefined) {
          expect(step.timeMinutes).toBeGreaterThan(0);
        }
      }
    }
  });
});
