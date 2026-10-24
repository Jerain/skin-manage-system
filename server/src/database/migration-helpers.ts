import { QueryRunner, Table, TableForeignKey } from 'typeorm';

/**
 * 迁移辅助工具
 *
 * 生产库的表最初是通过 `synchronize: true` 由实体自动同步出来的，
 * 实体属性名直接映射为 camelCase 列名。
 * 因此迁移脚本必须：
 *   1. 列名与实体保持一致（camelCase）
 *   2. 幂等 —— 表已存在时跳过创建，避免生产部署报错
 */

/** 判断表是否已存在 */
export async function tableExists(
  queryRunner: QueryRunner,
  tableName: string,
): Promise<boolean> {
  const rows = await queryRunner.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = ?`,
    [tableName],
  );
  return Number(rows?.[0]?.cnt ?? 0) > 0;
}

/**
 * 幂等建表：表不存在才创建
 */
export async function createTableIfNotExists(
  queryRunner: QueryRunner,
  table: Table,
  foreignKeys: TableForeignKey[] = [],
): Promise<boolean> {
  if (await tableExists(queryRunner, table.name)) {
    // 表已存在：生产库由 synchronize 生成，可能缺少外键，记录下来稍后补建
    for (const fk of foreignKeys) {
      pendingForeignKeys.push({ tableName: table.name, fk });
    }
    await flushPendingForeignKeys(queryRunner);
    return false;
  }
  normalizeDefaults(table);
  await queryRunner.createTable(table, true);
  for (const fk of foreignKeys) {
    // 被引用的表还没建好时直接挂起，避免直接报错（TypeORM 会把失败的 SQL 打到 error 日志）
    if (await tableExists(queryRunner, fk.referencedTableName!)) {
      try {
        await queryRunner.createForeignKey(table.name, fk);
        continue;
      } catch {
        // 外键已存在或无法建立，忽略
        continue;
      }
    }
    pendingForeignKeys.push({ tableName: table.name, fk });
  }
  await flushPendingForeignKeys(queryRunner);
  return true;
}

/** 尚未成功建立的外键 */
const pendingForeignKeys: { tableName: string; fk: TableForeignKey }[] = [];

/**
 * 建立挂起的外键
 *
 * 迁移里表与表之间存在外键依赖，但建表顺序未必满足依赖关系
 * （例如 appointments 引用 services，而 services 在后面才建）。
 * 这里把建不出来的外键挂起，等被引用的表建好后再补建。
 */
async function flushPendingForeignKeys(queryRunner: QueryRunner): Promise<void> {
  for (let i = pendingForeignKeys.length - 1; i >= 0; i--) {
    const { tableName, fk } = pendingForeignKeys[i];
    if (!(await tableExists(queryRunner, tableName))) {
      pendingForeignKeys.splice(i, 1);
      continue;
    }
    if (!(await tableExists(queryRunner, fk.referencedTableName!))) {
      continue; // 被引用的表还没建好，继续等
    }
    try {
      await queryRunner.createForeignKey(tableName, fk);
    } catch {
      // 外键已存在或无法建立：不再重试，避免每次调用都重复报错
    }
    pendingForeignKeys.splice(i, 1);
  }
}

/**
 * 迁移收尾时调用：确保挂起的外键全部补建完成
 * （正常情况下 createTableIfNotExists 的自动 flush 已经处理完）
 */
export async function applyPendingForeignKeys(queryRunner: QueryRunner): Promise<void> {
  await flushPendingForeignKeys(queryRunner);
}

/**
 * 幂等加列：列不存在才添加
 * 用于已存在的生产表补列
 */
export async function addColumnIfNotExists(
  queryRunner: QueryRunner,
  tableName: string,
  column: TableColumnLike,
): Promise<void> {
  if (!(await tableExists(queryRunner, tableName))) return;
  const rows = await queryRunner.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
    [tableName, column.name],
  );
  if (Number(rows?.[0]?.cnt ?? 0) > 0) return;
  await queryRunner.addColumn(tableName, column as any);
}

/** 简化版列定义 */
export interface TableColumnLike {
  name: string;
  type: string;
  length?: number;
  isNullable?: boolean;
  default?: string;
  precision?: number;
  scale?: number;
}

/**
 * 归一化 default 值
 *
 * TypeORM 的 TableColumn.default 对字符串是「原样拼进 DDL」的，不做任何转义：
 *   default: 'admin'                ->  DEFAULT admin        (语法错误，admin 被当标识符)
 *   default: "'admin'"              ->  DEFAULT 'admin'      (正确)
 *   default: 0                      ->  DEFAULT 0            (正确)
 *   default: 'CURRENT_TIMESTAMP(6)' ->  DEFAULT CURRENT_TIMESTAMP(6) (TypeORM 特判函数式默认值)
 *
 * 迁移脚本里手写默认值时引号写法不一（'admin' / "'admin'" / "''admin''"），
 * 这里统一归一化：
 *   1. 逐层剥掉预加的引号
 *   2. 函数式默认值（CURRENT_TIMESTAMP 等）保持裸写
 *   3. 纯数字转成 number
 *   4. 其余按字符串字面量加一层引号
 */
function normalizeDefaults(table: Table): void {
  // 函数式默认值：CURRENT_TIMESTAMP / CURRENT_TIMESTAMP(6) / NOW() / CURRENT_DATE / CURRENT_TIME
  const fnRe = /^(CURRENT_TIMESTAMP|NOW|CURRENT_DATE|CURRENT_TIME)(\(\d+\))?$/i;
  for (const col of table.columns) {
    if (typeof col.default !== 'string') continue;

    // 逐层剥掉外层引号，最多 3 层，兼容 ''admin'' / 'admin'
    let v = col.default.trim();
    for (let i = 0; i < 3; i++) {
      const m = v.match(/^'(.*)'$/);
      if (!m) break;
      v = m[1];
    }

    if (fnRe.test(v)) {
      // 函数式默认值保持裸写，TypeORM 会输出 DEFAULT CURRENT_TIMESTAMP(6)
      col.default = v.toUpperCase();
    } else if (/^-?\d+(\.\d+)?$/.test(v)) {
      col.default = Number(v);
    } else {
      // 字符串字面量：补一层引号，内部单引号转义
      col.default = `'${v.replace(/'/g, "''")}'`;
    }
  }
}
