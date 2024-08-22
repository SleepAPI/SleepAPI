import { PokemonDAO } from '@src/database/dao/pokemon/pokemon-dao';
import { TeamDAO } from '@src/database/dao/team/team-dao';
import { TeamMemberDAO } from '@src/database/dao/team/team-member-dao';
import { UserDAO } from '@src/database/dao/user/user-dao';
import { IngredientError } from '@src/domain/error/ingredient/ingredient-error';
import { client } from '@src/services/api-service/login/login-service';
import {
  deleteMember,
  deleteTeam,
  getTeams,
  upsertTeamMember,
  upsertTeamMeta,
} from '@src/services/api-service/team/team-service';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture';
import { MockService } from '@src/utils/test-utils/mock-service';
import { uuid } from 'sleepapi-common';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true, enforceForeignKeyConstraints: true });

beforeEach(() => {
  uuid.v4 = jest.fn().mockReturnValue('0'.repeat(36));
  MockService.init({ TeamDAO, PokemonDAO, TeamMemberDAO, UserDAO, client });
});

afterEach(() => {
  MockService.restore();
});

describe('upsertTeam', () => {
  it('should create new team if team index does not previously exist', async () => {
    const user = await UserDAO.insert({
      external_id: 'user id',
      name: 'name',
      sub: 'sub',
    });

    expect(await TeamDAO.findMultiple()).toEqual([]);

    await upsertTeamMeta({
      fk_user_id: user.id,
      team_index: 0,
      name: 'some name',
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
    });

    expect(await TeamDAO.findMultiple()).toEqual([
      {
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        fk_user_id: user.id,
        id: 1,
        name: 'some name',
        team_index: 0,
        version: 1,
      },
    ]);
  });

  it('should update team if team index exists', async () => {
    const user = await UserDAO.insert({
      external_id: 'user id',
      name: 'name',
      sub: 'sub',
    });

    await TeamDAO.insert({
      name: 'old name',
      camp: false,
      fk_user_id: user.id,
      team_index: 0,
      bedtime: '21:30',
      wakeup: '06:00',
    });
    await upsertTeamMeta({
      fk_user_id: user.id,
      team_index: 0,
      name: 'new name',
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
    });

    expect(await TeamDAO.findMultiple()).toEqual([
      {
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        fk_user_id: user.id,
        id: 1,
        name: 'new name',
        team_index: 0,
        version: 2,
      },
    ]);
  });

  it('should insert new team for same owner if team_index not found', async () => {
    const user = await UserDAO.insert({
      external_id: 'user id',
      name: 'name',
      sub: 'sub',
    });

    await TeamDAO.insert({
      name: 'name',
      camp: false,
      fk_user_id: user.id,
      team_index: 0,
      bedtime: '21:30',
      wakeup: '06:00',
    });
    await upsertTeamMeta({
      fk_user_id: user.id,
      team_index: 1,
      name: 'name',
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
    });

    expect(await TeamDAO.findMultiple()).toEqual([
      {
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        fk_user_id: user.id,
        id: 1,
        name: 'name',
        team_index: 0,
        version: 1,
      },
      {
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        fk_user_id: user.id,
        id: 2,
        name: 'name',
        team_index: 1,
        version: 1,
      },
    ]);
  });
});

describe('getTeams', () => {
  it('should return an empty array if no teams exist for the user', async () => {
    const response = await getTeams({ id: 1, version: 1, name: 'some name', sub: 'some sub', external_id: uuid.v4() });

    expect(response).toEqual({ teams: [] });
  });

  it('should return teams for the user if teams exist', async () => {
    const user = await UserDAO.insert({
      external_id: 'user id',
      name: 'name',
      sub: 'sub',
    });

    await TeamDAO.insert({
      fk_user_id: user.id,
      team_index: 0,
      name: 'Team A',
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
    });
    await TeamDAO.insert({
      fk_user_id: user.id,
      team_index: 1,
      name: 'Team B',
      camp: true,
      bedtime: '21:30',
      wakeup: '06:00',
    });

    const response = await getTeams(user);

    expect(response).toEqual({
      teams: [
        { index: 0, name: 'Team A', camp: false, members: [], bedtime: '21:30', wakeup: '06:00', version: 1 },
        { index: 1, name: 'Team B', camp: true, bedtime: '21:30', wakeup: '06:00', members: [], version: 1 },
      ],
    });
  });

  it('should only return teams belonging to the specified user', async () => {
    const user1 = await UserDAO.insert({
      external_id: 'ext id 1',
      name: 'name1',
      sub: 'sub1',
    });
    const user2 = await UserDAO.insert({
      external_id: 'ext id 2',
      name: 'name2',
      sub: 'sub2',
    });

    await TeamDAO.insert({
      fk_user_id: user1.id,
      team_index: 0,
      name: 'Team A',
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
    });
    await TeamDAO.insert({
      fk_user_id: user2.id,
      team_index: 1,
      name: 'Team B',
      camp: true,
      bedtime: '21:30',
      wakeup: '06:00',
    });

    const response = await getTeams(user1);

    expect(response).toEqual({
      teams: [{ index: 0, name: 'Team A', camp: false, members: [], bedtime: '21:30', wakeup: '06:00', version: 1 }],
    });
  });
});

describe('upsertTeamMember', () => {
  it('should create a new pokemon if member doesnt exist', async () => {
    const user = await UserDAO.insert({
      external_id: 'user id',
      name: 'name',
      sub: 'sub',
    });

    const request = {
      version: 1,
      saved: true,
      shiny: false,
      externalId: uuid.v4(),
      pokemon: 'bulbasaur',
      name: 'Bulbasaur',
      level: 5,
      ribbon: 0,
      carrySize: 3,
      skillLevel: 2,
      nature: 'brave',
      subskills: [],
      ingredients: [
        { level: 0, ingredient: 'apple' },
        { level: 30, ingredient: 'apple' },
        { level: 60, ingredient: 'apple' },
      ],
    };

    const result = await upsertTeamMember({ teamIndex: 0, memberIndex: 0, request, user });

    expect(result).toEqual({
      memberIndex: 0,
      externalId: '0'.repeat(36),
      version: 1,
      saved: true,
      pokemon: 'bulbasaur',
      name: 'Bulbasaur',
      level: 5,
      shiny: false,
      ribbon: 0,
      carrySize: 3,
      skillLevel: 2,
      nature: 'brave',
      subskills: [],
      ingredients: [
        { level: 0, ingredient: 'apple' },
        { level: 30, ingredient: 'apple' },
        { level: 60, ingredient: 'apple' },
      ],
    });

    expect(await PokemonDAO.get({ external_id: result.externalId })).toEqual({
      id: 1,
      external_id: '0'.repeat(36),
      fk_user_id: user.id,
      saved: true,
      pokemon: 'bulbasaur',
      name: 'Bulbasaur',
      level: 5,
      shiny: false,
      ribbon: 0,
      carry_size: 3,
      skill_level: 2,
      nature: 'brave',
      subskill_10: undefined,
      subskill_25: undefined,
      subskill_50: undefined,
      subskill_75: undefined,
      subskill_100: undefined,
      ingredient_0: 'apple',
      ingredient_30: 'apple',
      ingredient_60: 'apple',
      version: 1,
    });

    expect(await TeamMemberDAO.findMultiple()).toEqual([
      {
        fk_team_id: 1,
        fk_pokemon_id: 1,
        member_index: 0,
        id: 1,
        version: 1,
      },
    ]);

    expect(await TeamDAO.findMultiple()).toEqual([
      {
        fk_user_id: 1,
        camp: false,
        team_index: 0,
        id: 1,
        version: 1,
        name: 'Helper team 1',
        bedtime: '21:30',
        wakeup: '06:00',
      },
    ]);
  });

  it('should update an existing member', async () => {
    const user = await UserDAO.insert({
      external_id: 'user id',
      name: 'name',
      sub: 'sub',
    });

    const request = {
      index: 0,
      version: 1,
      saved: true,
      shiny: false,
      externalId: uuid.v4(),
      pokemon: 'bulbasaur',
      name: 'Bulbasaur',
      level: 10,
      ribbon: 0,
      carrySize: 5,
      skillLevel: 3,
      nature: 'bold',
      subskills: [
        { level: 10, subskill: 'quick-attack' },
        { level: 25, subskill: 'solar-beam' },
      ],
      ingredients: [
        { level: 0, ingredient: 'apple' },
        { level: 30, ingredient: 'berry' },
        { level: 60, ingredient: 'pearl' },
      ],
    };

    // should get updated to version 2
    await TeamDAO.insert({
      fk_user_id: user.id,
      camp: false,
      name: 'test team',
      team_index: 0,
      bedtime: '21:30',
      wakeup: '06:00',
    });

    await PokemonDAO.insert({
      external_id: request.externalId,
      fk_user_id: user.id,
      saved: true,
      shiny: false,
      pokemon: 'bulbasaur',
      name: 'Bulbasaur',
      level: 5,
      ribbon: 0,
      carry_size: 3,
      skill_level: 2,
      nature: 'brave',
      subskill_10: 'helping bonus',
      subskill_25: undefined,
      subskill_50: undefined,
      subskill_75: undefined,
      subskill_100: undefined,
      ingredient_0: 'apple',
      ingredient_30: 'apple',
      ingredient_60: 'apple',
    });

    const result = await upsertTeamMember({ teamIndex: 0, memberIndex: 0, request, user });

    expect(result).toEqual({
      memberIndex: 0,
      externalId: request.externalId,
      version: 2,
      saved: true,
      shiny: false,
      pokemon: 'bulbasaur',
      name: 'Bulbasaur',
      level: 10,
      ribbon: 0,
      carrySize: 5,
      skillLevel: 3,
      nature: 'bold',
      subskills: [
        { level: 10, subskill: 'quick-attack' },
        { level: 25, subskill: 'solar-beam' },
      ],
      ingredients: [
        { level: 0, ingredient: 'apple' },
        { level: 30, ingredient: 'berry' },
        { level: 60, ingredient: 'pearl' },
      ],
    });

    expect(await PokemonDAO.get({ external_id: result.externalId })).toEqual({
      id: 1,
      external_id: request.externalId,
      fk_user_id: user.id,
      saved: true,
      shiny: false,
      ribbon: 0,
      pokemon: 'bulbasaur',
      name: 'Bulbasaur',
      level: 10,
      carry_size: 5,
      skill_level: 3,
      nature: 'bold',
      subskill_10: 'quick-attack',
      subskill_25: 'solar-beam',
      subskill_50: undefined,
      subskill_75: undefined,
      subskill_100: undefined,
      ingredient_0: 'apple',
      ingredient_30: 'berry',
      ingredient_60: 'pearl',
      version: 2,
    });

    expect(await TeamMemberDAO.get({ fk_team_id: 1, member_index: 0 })).toEqual({
      fk_team_id: 1,
      fk_pokemon_id: 1,
      member_index: 0,
      id: 1,
      version: 1,
    });

    expect(await TeamDAO.findMultiple()).toEqual([
      {
        fk_user_id: 1,
        camp: false,
        team_index: 0,
        id: 1,
        version: 2,
        name: 'test team',
        bedtime: '21:30',
        wakeup: '06:00',
      },
    ]);
  });

  it('should throw an error if required ingredient is missing', async () => {
    const user = await UserDAO.insert({
      external_id: 'user id',
      name: 'name',
      sub: 'sub',
    });

    const request = {
      version: 1,
      saved: true,
      shiny: false,
      externalId: uuid.v4(),
      pokemon: 'bulbasaur',
      name: 'Bulbasaur',
      level: 10,
      ribbon: 0,
      carrySize: 5,
      skillLevel: 3,
      nature: 'bold',
      subskills: [
        { level: 10, subskill: 'quick-attack' },
        { level: 25, subskill: 'solar-beam' },
      ],
      ingredients: [
        { level: 0, ingredient: 'apple' },
        { level: 30, ingredient: 'berry' },
        // Missing ingredient for level 60
      ],
    };

    await expect(upsertTeamMember({ teamIndex: 0, memberIndex: 0, request, user })).rejects.toThrow(IngredientError);
  });
});

describe('deleteMember', () => {
  it('should delete the member and its associated Pokemon if not saved and not in other teams', async () => {
    const user = await UserDAO.insert({
      external_id: 'user id',
      name: 'name',
      sub: 'sub',
    });

    const team = await TeamDAO.insert({
      fk_user_id: user.id,
      team_index: 0,
      name: 'Team A',
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
    });

    const pokemon = await PokemonDAO.insert({
      external_id: uuid.v4(),
      fk_user_id: user.id,
      saved: false,
      shiny: false,
      pokemon: 'bulbasaur',
      name: 'Bulbasaur',
      level: 5,
      ribbon: 0,
      carry_size: 3,
      skill_level: 2,
      nature: 'brave',
      subskill_10: 'quick-attack',
      subskill_25: 'solar-beam',
      subskill_50: 'razor-leaf',
      subskill_75: 'growl',
      subskill_100: 'tackle',
      ingredient_0: 'apple',
      ingredient_30: 'berry',
      ingredient_60: 'pearl',
    });

    await TeamMemberDAO.insert({ fk_team_id: team.id, fk_pokemon_id: pokemon.id, member_index: 0 });

    await deleteMember({ teamIndex: 0, memberIndex: 0, user });

    expect(await TeamMemberDAO.findMultiple()).toEqual([]);
    expect(await PokemonDAO.findMultiple()).toEqual([]);
  });

  it('should not delete the Pokemon if it is saved', async () => {
    const user = await UserDAO.insert({
      external_id: 'user id',
      name: 'name',
      sub: 'sub',
    });

    const team = await TeamDAO.insert({
      fk_user_id: user.id,
      team_index: 0,
      name: 'Team A',
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
    });

    const pokemon = await PokemonDAO.insert({
      external_id: uuid.v4(),
      fk_user_id: user.id,
      saved: true,
      shiny: false,
      pokemon: 'bulbasaur',
      name: 'Bulbasaur',
      level: 5,
      ribbon: 0,
      carry_size: 3,
      skill_level: 2,
      nature: 'brave',
      subskill_10: 'quick-attack',
      subskill_25: 'solar-beam',
      subskill_50: 'razor-leaf',
      subskill_75: 'growl',
      subskill_100: 'tackle',
      ingredient_0: 'apple',
      ingredient_30: 'berry',
      ingredient_60: 'pearl',
    });

    await TeamMemberDAO.insert({ fk_team_id: team.id, fk_pokemon_id: pokemon.id, member_index: 0 });

    await deleteMember({ teamIndex: 0, memberIndex: 0, user });

    expect(await TeamMemberDAO.findMultiple()).toEqual([]);
    expect(await PokemonDAO.findMultiple()).toEqual([pokemon]);
  });

  it('should not delete the Pokemon if it is in another team', async () => {
    const user = await UserDAO.insert({
      external_id: 'user id',
      name: 'name',
      sub: 'sub',
    });

    const team1 = await TeamDAO.insert({
      fk_user_id: user.id,
      team_index: 0,
      name: 'Team A',
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
    });
    const team2 = await TeamDAO.insert({
      fk_user_id: user.id,
      team_index: 1,
      name: 'Team B',
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
    });

    const pokemon = await PokemonDAO.insert({
      external_id: uuid.v4(),
      fk_user_id: user.id,
      saved: false,
      shiny: false,
      pokemon: 'bulbasaur',
      name: 'Bulbasaur',
      level: 5,
      ribbon: 0,
      carry_size: 3,
      skill_level: 2,
      nature: 'brave',
      subskill_10: 'quick-attack',
      subskill_25: 'solar-beam',
      subskill_50: 'razor-leaf',
      subskill_75: 'growl',
      subskill_100: 'tackle',
      ingredient_0: 'apple',
      ingredient_30: 'berry',
      ingredient_60: 'pearl',
    });

    await TeamMemberDAO.insert({ fk_team_id: team1.id, fk_pokemon_id: pokemon.id, member_index: 0 });
    await TeamMemberDAO.insert({ fk_team_id: team2.id, fk_pokemon_id: pokemon.id, member_index: 1 });

    await deleteMember({ teamIndex: 0, memberIndex: 0, user });

    expect(await TeamMemberDAO.findMultiple()).toEqual([
      { fk_team_id: team2.id, fk_pokemon_id: pokemon.id, member_index: 1, id: 2, version: 1 },
    ]);
    expect(await PokemonDAO.findMultiple()).toEqual([pokemon]);
  });
});

describe('deleteTeam', () => {
  it('shall delete team and its unsaved members', async () => {
    const user = await UserDAO.insert({
      external_id: 'user id',
      name: 'name',
      sub: 'sub',
    });

    const team = await TeamDAO.insert({
      name: 'old name',
      camp: false,
      fk_user_id: user.id,
      team_index: 0,
      bedtime: '21:30',
      wakeup: '06:00',
    });

    const pkmn = await PokemonDAO.insert({
      external_id: 'external id',
      fk_user_id: user.id,
      saved: false,
      shiny: false,
      pokemon: 'bulbasaur',
      name: 'Bulbasaur',
      level: 5,
      ribbon: 0,
      carry_size: 3,
      skill_level: 2,
      nature: 'brave',
      subskill_10: 'helping bonus',
      subskill_25: undefined,
      subskill_50: undefined,
      subskill_75: undefined,
      subskill_100: undefined,
      ingredient_0: 'apple',
      ingredient_30: 'apple',
      ingredient_60: 'apple',
    });

    await TeamMemberDAO.insert({
      fk_pokemon_id: pkmn.id,
      fk_team_id: team.id,
      member_index: 0,
    });

    await deleteTeam(team.team_index, user);

    expect(await TeamDAO.findMultiple()).toHaveLength(0);
    expect(await TeamMemberDAO.findMultiple()).toHaveLength(0);
    expect(await PokemonDAO.findMultiple()).toHaveLength(0);
    expect(await UserDAO.findMultiple()).toHaveLength(1);
  });

  it('shall delete team without members', async () => {
    const user = await UserDAO.insert({
      external_id: 'user id',
      name: 'name',
      sub: 'sub',
    });

    const team = await TeamDAO.insert({
      name: 'old name',
      camp: false,
      fk_user_id: user.id,
      team_index: 0,
      bedtime: '21:30',
      wakeup: '06:00',
    });

    await deleteTeam(team.team_index, user);

    expect(await TeamDAO.findMultiple()).toHaveLength(0);
    expect(await UserDAO.findMultiple()).toHaveLength(1);
  });

  it('shall not delete saved pokemon', async () => {
    const user = await UserDAO.insert({
      external_id: 'user id',
      name: 'name',
      sub: 'sub',
    });

    const team = await TeamDAO.insert({
      name: 'old name',
      camp: false,
      fk_user_id: user.id,
      team_index: 0,
      bedtime: '21:30',
      wakeup: '06:00',
    });

    const pkmn = await PokemonDAO.insert({
      external_id: 'external id',
      fk_user_id: user.id,
      saved: true,
      shiny: false,
      pokemon: 'bulbasaur',
      name: 'Bulbasaur',
      level: 5,
      ribbon: 0,
      carry_size: 3,
      skill_level: 2,
      nature: 'brave',
      subskill_10: 'helping bonus',
      subskill_25: undefined,
      subskill_50: undefined,
      subskill_75: undefined,
      subskill_100: undefined,
      ingredient_0: 'apple',
      ingredient_30: 'apple',
      ingredient_60: 'apple',
    });

    await TeamMemberDAO.insert({
      fk_pokemon_id: pkmn.id,
      fk_team_id: team.id,
      member_index: 0,
    });

    await deleteTeam(team.team_index, user);

    expect(await TeamDAO.findMultiple()).toHaveLength(0);
    expect(await TeamMemberDAO.findMultiple()).toHaveLength(0);
    expect(await PokemonDAO.findMultiple()).toHaveLength(1);
    expect(await UserDAO.findMultiple()).toHaveLength(1);
  });
});
