/**
 * 依据实体定义修正基线迁移里的列可空性
 *
 * 用法：npx ts-node scripts/sync-baseline-nullability.ts
 *
 * 背景：基线迁移是手写的，列的 isNullable 容易与实体不一致，
 * 运行时会报 "Field 'xxx' doesn't have a default value"。
 * 这里读取实体元数据，把基线迁移里对应列的可空性改成与实体一致。
 */
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const MIGRATION = path.join(
  __dirname,
  '..',
  'src',
  'database',
  'migrations',
  '1709875100000-CreateBaselineTables.ts',
);

async function main() {
  const ds = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'skin_care',
    entities: [path.join(__dirname, '..', 'src', 'database', 'entities', '*.entity{.ts,.js}')],
    synchronize: false,
    logging: false,
  });
  await ds.initialize();

  // 实体 -> { 列名: 是否可空 }
  const spec = new Map<string, Map<string, boolean>>();
  for (const meta of ds.entityMetadatas) {
    const cols = new Map<string, boolean>();
    for (const c of meta.columns) {
      if (c.relationMetadata || c.isVirtual) continue;
      cols.set(c.databaseName, c.isNullable === true);
    }
    spec.set(meta.tableName, cols);
  }
  await ds.destroy();

  let src = fs.readFileSync(MIGRATION, 'utf-8');
  let changed = 0;

  // 逐个表块处理
  for (const [table, cols] of spec) {
    const tableIdx = src.search(new RegExp(`name:\\s*["']${table}["']`));
    if (tableIdx < 0) {
      console.log(`跳过 ${table}：基线迁移里没有该表`);
      continue;
    }
    const colsStart = src.indexOf('columns: [', tableIdx);
    if (colsStart < 0) continue;
    const colsEnd = src.indexOf(']', colsStart);
    if (colsEnd < 0) continue;
    let block = src.slice(colsStart, colsEnd);

    for (const [colName, nullable] of cols) {
      const re = new RegExp(
        `(name:\\s*["']${colName}["'][^}]*?isNullable:\\s*)(true|false)`,
      );
      block = block.replace(re, (_m, p1) => {
        const want = nullable ? 'true' : 'false';
        if (p1 + want === p1 + want) changed++;
        return p1 + want;
      });
    }
    src = src.slice(0, colsStart) + block + src.slice(colsEnd);
  }

  fs.writeFileSync(MIGRATION, src, 'utf-8');
  console.log(`已同步 ${changed} 处列可空性 → ${path.basename(MIGRATION)}`);
}

main().catch((e) => {
  console.error('执行失败:', e.message);
  process.exit(1);
});
