import { PokemonDAO } from '@src/database/dao/pokemon/pokemon-dao.js';
import { TeamAreaDAO } from '@src/database/dao/team/team-area/team-area-dao.js';
import { TeamMemberDAO } from '@src/database/dao/team/team-member/team-member-dao.js';
import { TeamDAO } from '@src/database/dao/team/team/team-dao.js';
import { UserAreaDAO } from '@src/database/dao/user/user-area/user-area-dao.js';
import type { DBUser } from '@src/database/dao/user/user/user-dao.js';
import { UserDAO } from '@src/database/dao/user/user/user-dao.js';
import { IngredientError } from '@src/domain/error/ingredient/ingredient-error.js';
import {
  deleteMember,
  deleteTeam,
  getTeams,
  upsertTeamMember,
  upsertTeamMeta
} from '@src/services/api-service/team/team-service.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { mocks } from '@src/vitest/index.js';
import type { UpsertTeamMemberRequest } from 'sleepapi-common';
import { getPokemon, Roles, uuid } from 'sleepapi-common';
import { vimic } from 'vimic';
import { beforeEach, describe, expect, it } from 'vitest';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true, enforceForeignKeyConstraints: true });
let user: DBUser;

async function createTeamAreaSetup(userId: number) {
  const userArea = await UserAreaDAO.insert({ area: 'greengrass', bonus: 0, fk_user_id: userId });
  const teamArea = await TeamAreaDAO.insert({ fk_user_area_id: userArea.id, favored_berries: '' });
  return teamArea.id;
}

beforeEach(async () => {
  vimic(uuid, 'v4', () => '0'.repeat(36));

  user = await UserDAO.insert(mocks.dbUser({ friend_code: 'AAAAAA', external_id: '1' }));
});

describe('upsertTeam', () => {
  it('should create new team if team index does not previously exist', async () => {
    expect(await TeamDAO.findMultiple()).toEqual([]);
    expect(await TeamAreaDAO.findMultiple()).toEqual([]);
    expect(await UserAreaDAO.findMultiple()).toEqual([]);

    await upsertTeamMeta({
      index: 0,
      request: {
        name: 'some name',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        recipeType: 'curry',
        island: mocks.islandDTO()
      },
      user
    });

    const teamArea = await TeamAreaDAO.findMultiple();
    const userArea = await UserAreaDAO.findMultiple();

    expect(teamArea).toHaveLength(1);
    expect(userArea).toHaveLength(1);

    expect(teamArea[0].fk_user_area_id).toEqual(userArea[0].id);
    expect(teamArea[0].favored_berries).toEqual(mocks.islandDTO().favoredBerries);

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
        recipe_type: 'curry',
        fk_team_area_id: teamArea[0].id
      }
    ]);
  });

  it('should update team if team index exists', async () => {
    const userArea = await UserAreaDAO.insert({ area: 'GGEX', bonus: 15, fk_user_id: user.id });
    const teamArea = await TeamAreaDAO.insert({
      fk_user_area_id: userArea.id,
      favored_berries: ''
    });
    await TeamDAO.insert({
      name: 'old name',
      camp: false,
      fk_user_id: user.id,
      team_index: 0,
      bedtime: '21:30',
      wakeup: '06:00',
      recipe_type: 'curry',
      fk_team_area_id: teamArea.id
    });

    await upsertTeamMeta({
      request: {
        name: 'new name',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        island: mocks.islandDTO({ islandName: 'greengrass' }), // team changed area, new user area will be created
        recipeType: 'curry'
      },
      user,
      index: 0
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
        recipe_type: 'curry',
        fk_team_area_id: teamArea.id
      }
    ]);
  });

  it('should persist expert mode berry data when creating a team', async () => {
    await upsertTeamMeta({
      index: 0,
      request: {
        name: 'Expert Team',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        recipeType: 'curry',
        island: mocks.expertIslandDTO()
      },
      user
    });

    const teamArea = await TeamAreaDAO.findMultiple();
    expect(teamArea).toHaveLength(1);
    expect(teamArea[0]).toMatchObject({
      favored_berries: 'BELUE',
      expert_modifier: 'ingredient',
      main_favorite_berry: 'BELUE',
      sub_favorite_berries: 'GREPA,BLUK'
    });
  });

  it('should update expert mode berry data on existing team', async () => {
    await upsertTeamMeta({
      index: 0,
      request: {
        name: 'Expert Team',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        recipeType: 'curry',
        island: mocks.expertIslandDTO()
      },
      user
    });

    await upsertTeamMeta({
      index: 0,
      request: {
        name: 'Expert Team Updated',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        recipeType: 'curry',
        island: mocks.expertIslandDTO({
          expertModifier: 'berry',
          mainFavoriteBerry: 'GREPA',
          subFavoriteBerries: 'BELUE,BLUK'
        })
      },
      user
    });

    const teamArea = await TeamAreaDAO.findMultiple();
    expect(teamArea).toHaveLength(1);
    expect(teamArea[0]).toMatchObject({
      expert_modifier: 'berry',
      main_favorite_berry: 'GREPA',
      sub_favorite_berries: 'BELUE,BLUK'
    });
  });

  it('should insert new team area when team does not exist', async () => {
    expect(await TeamDAO.findMultiple()).toEqual([]);
    expect(await TeamAreaDAO.findMultiple()).toEqual([]);
    expect(await UserAreaDAO.findMultiple()).toEqual([]);

    await upsertTeamMeta({
      index: 0,
      request: {
        name: 'New Team',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        recipeType: 'curry',
        island: mocks.islandDTO()
      },
      user
    });

    const teamArea = await TeamAreaDAO.findMultiple();
    const userArea = await UserAreaDAO.findMultiple();
    const teams = await TeamDAO.findMultiple();

    expect(teamArea).toHaveLength(1);
    expect(userArea).toHaveLength(1);
    expect(teams).toHaveLength(1);

    expect(teams[0].fk_team_area_id).toEqual(teamArea[0].id);
    expect(teamArea[0].fk_user_area_id).toEqual(userArea[0].id);
  });

  it('should insert new team for same owner if team_index not found', async () => {
    const user = await UserDAO.insert({
      external_id: 'user id',
      name: 'name',
      friend_code: 'TESTFC',
      google_id: 'google_id',
      role: Roles.Default
    });

    // Create required team_area relationship
    const userArea = await UserAreaDAO.insert({ area: 'greengrass', bonus: 0, fk_user_id: user.id });
    const teamArea = await TeamAreaDAO.insert({ fk_user_area_id: userArea.id, favored_berries: '' });

    await TeamDAO.insert({
      name: 'name',
      camp: false,
      fk_user_id: user.id,
      team_index: 0,
      bedtime: '21:30',
      wakeup: '06:00',
      recipe_type: 'curry',
      fk_team_area_id: teamArea.id
    });
    await upsertTeamMeta({
      request: {
        name: 'name',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        recipeType: 'curry',
        island: mocks.islandDTO()
      },
      user,
      index: 1
    });

    const teams = await TeamDAO.findMultiple();
    expect(teams).toHaveLength(2);
    expect(teams[0]).toMatchObject({
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
      fk_user_id: user.id,
      id: 1,
      name: 'name',
      team_index: 0,
      version: 1,
      recipe_type: 'curry'
    });
    expect(teams[1]).toMatchObject({
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
      fk_user_id: user.id,
      id: 2,
      name: 'name',
      team_index: 1,
      version: 1,
      recipe_type: 'curry'
    });
  });
});

describe('getTeams', () => {
  it('should return an empty array if no teams exist for the user', async () => {
    const response = await getTeams({
      id: 1,
      version: 1,
      name: 'some name',
      google_id: 'google_id',
      external_id: uuid.v4(),
      friend_code: 'TESTFC',
      role: Roles.Default
    });

    expect(response).toEqual({ teams: [] });
  });

  it('should return teams for the user if teams exist', async () => {
    const user = await UserDAO.insert({
      external_id: 'user id',
      name: 'name',
      friend_code: 'TESTFC',
      google_id: 'google_id',
      role: Roles.Default
    });

    // Create required team_area relationships
    const userArea = await UserAreaDAO.insert({ area: 'greengrass', bonus: 0, fk_user_id: user.id });
    const teamAreaOne = await TeamAreaDAO.insert({
      fk_user_area_id: userArea.id,
      favored_berries: ''
    });

    await TeamDAO.insert({
      fk_user_id: user.id,
      team_index: 0,
      name: 'Team A',
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
      recipe_type: 'curry',
      fk_team_area_id: teamAreaOne.id
    });
    const teamAreaTwo = await TeamAreaDAO.insert({ fk_user_area_id: userArea.id, favored_berries: '' });
    await TeamDAO.insert({
      fk_user_id: user.id,
      team_index: 1,
      name: 'Team B',
      camp: true,
      bedtime: '21:30',
      wakeup: '06:00',
      recipe_type: 'curry',
      fk_team_area_id: teamAreaTwo.id
    });

    const response = await getTeams(user);

    expect(response.teams).toHaveLength(2);
    expect(response.teams[0]).toMatchObject({
      index: 0,
      name: 'Team A',
      camp: false,
      members: [],
      bedtime: '21:30',
      wakeup: '06:00',
      version: 1,
      recipeType: 'curry'
    });
    expect(response.teams[1]).toMatchObject({
      index: 1,
      name: 'Team B',
      camp: true,
      bedtime: '21:30',
      wakeup: '06:00',
      members: [],
      version: 1,
      recipeType: 'curry'
    });
  });

  it('should return expert mode data when fetching teams', async () => {
    await upsertTeamMeta({
      index: 0,
      request: {
        name: 'Expert Team',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        recipeType: 'curry',
        island: mocks.expertIslandDTO()
      },
      user
    });

    const response = await getTeams(user);

    expect(response.teams).toHaveLength(1);
    expect(response.teams[0]).toMatchObject({
      index: 0,
      name: 'Expert Team',
      island: {
        islandName: 'GGEX',
        favoredBerries: 'BELUE',
        expertModifier: 'ingredient',
        mainFavoriteBerry: 'BELUE',
        subFavoriteBerries: 'GREPA,BLUK'
      }
    });
  });

  it('should return undefined expert mode fields for non-expert teams', async () => {
    await upsertTeamMeta({
      index: 0,
      request: {
        name: 'Normal Team',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        recipeType: 'curry',
        island: mocks.islandDTO()
      },
      user
    });

    const response = await getTeams(user);

    expect(response.teams).toHaveLength(1);
    expect(response.teams[0].island).toMatchObject({
      islandName: 'greengrass',
      favoredBerries: ''
    });
    expect(response.teams[0].island.expertModifier).toBeUndefined();
    expect(response.teams[0].island.mainFavoriteBerry).toBeUndefined();
    expect(response.teams[0].island.subFavoriteBerries).toBeUndefined();
  });

  it('should only return teams belonging to the specified user', async () => {
    const user1 = await UserDAO.insert({
      external_id: 'ext id 1',
      name: 'name1',
      friend_code: 'TESTF2',
      google_id: 'google_id1',
      role: Roles.Default
    });
    const user2 = await UserDAO.insert({
      external_id: 'ext id 2',
      name: 'name2',
      friend_code: 'TESTF1',
      google_id: 'google_id2',
      role: Roles.Default
    });

    // Create team areas for both users
    const userArea1 = await UserAreaDAO.insert({ area: 'greengrass', bonus: 0, fk_user_id: user1.id });
    const teamArea1 = await TeamAreaDAO.insert({ fk_user_area_id: userArea1.id, favored_berries: '' });

    const userArea2 = await UserAreaDAO.insert({ area: 'greengrass', bonus: 0, fk_user_id: user2.id });
    const teamArea2 = await TeamAreaDAO.insert({ fk_user_area_id: userArea2.id, favored_berries: '' });

    await TeamDAO.insert({
      fk_user_id: user1.id,
      team_index: 0,
      name: 'Team A',
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
      recipe_type: 'curry',
      fk_team_area_id: teamArea1.id
    });
    await TeamDAO.insert({
      fk_user_id: user2.id,
      team_index: 1,
      name: 'Team B',
      camp: true,
      bedtime: '21:30',
      wakeup: '06:00',
      recipe_type: 'curry',
      fk_team_area_id: teamArea2.id
    });

    const response = await getTeams(user1);

    expect(response.teams).toHaveLength(1);
    expect(response.teams[0]).toMatchObject({
      index: 0,
      name: 'Team A',
      camp: false,
      members: [],
      bedtime: '21:30',
      wakeup: '06:00',
      version: 1,
      recipeType: 'curry'
    });
  });
});

describe('upsertTeamMember', () => {
  it('should create a new pokemon if member doesnt exist', async () => {
    const user = await UserDAO.insert({
      external_id: 'user id',
      friend_code: 'TESTFC',
      name: 'name',
      google_id: 'google_id',
      role: Roles.Default
    });

    // Create a team first
    const teamAreaId = await createTeamAreaSetup(user.id);
    await TeamDAO.insert({
      fk_user_id: user.id,
      camp: false,
      name: 'test team',
      team_index: 0,
      bedtime: '21:30',
      wakeup: '06:00',
      recipe_type: 'curry',
      fk_team_area_id: teamAreaId
    });

    const request: UpsertTeamMemberRequest = {
      version: 1,
      saved: true,
      shiny: false,
      gender: 'female',
      externalId: uuid.v4(),
      pokemon: 'bulbasaur',
      name: 'Bulbasaur',
      level: 5,
      ribbon: 0,
      carrySize: getPokemon('Bulbasaur').carrySize,
      skillLevel: 2,
      nature: 'brave',
      subskills: [],
      ingredients: [
        { level: 0, name: 'apple', amount: 2 },
        { level: 30, name: 'apple', amount: 5 },
        { level: 60, name: 'apple', amount: 7 }
      ],
      sneakySnacking: false
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
      gender: 'female',
      ribbon: 0,
      carrySize: getPokemon('Bulbasaur').carrySize,
      skillLevel: 2,
      nature: 'brave',
      subskills: [],
      ingredients: [
        { level: 0, name: 'apple', amount: 2 },
        { level: 30, name: 'apple', amount: 5 },
        { level: 60, name: 'apple', amount: 7 }
      ],
      sneakySnacking: false
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
      gender: 'female',
      ribbon: 0,
      carry_size: getPokemon('Bulbasaur').carrySize,
      skill_level: 2,
      nature: 'brave',
      subskill_10: undefined,
      subskill_25: undefined,
      subskill_50: undefined,
      subskill_70: undefined,
      subskill_80: undefined,
      ingredient_0: 'apple',
      ingredient_30: 'apple',
      ingredient_60: 'apple',
      version: 1
    });

    expect(await TeamMemberDAO.findMultiple()).toEqual([
      {
        fk_team_id: 1,
        fk_pokemon_id: 1,
        member_index: 0,
        id: 1,
        version: 1,
        sneaky_snacking: false
      }
    ]);

    expect(await TeamDAO.findMultiple()).toEqual([
      {
        fk_user_id: user.id,
        fk_team_area_id: teamAreaId,
        camp: false,
        team_index: 0,
        id: 1,
        version: 2,
        name: 'test team',
        bedtime: '21:30',
        wakeup: '06:00',
        recipe_type: 'curry',
        stockpiled_berries: undefined,
        stockpiled_ingredients: undefined
      }
    ]);
  });

  it('should update an existing member', async () => {
    const user = await UserDAO.insert({
      external_id: 'user id',
      friend_code: 'TESTFC',
      name: 'name',
      google_id: 'google_id',
      role: Roles.Default
    });

    const teamAreaId = await createTeamAreaSetup(user.id);

    const request: UpsertTeamMemberRequest = {
      version: 1,
      saved: true,
      shiny: false,
      gender: 'female',
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
        { level: 25, subskill: 'solar-beam' }
      ],
      ingredients: [
        { level: 0, name: 'apple', amount: 2 },
        { level: 30, name: 'apple', amount: 5 },
        { level: 60, name: 'apple', amount: 7 }
      ],
      sneakySnacking: false
    };

    // should get updated to version 2
    await TeamDAO.insert({
      fk_user_id: user.id,
      camp: false,
      name: 'test team',
      team_index: 0,
      bedtime: '21:30',
      wakeup: '06:00',
      recipe_type: 'curry',
      fk_team_area_id: teamAreaId
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
      subskill_70: undefined,
      subskill_80: undefined,
      ingredient_0: 'apple',
      ingredient_30: 'apple',
      ingredient_60: 'apple'
    });

    const result = await upsertTeamMember({ teamIndex: 0, memberIndex: 0, request, user });

    expect(result).toEqual({
      memberIndex: 0,
      externalId: request.externalId,
      version: 2,
      saved: true,
      shiny: false,
      gender: 'female',
      pokemon: 'bulbasaur',
      name: 'Bulbasaur',
      level: 10,
      ribbon: 0,
      carrySize: getPokemon('Bulbasaur').carrySize,
      skillLevel: 3,
      nature: 'bold',
      subskills: [
        { level: 10, subskill: 'quick-attack' },
        { level: 25, subskill: 'solar-beam' }
      ],
      ingredients: [
        { level: 0, name: 'apple', amount: 2 },
        { level: 30, name: 'apple', amount: 5 },
        { level: 60, name: 'apple', amount: 7 }
      ],
      sneakySnacking: false
    });

    expect(await PokemonDAO.get({ external_id: result.externalId })).toEqual({
      id: 1,
      external_id: request.externalId,
      fk_user_id: user.id,
      saved: true,
      shiny: false,
      gender: 'female',
      ribbon: 0,
      pokemon: 'bulbasaur',
      name: 'Bulbasaur',
      level: 10,
      carry_size: getPokemon('Bulbasaur').carrySize,
      skill_level: 3,
      nature: 'bold',
      subskill_10: 'quick-attack',
      subskill_25: 'solar-beam',
      subskill_50: undefined,
      subskill_70: undefined,
      subskill_80: undefined,
      ingredient_0: 'apple',
      ingredient_30: 'apple',
      ingredient_60: 'apple',
      version: 2
    });

    expect(await TeamMemberDAO.get({ fk_team_id: 1, member_index: 0 })).toEqual({
      fk_team_id: 1,
      fk_pokemon_id: 1,
      member_index: 0,
      id: 1,
      version: 1,
      sneaky_snacking: false
    });

    expect(await TeamDAO.findMultiple()).toEqual([
      {
        fk_user_id: user.id,
        fk_team_area_id: teamAreaId,
        camp: false,
        team_index: 0,
        id: 1,
        version: 2,
        name: 'test team',
        bedtime: '21:30',
        wakeup: '06:00',
        recipe_type: 'curry',
        stockpiled_berries: undefined,
        stockpiled_ingredients: undefined
      }
    ]);
  });

  it.skip('should throw an error if required ingredient is missing', async () => {
    const user = await UserDAO.insert({
      external_id: 'user id',
      friend_code: 'TESTFC',
      name: 'name',
      google_id: 'google_id',
      role: Roles.Default
    });

    const request: UpsertTeamMemberRequest = {
      version: 1,
      saved: true,
      shiny: false,
      gender: 'female',
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
        { level: 25, subskill: 'solar-beam' }
      ],
      ingredients: [
        { level: 0, name: 'apple', amount: 2 },
        { level: 30, name: 'apple', amount: 5 }
        // Missing ingredient for level 60
      ],
      sneakySnacking: false
    };

    await expect(upsertTeamMember({ teamIndex: 0, memberIndex: 0, request, user })).rejects.toThrow(IngredientError);
  });
});

describe('deleteMember', () => {
  it('should delete the member and its associated Pokemon if not saved and not in other teams', async () => {
    const user = await UserDAO.insert({
      external_id: 'user id',
      friend_code: 'TESTFC',
      name: 'name',
      google_id: 'google_id',
      role: Roles.Default
    });

    const teamAreaId = await createTeamAreaSetup(user.id);
    const team = await TeamDAO.insert({
      fk_user_id: user.id,
      team_index: 0,
      name: 'Team A',
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
      recipe_type: 'curry',
      fk_team_area_id: teamAreaId
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
      subskill_70: 'growl',
      subskill_80: 'tackle',
      ingredient_0: 'apple',
      ingredient_30: 'berry',
      ingredient_60: 'pearl'
    });

    await TeamMemberDAO.insert({
      fk_team_id: team.id,
      fk_pokemon_id: pokemon.id,
      member_index: 0,
      sneaky_snacking: false
    });

    await deleteMember({ teamIndex: 0, memberIndex: 0, user });

    expect(await TeamMemberDAO.findMultiple()).toEqual([]);
    expect(await PokemonDAO.findMultiple()).toEqual([]);
  });

  it('should not delete the Pokemon if it is saved', async () => {
    const user = await UserDAO.insert({
      external_id: 'user id',
      friend_code: 'TESTFC',
      name: 'name',
      google_id: 'google_id',
      role: Roles.Default
    });

    const teamAreaId = await createTeamAreaSetup(user.id);
    const team = await TeamDAO.insert({
      fk_user_id: user.id,
      team_index: 0,
      name: 'Team A',
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
      recipe_type: 'curry',
      fk_team_area_id: teamAreaId
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
      subskill_70: 'growl',
      subskill_80: 'tackle',
      ingredient_0: 'apple',
      ingredient_30: 'berry',
      ingredient_60: 'pearl'
    });

    await TeamMemberDAO.insert({
      fk_team_id: team.id,
      fk_pokemon_id: pokemon.id,
      member_index: 0,
      sneaky_snacking: false
    });

    await deleteMember({ teamIndex: 0, memberIndex: 0, user });

    expect(await TeamMemberDAO.findMultiple()).toEqual([]);
    expect(await PokemonDAO.findMultiple()).toEqual([pokemon]);
  });

  it('should not delete the Pokemon if it is in another team', async () => {
    const user = await UserDAO.insert({
      external_id: 'user id',
      friend_code: 'TESTFC',
      name: 'name',
      google_id: 'google_id',
      role: Roles.Default
    });

    const teamAreaId = await createTeamAreaSetup(user.id);
    const secondUserArea = await UserAreaDAO.insert({ area: 'cyan', bonus: 0, fk_user_id: user.id });
    const secondTeamArea = await TeamAreaDAO.insert({ fk_user_area_id: secondUserArea.id, favored_berries: '' });
    const team1 = await TeamDAO.insert({
      fk_user_id: user.id,
      team_index: 0,
      name: 'Team A',
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
      recipe_type: 'curry',
      fk_team_area_id: teamAreaId
    });
    const team2 = await TeamDAO.insert({
      fk_user_id: user.id,
      team_index: 1,
      name: 'Team B',
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
      recipe_type: 'curry',
      fk_team_area_id: secondTeamArea.id
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
      subskill_70: 'growl',
      subskill_80: 'tackle',
      ingredient_0: 'apple',
      ingredient_30: 'berry',
      ingredient_60: 'pearl'
    });

    await TeamMemberDAO.insert({
      fk_team_id: team1.id,
      fk_pokemon_id: pokemon.id,
      member_index: 0,
      sneaky_snacking: false
    });
    await TeamMemberDAO.insert({
      fk_team_id: team2.id,
      fk_pokemon_id: pokemon.id,
      member_index: 1,
      sneaky_snacking: false
    });

    await deleteMember({ teamIndex: 0, memberIndex: 0, user });

    expect(await TeamMemberDAO.findMultiple()).toEqual([
      { fk_team_id: team2.id, fk_pokemon_id: pokemon.id, member_index: 1, id: 2, version: 1, sneaky_snacking: false }
    ]);
    expect(await PokemonDAO.findMultiple()).toEqual([pokemon]);
  });
});

describe('deleteTeam', () => {
  it('shall delete team and its unsaved members', async () => {
    const teamAreaId = await createTeamAreaSetup(user.id);
    const team = await TeamDAO.insert({
      name: 'old name',
      camp: false,
      fk_user_id: user.id,
      team_index: 0,
      bedtime: '21:30',
      wakeup: '06:00',
      recipe_type: 'curry',
      fk_team_area_id: teamAreaId
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
      subskill_70: undefined,
      subskill_80: undefined,
      ingredient_0: 'apple',
      ingredient_30: 'apple',
      ingredient_60: 'apple'
    });

    await TeamMemberDAO.insert({
      fk_pokemon_id: pkmn.id,
      fk_team_id: team.id,
      member_index: 0,
      sneaky_snacking: false
    });

    await deleteTeam(team.team_index, user);

    expect(await TeamDAO.findMultiple()).toHaveLength(0);
    expect(await TeamMemberDAO.findMultiple()).toHaveLength(0);
    expect(await PokemonDAO.findMultiple()).toHaveLength(0);
    expect(await UserDAO.findMultiple()).toHaveLength(1);
  });

  it('shall delete team without members', async () => {
    const teamAreaId = await createTeamAreaSetup(user.id);
    const team = await TeamDAO.insert({
      name: 'old name',
      camp: false,
      fk_user_id: user.id,
      team_index: 0,
      bedtime: '21:30',
      wakeup: '06:00',
      recipe_type: 'curry',
      fk_team_area_id: teamAreaId
    });

    await deleteTeam(team.team_index, user);

    expect(await TeamDAO.findMultiple()).toHaveLength(0);
    expect(await UserDAO.findMultiple()).toHaveLength(1);
  });

  it('shall not delete saved pokemon', async () => {
    const teamAreaId = await createTeamAreaSetup(user.id);
    const team = await TeamDAO.insert({
      name: 'old name',
      camp: false,
      fk_user_id: user.id,
      team_index: 0,
      bedtime: '21:30',
      wakeup: '06:00',
      recipe_type: 'curry',
      fk_team_area_id: teamAreaId
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
      subskill_70: undefined,
      subskill_80: undefined,
      ingredient_0: 'apple',
      ingredient_30: 'apple',
      ingredient_60: 'apple'
    });

    await TeamMemberDAO.insert({
      fk_pokemon_id: pkmn.id,
      fk_team_id: team.id,
      member_index: 0,
      sneaky_snacking: false
    });

    await deleteTeam(team.team_index, user);

    expect(await TeamDAO.findMultiple()).toHaveLength(0);
    expect(await TeamMemberDAO.findMultiple()).toHaveLength(0);
    expect(await PokemonDAO.findMultiple()).toHaveLength(1);
    expect(await UserDAO.findMultiple()).toHaveLength(1);
  });
});

describe('scheduled member persistence', () => {
  const externalId = 's'.repeat(36);
  const member: UpsertTeamMemberRequest = {
    version: 0,
    externalId,
    saved: false,
    shiny: false,
    gender: 'female',
    pokemon: 'bulbasaur',
    name: 'Rotation partner',
    level: 25,
    ribbon: 0,
    carrySize: 10,
    skillLevel: 2,
    nature: 'brave',
    subskills: [],
    sneakySnacking: false,
    ingredients: [
      { level: 0, name: 'apple', amount: 2 },
      { level: 30, name: 'apple', amount: 5 },
      { level: 60, name: 'apple', amount: 7 }
    ]
  };
  const request = () => ({
    name: 'Rotation team',
    camp: false,
    bedtime: '21:30',
    wakeup: '06:00',
    recipeType: 'curry' as const,
    island: mocks.islandDTO(),
    schedule: [{ slotIndex: 0, externalId, startTime: '12:00' }],
    scheduledMembers: [member]
  });

  it('loads an unsaved scheduled Pokemon and its edits without occupying a primary slot', async () => {
    await upsertTeamMeta({ index: 0, user, request: request() });
    let response = await getTeams(user);
    expect(response.teams[0].members).toEqual([]);
    expect(response.teams[0].scheduledMembers).toEqual([
      expect.objectContaining({ externalId, level: 25, saved: false })
    ]);
    await upsertTeamMeta({
      index: 0,
      user,
      request: { ...request(), scheduledMembers: [{ ...member, level: 42, saved: true }] }
    });
    response = await getTeams(user);
    expect(response.teams[0].scheduledMembers).toEqual([
      expect.objectContaining({ externalId, level: 42, saved: true })
    ]);
  });

  it('rolls back the schedule and members when a Pokemon cannot be saved', async () => {
    await upsertTeamMeta({ index: 0, user, request: request() });
    await expect(
      upsertTeamMeta({
        index: 0,
        user,
        request: { ...request(), name: 'Changed', scheduledMembers: [{ ...member, ingredients: [] }] }
      })
    ).rejects.toThrow(IngredientError);
    expect((await getTeams(user)).teams[0]).toMatchObject({
      name: 'Rotation team',
      scheduledMembers: [expect.objectContaining({ level: 25 })]
    });
  });

  it('keeps a scheduled Pokemon when another team using it is deleted', async () => {
    await upsertTeamMeta({ index: 0, user, request: request() });
    await upsertTeamMeta({ index: 1, user, request: request() });
    await upsertTeamMember({ teamIndex: 1, memberIndex: 0, user, request: member });
    await deleteTeam(1, user);
    expect((await getTeams(user)).teams[0].scheduledMembers).toHaveLength(1);
    await upsertTeamMeta({ index: 0, user, request: { ...request(), schedule: [], scheduledMembers: [] } });
    expect(await PokemonDAO.find({ external_id: externalId })).toBeUndefined();
  });
});
