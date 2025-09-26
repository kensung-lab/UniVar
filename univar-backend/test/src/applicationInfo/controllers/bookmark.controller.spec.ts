import { Test, TestingModule } from '@nestjs/testing';
import { BookmarkController, BookmarkService } from 'src/applicationInfo';
import { BookmarkRequest, BookmarkType } from 'src/common';

describe('BookmarkController', () => {
  let controller: BookmarkController;
  let bookmarkService: BookmarkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookmarkController],
      providers: [
        {
          provide: BookmarkService,
          useValue: {
            saveBookmark: jest.fn(),
            getBookmarkList: jest.fn(),
            deleteBookmark: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BookmarkController>(BookmarkController);
    bookmarkService = module.get<BookmarkService>(BookmarkService);
  });

  describe('saveBookmark', () => {
    it('should save bookmark', async () => {
      const bookmarkRequest: BookmarkRequest = {
        filters: {
          scenario: 'dominant',
        },
        track_number: '1231421432432',
        type: BookmarkType.filter,
        is_share: true,
        name: 'testing',
      };
      const userInfo = {};
      await controller.saveBookmark(bookmarkRequest, userInfo);

      expect(bookmarkService.saveBookmark).toHaveBeenCalledWith(
        bookmarkRequest,
        userInfo,
      );
    });
  });

  describe('getBookmarkList', () => {
    it('should get bookmark list', async () => {
      const baseRequest = {
        track_number: '1231421432432',
      };
      const userInfo = {};

      await controller.getBookmarkList(baseRequest, userInfo);

      expect(bookmarkService.getBookmarkList).toHaveBeenCalledWith(
        baseRequest,
        userInfo,
      );
    });
  });

  describe('deleteBookmarkList', () => {
    it('should delete bookmark list', async () => {
      const deleteRequest = {
        id: 'mockId',
        track_number: '1231421432432',
      };
      const userInfo = {};

      await controller.deleteBookmarkList(deleteRequest, userInfo);

      expect(bookmarkService.deleteBookmark).toHaveBeenCalledWith(
        deleteRequest,
        userInfo,
      );
    });
  });
});
