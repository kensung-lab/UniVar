import { Injectable } from '@nestjs/common';
import {
  BaseRequest,
  BookmarkData,
  BookmarkRequest,
  COMMON_DATABASE,
  DeleteRequest,
} from 'src/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoggingHelperService } from 'src/utils';
import { BOOKMARK_MODEL_NAME, Bookmarks } from 'src/applicationInfo/schemas';

@Injectable()
export class BookmarkService {
  constructor(
    @InjectModel(BOOKMARK_MODEL_NAME, COMMON_DATABASE)
    private Bookmark: Model<Bookmarks>,
    private readonly loggingHelperService: LoggingHelperService,
  ) {}

  async saveBookmark(
    bookmarkRequest: BookmarkRequest,
    userInfo,
  ): Promise<BookmarkData> {
    let doc = null;
    const session = await this.Bookmark.startSession();
    try {
      session.startTransaction();
      const bookmarkResult =
        await this.loggingHelperService.performanceLogAndFindOneMongo(
          this.Bookmark,
          {
            name: bookmarkRequest.name,
            create_user: userInfo.preferred_username,
            type: bookmarkRequest.type,
            is_default: false,
          },
          {},
          userInfo.preferred_username,
          bookmarkRequest.track_number,
          'check_bookmark_save',
          COMMON_DATABASE,
        );
      const bookmark = new Bookmarks(bookmarkRequest, userInfo, bookmarkResult);
      doc = new this.Bookmark(bookmark);
      doc = await this.loggingHelperService.performanceLogAndSaveMongo(
        doc,
        userInfo.preferred_username,
        bookmarkRequest.track_number,
        bookmarkResult ? 'update_bookmark' : 'insert_bookmark',
        COMMON_DATABASE,
        BOOKMARK_MODEL_NAME,
        bookmark,
        bookmarkResult,
      );
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
    }
    session.endSession();

    return doc ? new BookmarkData(doc) : null;
  }

  async getBookmarkList(
    baseRequest: BaseRequest,
    userInfo,
  ): Promise<BookmarkData[]> {
    const result = await this.loggingHelperService.performanceLogAndFindMongo(
      this.Bookmark,
      {
        $or: [
          { access_group: userInfo.preferred_username },
          { is_default: true },
        ],
      },
      { creation_date: -1 },
      null,
      null,
      {},
      userInfo.preferred_username,
      baseRequest.track_number,
      'find_bookmarks',
      COMMON_DATABASE,
    );

    return result.map((bookmark) => new BookmarkData(bookmark));
  }

  async deleteBookmark(
    deleteRequest: DeleteRequest,
    userInfo,
  ): Promise<BookmarkData> {
    const bookmarkResult =
      await this.loggingHelperService.performanceLogAndDeleteOneMongo(
        this.Bookmark,
        userInfo.preferred_username,
        deleteRequest.track_number,
        {
          _id: deleteRequest.id,
          is_default: false,
          create_user: userInfo.preferred_username,
        },
        COMMON_DATABASE,
        BOOKMARK_MODEL_NAME,
        'delete_bookmark',
      );

    return new BookmarkData(bookmarkResult);
  }
}
