// mongoose.config.ts

import { MongooseModuleOptions } from '@nestjs/mongoose';

const mongoConfig: MongooseModuleOptions = {
  uri: 'mongodb://mongodb-primary:27017,mongodb-secondary:27017,mongodb-arbiter:27017/file',
  dbName: 'file',
  user: 'root',
  pass: 'password123',
  replicaSet: 'yourReplicaSetName',
};

export default mongoConfig;
