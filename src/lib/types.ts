export type PlantLogKind = 'regue' | 'sol' | 'hable' | 'nota'
export type Mood = 'muy_bien' | 'bien' | 'regular' | 'mal'
export type Sleep = 'excelente' | 'bien' | 'mal' | 'no_dormi'
export type Food = 'bien' | 'poco' | 'no_comi'
export type Study = 'muy_bien' | 'bien' | 'dificultad' | 'abruma'

export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface Plant {
  id: string
  owner_id: string
  name: string
  type: string
  photo_url: string | null
  water_every_days: number
  created_at: string
}

export interface PlantPhoto {
  id: string
  plant_id: string
  url: string
  taken_on: string
  created_at: string
}

export interface PlantLog {
  id: string
  plant_id: string
  kind: PlantLogKind
  note: string | null
  day: string
  created_at: string
}

export interface Wellbeing {
  id: string
  user_id: string
  day: string
  mood: Mood | null
  sleep: Sleep | null
  food: Food | null
  study: Study | null
  updated_at: string
}

export interface FeedPost {
  id: string
  user_id: string
  image_url: string
  caption: string | null
  created_at: string
  username: string
  avatar_url: string | null
  like_count: number
  comment_count: number
  liked_by_me: boolean
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  body: string
  created_at: string
  profiles: Pick<Profile, 'username' | 'avatar_url'> | null
}

export interface ProfileStats {
  id: string
  username: string
  followers: number
  following: number
  posts: number
}
