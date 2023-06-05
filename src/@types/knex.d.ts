// eslint-disable-next-line

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
      created_at: string
      session_id?: string
    }
    meals: {
      id: string
      name: string
      description: string
      date: Date
      fulfil_diet: boolean
      session_id?: string
    }
  }
}
