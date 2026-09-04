const Tables = { Team: 'team' };

export async function up(knex) {
  if (!(await knex.schema.hasColumn(Tables.Team, 'schedule'))) {
    await knex.schema.alterTable(Tables.Team, (table) => table.text('schedule'));
  }
}

export async function down(knex) {
  if (await knex.schema.hasColumn(Tables.Team, 'schedule')) {
    await knex.schema.alterTable(Tables.Team, (table) => table.dropColumn('schedule'));
  }
}
