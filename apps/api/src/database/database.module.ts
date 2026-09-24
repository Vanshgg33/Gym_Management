import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

let uri: string;

async function getMongoUri(): Promise<string> {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  // Dev: spin up in-process replica set for transaction support
  const replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
  });
  uri = replSet.getUri();
  console.log(`[DB] In-memory MongoDB replica set started: ${uri}`);
  return uri;
}

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => getMongoUri().then((uri) => ({ uri })),
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
