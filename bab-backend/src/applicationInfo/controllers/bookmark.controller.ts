import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { BookmarkService } from '../services';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  BaseRequest,
  BaseResponse,
  BookmarkData,
  BookmarkRequest,
  DeleteRequest,
} from 'src/common';
import { AuthenticatedUser } from 'src/auth';

@ApiTags('bookmark')
@Controller('bookmark')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @ApiResponse({
    status: 201,
    description: 'Save Bookmark for user',
    type: BaseResponse<BookmarkData>,
  })
  @HttpCode(201)
  @Post('/save')
  async saveBookmark(
    @Body() bookmarkRequest: BookmarkRequest,
    @AuthenticatedUser() userInfo,
  ): Promise<BaseResponse<BookmarkData>> {
    const result = await this.bookmarkService.saveBookmark(
      bookmarkRequest,
      userInfo,
    );
    return new BaseResponse(result, bookmarkRequest.track_number);
  }

  @ApiResponse({
    status: 200,
    description: 'Retrieved bookmark list by user success',
    type: BaseResponse<BookmarkData[]>,
  })
  @HttpCode(200)
  @Post('/list')
  async getBookmarkList(
    @Body() baseRequest: BaseRequest,
    @AuthenticatedUser() userInfo,
  ): Promise<BaseResponse<BookmarkData[]>> {
    const result = await this.bookmarkService.getBookmarkList(
      baseRequest,
      userInfo,
    );
    return new BaseResponse(result, baseRequest.track_number);
  }

  @ApiResponse({
    status: 200,
    description: 'Delete bookmark by user',
    type: BaseResponse<BookmarkData>,
  })
  @HttpCode(200)
  @Post('/delete')
  async deleteBookmarkList(
    @Body() deleteRequest: DeleteRequest,
    @AuthenticatedUser() userInfo,
  ): Promise<BaseResponse<BookmarkData>> {
    const result = await this.bookmarkService.deleteBookmark(
      deleteRequest,
      userInfo,
    );
    return new BaseResponse(result, deleteRequest.track_number);
  }
}
