class BunUtilsImpl {
  public garbageCollect() {
    Bun.gc(true);
    Bun.gc(false);
  }
}
export const BunUtils = new BunUtilsImpl();
