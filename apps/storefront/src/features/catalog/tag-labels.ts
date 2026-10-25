// Display labels for the product tag convention `prefix:value` (see seed-catalog.ts on the backend)

export type TagGroup = 'species' | 'life' | 'health' | 'free' | 'form'

export type TagGroupDefinition = {
  key: TagGroup
  label: string
  options: { value: string; label: string }[]
}

export const TAG_GROUPS: TagGroupDefinition[] = [
  {
    key: 'species',
    label: 'Pet',
    options: [
      { value: 'cat', label: 'Cat' },
      { value: 'dog', label: 'Dog' },
    ],
  },
  {
    key: 'life',
    label: 'Life stage',
    options: [
      { value: 'kitten', label: 'Kitten' },
      { value: 'puppy', label: 'Puppy' },
      { value: 'adult', label: 'Adult' },
      { value: 'senior', label: 'Senior' },
      { value: 'all', label: 'All ages' },
    ],
  },
  {
    key: 'health',
    label: 'Health needs',
    options: [
      { value: 'urinary', label: 'Urinary care' },
      { value: 'hairball', label: 'Hairball control' },
      { value: 'sensitive-stomach', label: 'Sensitive stomach' },
      { value: 'weight-control', label: 'Weight control' },
      { value: 'skin-coat', label: 'Skin & coat' },
      { value: 'dental', label: 'Dental care' },
      { value: 'sterilised', label: 'Neutered' },
    ],
  },
  {
    key: 'free',
    label: 'Free from',
    options: [
      { value: 'chicken', label: 'No chicken' },
      { value: 'beef', label: 'No beef' },
      { value: 'fish', label: 'No fish' },
      { value: 'grain', label: 'Grain-free' },
    ],
  },
  {
    key: 'form',
    label: 'Product type',
    options: [
      { value: 'dry', label: 'Dry food' },
      { value: 'wet', label: 'Wet food' },
      { value: 'litter', label: 'Litter' },
      { value: 'treat', label: 'Treats' },
      { value: 'supplement', label: 'Supplements' },
      { value: 'accessory', label: 'Accessories' },
    ],
  },
]

const LABELS = new Map<string, string>(TAG_GROUPS.flatMap((g) => g.options.map((o) => [`${g.key}:${o.value}`, o.label] as const)))

export function tagLabel(tag: string): string | undefined {
  return LABELS.get(tag)
}

/** Health needs shown as small badges on product cards */
export function healthLabels(tags: { value: string }[] | null | undefined): string[] {
  return (tags ?? [])
    .filter((t) => t.value.startsWith('health:'))
    .map((t) => tagLabel(t.value))
    .filter((label): label is string => Boolean(label))
}
