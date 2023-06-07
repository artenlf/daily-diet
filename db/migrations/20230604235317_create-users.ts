import dayjs from 'dayjs'
import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('user_id').primary()
    table.text('name').notNullable()
    table.text('email').notNullable()
    table
      .timestamp('created_at')
      .defaultTo(dayjs().format('DD-MM-YYYY HH:mm:ss'))
      .notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users')
}
