import { MockDAO } from '../dao/mock-dao';

const DataSeed = new (class {
  public async seed(): Promise<void> {
    await MockDAO.seed();
  }
})();

export default DataSeed;
