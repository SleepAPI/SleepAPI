import { Knex } from 'knex';

export enum Tables {}

export async function up(knex: Knex) {
  return knex;
}

export async function down(knex: Knex) {
  return knex;
}
