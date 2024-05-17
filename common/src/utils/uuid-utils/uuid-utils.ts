import { v4 } from 'uuid';

class UUIDImpl {
  v4(): string {
    return v4();
  }
}

export const uuid = new UUIDImpl();
