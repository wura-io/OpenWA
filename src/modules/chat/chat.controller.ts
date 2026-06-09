import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SessionService } from '../session/session.service';
import { ChatType, EngineSyncingError } from '../../engine/interfaces/whatsapp-engine.interface';

const CHAT_TYPES: ChatType[] = ['individual', 'group', 'community', 'channel'];

@ApiTags('chats')
@Controller('sessions/:sessionId/chats')
export class ChatController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  @ApiOperation({
    summary: 'List all chats (conversations, groups, communities, channels) with their IDs',
  })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: CHAT_TYPES,
    description: 'Filter by chat type',
  })
  @ApiResponse({ status: 200, description: 'List of chats with id, name and type' })
  @ApiResponse({ status: 400, description: 'Session is not started' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 503, description: 'WhatsApp is still syncing; retry shortly' })
  async findAll(@Param('sessionId') sessionId: string, @Query('type') type?: string) {
    const engine = await this.getEngine(sessionId);
    let chats;
    try {
      chats = await engine.getChats();
    } catch (error) {
      if (error instanceof EngineSyncingError) {
        throw new ServiceUnavailableException(error.message);
      }
      throw error;
    }
    if (type && CHAT_TYPES.includes(type as ChatType)) {
      return chats.filter(chat => chat.type === type);
    }
    return chats;
  }

  private async getEngine(sessionId: string) {
    // Throws NotFoundException (404) when the session does not exist.
    await this.sessionService.findOne(sessionId);
    const engine = this.sessionService.getEngine(sessionId);
    if (!engine) {
      throw new BadRequestException('Session is not started');
    }
    return engine;
  }
}
