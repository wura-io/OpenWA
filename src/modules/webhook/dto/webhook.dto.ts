import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUrl, IsArray, IsOptional, IsBoolean, IsInt, Min, Max, ArrayMinSize } from 'class-validator';

export const WEBHOOK_EVENTS = [
  'message.received',
  'message.sent',
  'message.ack',
  'message.revoked',
  'session.status',
  'session.qr',
  'session.authenticated',
  'session.disconnected',
  'group.join',
  'group.leave',
  'group.update',
] as const;

export type WebhookEventType = (typeof WEBHOOK_EVENTS)[number];

export class CreateWebhookDto {
  @ApiProperty({
    description: 'Webhook URL to receive events',
    example: 'https://your-server.com/webhook',
  })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({
    description: 'Event types to subscribe to',
    example: ['message.received', 'session.status'],
    enum: WEBHOOK_EVENTS,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  events?: string[];

  @ApiPropertyOptional({
    description: 'Secret key for HMAC signature verification',
    example: 'your-secret-key',
  })
  @IsOptional()
  @IsString()
  secret?: string;

  @ApiPropertyOptional({
    description: 'Custom headers to include in webhook requests',
    example: { 'X-Custom-Header': 'value' },
  })
  @IsOptional()
  headers?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Number of retry attempts on failure',
    example: 3,
    minimum: 0,
    maximum: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  retryCount?: number;

  @ApiPropertyOptional({
    description:
      'Allowlist of chat/contact ids. When set, message.* events are only delivered ' +
      'if the message from or author matches. Empty/omitted = receive from all chats. ' +
      'Use @c.us ids for users and @g.us ids for groups.',
    example: ['628111@c.us', '120363222@g.us'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  chatFilter?: string[];
}

export class UpdateWebhookDto {
  @ApiPropertyOptional({ description: 'Webhook URL' })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional({ description: 'Event types to subscribe to' })
  @IsOptional()
  @IsArray()
  events?: string[];

  @ApiPropertyOptional({ description: 'Secret key for HMAC signature' })
  @IsOptional()
  @IsString()
  secret?: string;

  @ApiPropertyOptional({ description: 'Custom headers' })
  @IsOptional()
  headers?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Enable/disable webhook' })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ description: 'Retry count' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  retryCount?: number;

  @ApiPropertyOptional({
    description: 'Allowlist of chat/contact ids for message.* events. Pass [] or null to clear.',
    example: ['628111@c.us', '120363222@g.us'],
    type: [String],
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  chatFilter?: string[] | null;
}

export class WebhookResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  events: string[];

  @ApiPropertyOptional({ type: [String], nullable: true })
  chatFilter?: string[] | null;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  retryCount: number;

  @ApiPropertyOptional()
  lastTriggeredAt?: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
