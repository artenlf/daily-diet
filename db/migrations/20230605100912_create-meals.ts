import dayjs from 'dayjs'
import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('meal_id').primary()
    table.string('name').notNullable()
    table.string('description').notNullable()
    table
      .date('date')
      .defaultTo(dayjs().format('DD-MM-YYYY HH:mm'))
      .notNullable()
    table.boolean('fulfil_diet').defaultTo(false).notNullable()

    table.uuid('user_id').notNullable()
    table.foreign('user_id').references('users.user_id')

    table.uuid('session_id').notNullable()
    table.foreign('session_id').references('users.session_id')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
