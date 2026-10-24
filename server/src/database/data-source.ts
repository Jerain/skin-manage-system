import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

/**
 * 迁移文件自动发现
 *
 * 按文件名 `<timestamp>-<Name>.ts` 排序，扫描 migrations 目录。
 * 不用 glob 是为了避开 .d.ts 声明文件（编译后 dist/migrations 下同时存在 .js/.d.ts/.js.map）。
 * 显式清单每次新增迁移都要改代码，容易漏；改成自动发现，避免新迁移不生效。
 */
function resolveMigrations(): string[] {
  const dir = path.join(__dirname, 'migrations');
  if (!require('fs').existsSync(dir)) return [];

  const names = require('fs')
    .readdirSync(dir)
    // 只认 <数字时间戳>-<名字>.ts / .js，排除 .d.ts / .map
    .filter((f: string) => /^\d+-[A-Za-z0-9_-]+\.(ts|js)$/.test(f))
    .map((f: string) => f.replace(/\.(ts|js)$/, ''))
    .filter((f: string, i: number, arr: string[]) => arr.indexOf(f) === i)
    .sort();

  const out: string[] = [];
  for (const name of names) {
    for (const ext of ['.ts', '.js']) {
      const p = path.join(dir, name + ext);
      // .js 优先，命中即停；.ts 只在 .js 不存在时使用
      if (ext === '.ts' && require('fs').existsSync(path.join(dir, name + '.js'))) {
        continue;
      }
      if (require('fs').existsSync(p)) out.push(p);
    }
  }
  return out;
}

/**
 * TypeORM DataSource（供迁移命令使用）
 * 用法：npx typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts
 */
export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'skin_care',
  entities: [__dirname + '/entities/*.entity{.ts,.js}'],
  migrations: resolveMigrations(),
  synchronize: false,
  logging: false,
});
