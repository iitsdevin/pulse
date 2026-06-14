import Dexie, { type EntityTable } from 'dexie'
import type {
  CompletedWorkout,
  LoggedWeight,
  PersonalRecord,
  AIProgramEntry,
  AppSettings,
  FavouriteEntry,
  Workout,
} from './types'
import { DEFAULT_SETTINGS } from './constants'

class PulseDB extends Dexie {
  completedWorkouts!: EntityTable<CompletedWorkout, 'id'>
  loggedWeights!: EntityTable<LoggedWeight, 'id'>
  personalRecords!: EntityTable<PersonalRecord, 'id'>
  aiPrograms!: EntityTable<AIProgramEntry, 'id'>
  settings!: EntityTable<AppSettings, 'id'>
  favourites!: EntityTable<FavouriteEntry, 'id'>

  constructor() {
    super('pulse')
    this.version(1).stores({
      completedWorkouts: '++id, workout_id, completed_at',
      loggedWeights: '++id, workout_id, exercise_slug, logged_at',
      personalRecords: '++id, exercise_slug',
      aiPrograms: '++id, created_at',
      settings: '++id',
    })
    this.version(2).stores({
      completedWorkouts: '++id, workout_id, completed_at',
      loggedWeights: '++id, workout_id, exercise_slug, logged_at',
      personalRecords: '++id, exercise_slug',
      aiPrograms: '++id, created_at',
      settings: '++id',
      favourites: '++id, workout_id, saved_at',
    })
  }
}

export const db = new PulseDB()

// Ensure default settings row exists
db.on('ready', async () => {
  const count = await db.settings.count()
  if (count === 0) {
    await db.settings.add({ ...DEFAULT_SETTINGS })
  }
})

// ── Settings helpers ──────────────────────────────────────────
export async function getSettings(): Promise<AppSettings> {
  const row = await db.settings.toCollection().first()
  // Merge so older saved rows pick up newly-added fields (theme, api_key).
  return { ...DEFAULT_SETTINGS, ...row }
}

// Wipes all logged history (completions, weights, PRs, AI programs). Keeps settings.
export async function resetHistory(): Promise<void> {
  await Promise.all([
    db.completedWorkouts.clear(),
    db.loggedWeights.clear(),
    db.personalRecords.clear(),
    db.aiPrograms.clear(),
  ])
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  const existing = await db.settings.toCollection().first()
  if (existing?.id != null) {
    await db.settings.update(existing.id, settings)
  }
}

// ── Completion helpers ────────────────────────────────────────
export async function markWorkoutComplete(
  workout_id: string,
  exercises_done: number,
  exercises_total: number,
): Promise<void> {
  await db.completedWorkouts.add({
    workout_id,
    completed_at: new Date().toISOString(),
    exercises_done,
    exercises_total,
  })
}

export async function getCompletedWorkouts(): Promise<CompletedWorkout[]> {
  return db.completedWorkouts.orderBy('completed_at').reverse().toArray()
}

export async function isWorkoutCompleted(workout_id: string): Promise<boolean> {
  const row = await db.completedWorkouts.where('workout_id').equals(workout_id).first()
  return row != null
}

// ── Weight logging ────────────────────────────────────────────
export async function logWeight(
  workout_id: string,
  exercise_slug: string,
  weight: string,
): Promise<void> {
  // Upsert: overwrite existing entry for this workout + exercise
  const existing = await db.loggedWeights
    .where('[workout_id+exercise_slug]')
    .equals([workout_id, exercise_slug])
    .first()

  if (existing?.id != null) {
    await db.loggedWeights.update(existing.id, { weight, logged_at: new Date().toISOString() })
  } else {
    await db.loggedWeights.add({
      workout_id,
      exercise_slug,
      weight,
      logged_at: new Date().toISOString(),
    })
  }

  // Update personal record if heavier
  await maybeUpdatePR(exercise_slug, weight)
}

export async function getLoggedWeightsForWorkout(
  workout_id: string,
): Promise<Record<string, string>> {
  const rows = await db.loggedWeights.where('workout_id').equals(workout_id).toArray()
  return Object.fromEntries(rows.map(r => [r.exercise_slug, r.weight]))
}

// ── Personal records ──────────────────────────────────────────
async function maybeUpdatePR(exercise_slug: string, weight: string): Promise<void> {
  const kg = parseFloat(weight)
  if (isNaN(kg)) return

  const existing = await db.personalRecords.where('exercise_slug').equals(exercise_slug).first()
  if (!existing || parseFloat(existing.weight) < kg) {
    if (existing?.id != null) {
      await db.personalRecords.update(existing.id, { weight, set_at: new Date().toISOString() })
    } else {
      await db.personalRecords.add({
        exercise_slug,
        exercise_name: exercise_slug.replace(/_/g, ' '),
        weight,
        set_at: new Date().toISOString(),
      })
    }
  }
}

export async function getPersonalRecords(): Promise<PersonalRecord[]> {
  return db.personalRecords.toArray()
}

// ── AI programs ───────────────────────────────────────────────
export async function saveAIProgram(
  prompt: string,
  program: Record<string, string>,
): Promise<void> {
  await db.aiPrograms.add({ created_at: new Date().toISOString(), prompt, program })
}

export async function getLatestAIProgram(): Promise<AIProgramEntry | null> {
  const row = await db.aiPrograms.orderBy('created_at').last()
  return row ?? null
}

export async function getAllAIPrograms(): Promise<AIProgramEntry[]> {
  return db.aiPrograms.orderBy('created_at').reverse().toArray()
}

// ── Favourites ────────────────────────────────────────────────
export async function getFavourites(): Promise<FavouriteEntry[]> {
  return db.favourites.orderBy('saved_at').reverse().toArray()
}

export async function addFavourite(workout: Workout): Promise<void> {
  const existing = await db.favourites.where('workout_id').equals(workout.workout_id).first()
  if (existing) return
  await db.favourites.add({ workout_id: workout.workout_id, saved_at: new Date().toISOString(), workout })
}

export async function removeFavourite(workout_id: string): Promise<void> {
  await db.favourites.where('workout_id').equals(workout_id).delete()
}
