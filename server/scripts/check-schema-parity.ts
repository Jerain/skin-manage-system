/**
 * 校验基线迁移创建的表结构与实体定义是否一致
 *
 * 用法：npx ts-node scripts/check-schema-parity.ts
 *
 * 背景：基线迁移（CreateBaselineTables）是手写的，列的可空性/默认值容易与实体不一致，
 * 导致运行时报 "Field 'xxx' doesn't have a default value" 之类的错误。
 * 这个脚本把两边的差异列出来，方便校对。
 */
import { DataSource, TableColumn } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

/** 忽略这些列：数据库自管或实体里没有显式声明 */
const IGNORE_COLUMNS = new Set(['createdAt', 'updatedAt']);

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

  const problems: string[] = [];
  const runner = ds.createQueryRunner();
  await runner.connect();

  try {
    for (const entity of ds.entityMetadatas) {
      const tableName = entity.tableName;
      const table = await runner.getTable(tableName);

      if (!table) {
        problems.push(`表不存在: ${tableName}（实体 ${entity.name}）`);
        continue;
      }

      const dbCols = new Map<string, TableColumn>();
      for (const c of table.columns) dbCols.set(c.name, c);

      for (const col of entity.columns) {
        if (col.relationMetadata || col.isVirtual) continue;
        if (IGNORE_COLUMNS.has(col.databaseName)) continue;

        const dbCol = dbCols.get(col.databaseName);
        if (!dbCol) {
          problems.push(`${tableName}.${col.databaseName} 列缺失（实体 ${entity.name} 声明）`);
          continue;
        }

        const entityNullable = col.isNullable === true;
        const dbNullable = dbCol.isNullable === true;
        if (entityNullable !== dbNullable) {
          problems.push(
            `${tableName}.${col.databaseName} 可空性不一致：实体 ${entityNullable ? 'NULL' : 'NOT NULL'} / 库 ${dbNullable ? 'NULL' : 'NOT NULL'}`,
          );
        }
      }
    }
  } finally {
    await runner.release();
  }

  await ds.destroy();

  if (problems.length) {
    console.log('发现 ' + problems.length + ' 处实体/表结构不一致：');
    for (const p of problems) console.log('  - ' + p);
    process.exit(1);
  }
  console.log('实体与表结构一致 ✓');
}

main().catch((e) => {
  console.error('执行失败:', e.message);
  process.exit(2);
});
