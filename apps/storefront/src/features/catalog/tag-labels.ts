// Vietnamese labels for the product tag convention `prefix:value` (see seed-catalog.ts on the backend)

export type TagGroup = 'species' | 'life' | 'health' | 'free' | 'form'

export type TagGroupDefinition = {
  key: TagGroup
  label: string
  options: { value: string; label: string }[]
}

export const TAG_GROUPS: TagGroupDefinition[] = [
  {
    key: 'species',
    label: 'Loài',
    options: [
      { value: 'cat', label: 'Mèo' },
      { value: 'dog', label: 'Chó' },
    ],
  },
  {
    key: 'life',
    label: 'Giai đoạn tuổi',
    options: [
      { value: 'kitten', label: 'Mèo con' },
      { value: 'puppy', label: 'Chó con' },
      { value: 'adult', label: 'Trưởng thành' },
      { value: 'senior', label: 'Lớn tuổi' },
      { value: 'all', label: 'Mọi lứa tuổi' },
    ],
  },
  {
    key: 'health',
    label: 'Nhu cầu sức khoẻ',
    options: [
      { value: 'urinary', label: 'Tiết niệu' },
      { value: 'hairball', label: 'Búi lông' },
      { value: 'sensitive-stomach', label: 'Tiêu hoá nhạy cảm' },
      { value: 'weight-control', label: 'Kiểm soát cân nặng' },
      { value: 'skin-coat', label: 'Da & lông' },
      { value: 'dental', label: 'Răng miệng' },
      { value: 'sterilised', label: 'Đã triệt sản' },
    ],
  },
  {
    key: 'free',
    label: 'Không chứa',
    options: [
      { value: 'chicken', label: 'Không gà' },
      { value: 'beef', label: 'Không bò' },
      { value: 'fish', label: 'Không cá' },
      { value: 'grain', label: 'Không ngũ cốc' },
    ],
  },
  {
    key: 'form',
    label: 'Dạng sản phẩm',
    options: [
      { value: 'dry', label: 'Thức ăn hạt' },
      { value: 'wet', label: 'Pate & thức ăn ướt' },
      { value: 'litter', label: 'Cát vệ sinh' },
      { value: 'treat', label: 'Snack' },
      { value: 'supplement', label: 'Dinh dưỡng bổ sung' },
      { value: 'accessory', label: 'Phụ kiện' },
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
