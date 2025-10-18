import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';

export const apiVersionStorage = createStorage<string>('api-version', 'qwen3-max', {
  storageEnum: StorageEnum.Local,
  liveUpdate: false,
});
