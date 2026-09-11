export async function up(knex) {
  await knex.schema.createTable('team_schedule_member', (table) => {
    table.increments('id').primary();
    table.integer('version').notNullable().defaultTo(1);
    table.integer('fk_team_id').unsigned().notNullable().references('id').inTable('team').onDelete('CASCADE');
    table.integer('fk_pokemon_id').unsigned().notNullable().references('id').inTable('pokemon').onDelete('CASCADE');
    table.boolean('sneaky_snacking').notNullable().defaultTo(false);
    table.unique(['fk_team_id', 'fk_pokemon_id']);
  });
}

export async function down(knex) {
  await knex.schema.dropTable('team_schedule_member');
}
