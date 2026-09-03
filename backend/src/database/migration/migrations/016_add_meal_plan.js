const Tables = Object.freeze({
  Team: 'team'
});

export async function up(knex) {
  await knex.schema.alterTable(Tables.Team, (table) => {
    table.string('meal_plan', 1024);
  });
}

export async function down(knex) {
  await knex.schema.alterTable(Tables.Team, (table) => {
    table.dropColumn('meal_plan');
  });
}
