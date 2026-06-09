import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the per-webhook `chatFilter` allowlist column. When non-empty, a webhook
 * only receives message.* events whose `from` or `author` is in the list.
 * Nullable so existing webhooks keep receiving everything (backward compatible).
 */
export class AddWebhookChatFilter1780000000000 implements MigrationInterface {
  name = 'AddWebhookChatFilter1780000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const isPostgres = queryRunner.connection.options.type === 'postgres';
    if (isPostgres) {
      await queryRunner.query(`ALTER TABLE "webhooks" ADD "chatFilter" jsonb`);
    } else {
      await queryRunner.query(`ALTER TABLE "webhooks" ADD COLUMN "chatFilter" text`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "webhooks" DROP COLUMN "chatFilter"`);
  }
}
