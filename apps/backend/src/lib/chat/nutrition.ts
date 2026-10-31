// Daily energy needs of cats and dogs, the same formula Phase 2 recommendations will use:
// RER = 70 × weight_kg^0.75 (kcal/day), DER = RER × k, grams/day = DER / (kcal_per_kg / 1000).
// The k factors are common textbook values, rounded; they give an estimate, not veterinary advice.

export type Species = "cat" | "dog"
export type LifeStage = "kitten" | "puppy" | "adult" | "senior"
export type Activity = "low" | "normal" | "high"
export type BodyGoal = "maintain" | "lose_weight" | "gain_weight"

export type PortionInput = {
  species: Species
  weight_kg: number
  life_stage: LifeStage
  neutered?: boolean
  activity?: Activity
  goal?: BodyGoal
}

export function restingEnergy(weightKg: number): number {
  return 70 * Math.pow(weightKg, 0.75)
}

export function energyFactor(input: PortionInput): { k: number; basis: string } {
  const { species, life_stage, neutered = true, activity = "normal", goal = "maintain" } = input

  if (goal === "lose_weight") return { k: species === "cat" ? 0.8 : 1.0, basis: "weight loss" }

  let k: number
  let basis: string
  if (species === "cat") {
    if (life_stage === "kitten") [k, basis] = [2.5, "growing kitten"]
    else if (life_stage === "senior") [k, basis] = [1.1, "senior cat"]
    else [k, basis] = neutered ? [1.2, "neutered adult cat"] : [1.4, "intact adult cat"]
    if (life_stage !== "kitten" && activity === "low") [k, basis] = [Math.min(k, 1.0), `${basis}, inactive`]
    if (life_stage !== "kitten" && activity === "high") [k, basis] = [k + 0.2, `${basis}, very active`]
  } else {
    if (life_stage === "puppy") [k, basis] = [2.5, "growing puppy"]
    else if (life_stage === "senior") [k, basis] = [1.4, "senior dog"]
    else [k, basis] = neutered ? [1.6, "neutered adult dog"] : [1.8, "intact adult dog"]
    if (life_stage !== "puppy" && activity === "low") [k, basis] = [1.3, `${basis}, inactive`]
    if (life_stage !== "puppy" && activity === "high") [k, basis] = [k + 0.6, `${basis}, very active`]
  }

  if (goal === "gain_weight") [k, basis] = [k * 1.2, `${basis}, weight gain`]
  return { k: Math.round(k * 100) / 100, basis }
}

/** Grams in a variant title such as "400g", "1.5kg", "4 tubes x 14g" (null when not a weight) */
export function packGrams(label: string): number | null {
  const match = /(?:(\d+)\s*(?:[a-z]+\s*)?[x×]\s*)?(\d+(?:[.,]\d+)?)\s*(kg|g)\b/i.exec(label)
  if (!match) return null
  const count = match[1] ? Number(match[1]) : 1
  const value = Number(match[2].replace(",", "."))
  const grams = match[3].toLowerCase() === "kg" ? value * 1000 : value
  return Math.round(count * grams)
}

export type PortionEstimate = {
  resting_energy_kcal: number
  daily_energy_kcal: number
  factor: number
  factor_basis: string
  grams_per_day?: number
  packs?: { label: string; grams: number; lasts_days: number }[]
}

export function estimatePortion(
  input: PortionInput,
  food?: { kcal_per_kg: number; packs?: string[] }
): PortionEstimate {
  const rer = restingEnergy(input.weight_kg)
  const { k, basis } = energyFactor(input)
  const der = rer * k
  const result: PortionEstimate = {
    resting_energy_kcal: Math.round(rer),
    daily_energy_kcal: Math.round(der),
    factor: k,
    factor_basis: basis,
  }

  if (food && food.kcal_per_kg > 0) {
    const gramsPerDay = der / (food.kcal_per_kg / 1000)
    result.grams_per_day = Math.round(gramsPerDay)
    result.packs = (food.packs ?? [])
      .map((label) => ({ label, grams: packGrams(label) }))
      .filter((p): p is { label: string; grams: number } => p.grams != null)
      .map((p) => ({ ...p, lasts_days: Math.floor(p.grams / gramsPerDay) }))
  }
  return result
}
