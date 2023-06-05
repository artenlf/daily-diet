import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', function (table) {
    table.uuid('id').primary()
    table.string('name').notNullable()
    table.string('description').notNullable()
    table.timestamp('date').defaultTo(knex.fn.now())
    table.boolean('fulfil_diet').defaultTo(false)

    table.uuid('user_id').notNullable()
    table.foreign('user_id').references('users.id')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
