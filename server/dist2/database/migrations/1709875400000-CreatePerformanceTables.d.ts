import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreatePerformanceTables1709875400000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
