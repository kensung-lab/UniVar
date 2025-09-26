import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { Bookmarks } from 'src/applicationInfo/schemas';
import { LoggingHelperService } from 'src/utils';
import { BookmarkService } from 'src/applicationInfo';
import {
  BaseRequest,
  BookmarkData,
  BookmarkRequest,
  BookmarkType,
  UserInfo,
} from 'src/common';
import { S_TEAM_USERINFO } from '../../../mock';
const testDate = new Date();
jest.mock('src/applicationInfo/schemas', () => ({
  BOOKMARK_MODEL_NAME: 'Bookmarks',
  Bookmarks: jest
    .fn()
    .mockImplementation(
      (
        bookmarkRequest: BookmarkRequest,
        userInfo: UserInfo,
        existingBookmarks: Bookmarks = null,
      ) => {
        const result: Bookmarks = {} as any;
        const tempData = existingBookmarks || bookmarkRequest;

        result.filters = tempData.filters;
        result.columns = tempData.columns;
        result.sort = tempData.sort;
        result.panels = tempData.panels;
        result.type = tempData.type;
        result.create_user = existingBookmarks
          ? existingBookmarks.create_user
          : userInfo.preferred_username;
        const tempAccessGroup = [];
        if (bookmarkRequest.is_share) {
          tempAccessGroup.push(result.create_user);
        } else {
          tempAccessGroup.push(result.create_user);
        }
        result.access_group = tempAccessGroup;
        result.is_default = false;
        result.name = tempData.name;
        result.creation_date = existingBookmarks
          ? existingBookmarks.creation_date
          : testDate;

        return result;
      },
    ),
}));

describe('BookmarkService', () => {
  let bookmarkService: BookmarkService;
  let bookmarkModel: Model<Bookmarks>;
  let loggingHelperService: LoggingHelperService;
  const curDate = new Date();

  const bookmarks = [
    {
      _id: '64d19994ed628e572c31b37a',
      name: 'ONE',
      filters: {
        highest_af: {
          $lte: 0.05,
        },
        gnomadv3_af: {
          $lte: 0.001,
        },
        quality: {
          $gte: 7005.3,
        },
        snv_type: 'indel',
      },
      panels: [],
      type: 'filter',
      create_user: 'kenip',
      access_group: ['kenip'],
      is_default: false,
      creation_date: curDate,
    },
    {
      _id: '64d19ae7ed628e572c31b4dd',
      name: 'TWO',
      filters: {
        quality: {
          $gte: 7005.3,
        },
        snv_type: 'indel',
        highest_af: {
          $lte: 0.05,
        },
        gnomadv3_af: {
          $lte: 0.001,
        },
      },
      columns: {
        all: {
          frozen: ['chrom', 'start', 'end', 'location'],
          display: [
            'samples_genotypes',
            'ref',
            'gene_symbol',
            'alt',
            'hgvsc',
            'hgvsp',
            'existing_variation',
            'mane_select',
            'cgd_agegroup',
            'cgd_inheritance',
            'cgd_manifestationcategories',
            'exomiser_ad_exgenescombi',
            'exomiser_ar_exgenescombi',
            'exomiser_xd_exgenescombi',
            'exomiser_xr_exgenescombi',
            'exomiser_mt_exgenescombi',
            'quality',
            'gnomad_af',
            'gnomad_eas_af',
            'gnomad_afr_af',
            'gnomad_amr_af',
            'gnomad_nfe_af',
            'gnomad_sas_af',
            'gnomadv3_af',
            'gnomadv3_af_eas',
            'gnomadv3_af_afr',
            'gnomadv3_af_amr',
            'gnomadv3_af_nfe',
            'gnomadv3_af_sas',
            'impact',
            'revel',
            'constraint_mis_z',
            'constraint_oe_lof_upper',
            'clnsig',
            'clnsigconf',
            'clnid',
          ],
        },
        small: {
          frozen: ['chrom', 'start', 'end'],
          display: [
            'ref',
            'alt',
            'samples_genotypes',
            'gene_symbol',
            'hgvsc',
            'hgvsp',
            'existing_variation',
            'mane_select',
            'cgd_agegroup',
            'cgd_inheritance',
            'cgd_manifestationcategories',
            'exomiser_ad_exgenescombi',
            'exomiser_ar_exgenescombi',
            'exomiser_xd_exgenescombi',
            'exomiser_xr_exgenescombi',
            'exomiser_mt_exgenescombi',
            'quality',
            'gnomad_af',
            'gnomad_eas_af',
            'gnomad_afr_af',
            'gnomad_amr_af',
            'gnomad_nfe_af',
            'gnomad_sas_af',
            'gnomadv3_af',
            'gnomadv3_af_eas',
            'gnomadv3_af_afr',
            'gnomadv3_af_amr',
            'gnomadv3_af_nfe',
            'gnomadv3_af_sas',
            'impact',
            'revel',
            'constraint_mis_z',
            'constraint_oe_lof_upper',
            'clnsig',
            'clnsigconf',
            'clnid',
          ],
        },
        structural: {
          frozen: ['chrom', 'start', 'end'],
          display: [
            'ref',
            'alt',
            'samples_genotypes',
            'gene_symbol',
            'len',
            'caller',
            'mane_select',
            'pathogenic',
          ],
        },
      },
      panels: [],
      type: 'bookmark',
      create_user: 'kenip',
      access_group: ['kenip'],
      is_default: false,
      creation_date: curDate,
    },
  ];

  const mockBookmarkModel: any = jest
    .fn()
    .mockImplementation((bookmark: Bookmarks): Bookmarks => {
      return bookmark;
    });
  mockBookmarkModel.findOne = jest.fn();
  mockBookmarkModel.find = jest.fn();
  mockBookmarkModel.save = jest.fn();
  mockBookmarkModel.startSession = jest.fn();

  const mockLoggingHelperService = {
    performanceLogAndFindOneMongo: jest.fn(),
    performanceLogAndSaveMongo: jest.fn(),
    performanceLogAndFindMongo: jest.fn(),
    performanceLogAndDeleteOneMongo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookmarkService,
        {
          provide: 'commonConnection/BookmarksModel',
          useValue: mockBookmarkModel,
        },
        {
          provide: LoggingHelperService,
          useValue: mockLoggingHelperService,
        },
      ],
    }).compile();

    bookmarkService = module.get<BookmarkService>(BookmarkService);
    bookmarkModel = module.get<Model<Bookmarks>>(
      'commonConnection/BookmarksModel',
    );
    loggingHelperService =
      module.get<LoggingHelperService>(LoggingHelperService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('saveBookmark', () => {
    it('should save a new bookmark', async () => {
      jest.dontMock('src/applicationInfo/schemas');
      const bookmarkRequest: BookmarkRequest = {
        filters: {
          scenario: 'dominant',
        },
        track_number: '1231421432432',
        type: BookmarkType.filter,
        is_share: true,
        name: 'testing',
      };
      const userInfo: UserInfo = S_TEAM_USERINFO;
      const savedBookmark = new Bookmarks(bookmarkRequest, userInfo);
      (<any>savedBookmark)._id = 'fadsfdsafa123';
      const mockedSession = {
        startTransaction: jest.fn(),
        endSession: jest.fn(),
        abortTransaction: jest.fn(),
        commitTransaction: jest.fn(),
      };
      const mockedPerformanceLogAndFindOneMongo = jest
        .fn()
        .mockResolvedValue(savedBookmark);
      const mockedPerformanceLogAndSaveMongo = jest
        .fn()
        .mockResolvedValue(savedBookmark);

      mockBookmarkModel.startSession.mockResolvedValue(mockedSession);
      loggingHelperService.performanceLogAndFindOneMongo =
        mockedPerformanceLogAndFindOneMongo;
      loggingHelperService.performanceLogAndSaveMongo =
        mockedPerformanceLogAndSaveMongo;

      const result = await bookmarkService.saveBookmark(
        bookmarkRequest,
        userInfo,
      );
      expect(result.filters).toEqual(savedBookmark.filters);
      expect(result.columns).toEqual(savedBookmark.columns);
      expect(result.name).toEqual(savedBookmark.name);
      expect(result.panels).toEqual(savedBookmark.panels);
      expect(result.type).toEqual(savedBookmark.type);
      expect(result.sort).toEqual(savedBookmark.sort);
      // expect(mockBookmarkModel.save).toHaveBeenCalledWith(savedBookmark);
      expect(
        loggingHelperService.performanceLogAndFindOneMongo,
      ).toHaveBeenCalledWith(
        bookmarkModel,
        {
          name: bookmarkRequest.name,
          create_user: userInfo.preferred_username,
          type: bookmarkRequest.type,
          is_default: false,
        },
        {},
        userInfo.preferred_username,
        '1231421432432',
        'check_bookmark_save',
        'common',
      );
      // expect(
      //   loggingHelperService.performanceLogAndSaveMongo,
      // ).toHaveBeenCalledWith(
      //   expect.objectContaining(savedBookmark),
      //   userInfo.preferred_username,
      //   '1231421432432',
      //   'insert_bookmark',
      //   'common',
      //   'Bookmarks',
      //   savedBookmark,
      //   null,
      // );
      expect(mockBookmarkModel.startSession).toHaveBeenCalled();
      expect(mockedSession.startTransaction).toHaveBeenCalled();
      expect(mockedSession.commitTransaction).toHaveBeenCalled();
      expect(mockedSession.abortTransaction).not.toHaveBeenCalled();
      expect(mockedSession.endSession).toHaveBeenCalled();
    });

    it('should create a new bookmark', async () => {
      jest.dontMock('src/applicationInfo/schemas');
      const bookmarkRequest: BookmarkRequest = {
        filters: {
          scenario: 'dominant',
        },
        track_number: '1231421432432',
        type: BookmarkType.bookmark,
        is_share: true,
        name: 'testing',
      };
      const userInfo: UserInfo = S_TEAM_USERINFO;
      const newBookmark = new Bookmarks(bookmarkRequest, userInfo);
      const expectedCallBookmark = new Bookmarks(bookmarkRequest, userInfo);
      (<any>newBookmark)._id = '1fdsafd123';

      const mockedSession = {
        startTransaction: jest.fn(),
        endSession: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
      };
      const mockedPerformanceLogAndFindOneMongo = jest
        .fn()
        .mockResolvedValue(undefined);
      const mockedPerformanceLogAndSaveMongo = jest
        .fn()
        .mockImplementation((document: any) => {
          document.type = BookmarkType.bookmark;
          document._id = '1fdsafd123';
          return document;
        });

      mockBookmarkModel.startSession.mockResolvedValue(mockedSession);
      loggingHelperService.performanceLogAndFindOneMongo =
        mockedPerformanceLogAndFindOneMongo;
      loggingHelperService.performanceLogAndSaveMongo =
        mockedPerformanceLogAndSaveMongo;

      const result = await bookmarkService.saveBookmark(
        bookmarkRequest,
        userInfo,
      );
      expect(result.columns).toEqual(expectedCallBookmark.columns);
      expect(result.filters).toEqual(expectedCallBookmark.filters);
      expect(result.name).toEqual(expectedCallBookmark.name);
      expect(result.panels).toEqual(expectedCallBookmark.panels);
      expect(result.sort).toEqual(expectedCallBookmark.sort);
      expect(result.type).toEqual(expectedCallBookmark.type);
      expect(
        loggingHelperService.performanceLogAndFindOneMongo,
      ).toHaveBeenCalledWith(
        bookmarkModel,
        {
          name: bookmarkRequest.name,
          create_user: userInfo.preferred_username,
          is_default: false,
          type: bookmarkRequest.type,
        },
        {},
        userInfo.preferred_username,
        '1231421432432',
        'check_bookmark_save',
        'common',
      );

      expect(
        loggingHelperService.performanceLogAndSaveMongo,
      ).toHaveBeenCalledWith(
        newBookmark,
        userInfo.preferred_username,
        '1231421432432',
        'insert_bookmark',
        'common',
        'Bookmarks',
        newBookmark,
        undefined,
      );
      expect(
        loggingHelperService.performanceLogAndSaveMongo,
      ).toHaveBeenCalledTimes(1);
      expect(mockBookmarkModel.startSession).toHaveBeenCalled();
      expect(mockedSession.startTransaction).toHaveBeenCalled();
      expect(mockedSession.commitTransaction).toHaveBeenCalled();
      expect(mockedSession.abortTransaction).not.toHaveBeenCalled();
      expect(mockedSession.endSession).toHaveBeenCalled();
    });

    it('should update an existing bookmark', async () => {
      const bookmarkRequest: BookmarkRequest = {
        filters: {
          scenario: 'dominant',
        },
        track_number: '1231421432432',
        type: BookmarkType.filter,
        is_share: true,
        name: 'testing',
      };
      const userInfo: UserInfo = S_TEAM_USERINFO;
      const existingBookmark = new Bookmarks(bookmarkRequest, userInfo);
      const updatedBookmark = new Bookmarks(
        { ...bookmarkRequest, type: BookmarkType.filter },
        userInfo,
      );
      const expectedCallBookmark = new Bookmarks(
        { ...bookmarkRequest, type: BookmarkType.filter },
        userInfo,
      );
      (<any>updatedBookmark)._id = '1fdsafd123';
      const mockedSession = {
        startTransaction: jest.fn(),
        endSession: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
      };
      const mockedPerformanceLogAndFindOneMongo = jest
        .fn()
        .mockResolvedValue(existingBookmark);
      const mockedPerformanceLogAndSaveMongo = jest
        .fn()
        .mockImplementation((document: any) => {
          document.type = updatedBookmark.type;
          document._id = '1fdsafd123';
          return document;
        });

      mockBookmarkModel.startSession.mockResolvedValue(mockedSession);
      loggingHelperService.performanceLogAndFindOneMongo =
        mockedPerformanceLogAndFindOneMongo;
      loggingHelperService.performanceLogAndSaveMongo =
        mockedPerformanceLogAndSaveMongo;
      (<any>bookmarkModel).mockReturnValue(updatedBookmark);

      const result = await bookmarkService.saveBookmark(
        bookmarkRequest,
        userInfo,
      );
      expect(result.columns).toEqual(updatedBookmark.columns);
      expect(result.filters).toEqual(updatedBookmark.filters);
      expect(result.name).toEqual(updatedBookmark.name);
      expect(result.panels).toEqual(updatedBookmark.panels);
      expect(result.sort).toEqual(updatedBookmark.sort);
      expect(result.type).toEqual(updatedBookmark.type);
      expect(
        loggingHelperService.performanceLogAndFindOneMongo,
      ).toHaveBeenCalledWith(
        bookmarkModel,
        {
          name: bookmarkRequest.name,
          create_user: userInfo.preferred_username,
          is_default: false,
          type: bookmarkRequest.type,
        },
        {},
        userInfo.preferred_username,
        '1231421432432',
        'check_bookmark_save',
        'common',
      );
      expect(
        loggingHelperService.performanceLogAndSaveMongo,
      ).toHaveBeenCalledWith(
        updatedBookmark,
        userInfo.preferred_username,
        '1231421432432',
        'update_bookmark',
        'common',
        'Bookmarks',
        expectedCallBookmark,
        existingBookmark,
      );
      expect(
        loggingHelperService.performanceLogAndSaveMongo,
      ).toHaveBeenCalledTimes(1);
      expect(mockBookmarkModel.startSession).toHaveBeenCalled();
      expect(mockedSession.startTransaction).toHaveBeenCalled();
      expect(mockedSession.commitTransaction).toHaveBeenCalled();
      expect(mockedSession.abortTransaction).not.toHaveBeenCalled();
      expect(mockedSession.endSession).toHaveBeenCalled();
    });

    it('should abort transaction on error', async () => {
      jest.dontMock('src/applicationInfo/schemas');
      const bookmarkRequest: BookmarkRequest = {
        filters: {
          scenario: 'dominant',
        },
        track_number: '1231421432432',
        type: BookmarkType.filter,
        is_share: true,
        name: 'testing',
      };
      const userInfo: UserInfo = S_TEAM_USERINFO;
      const mockedSession = {
        startTransaction: jest.fn(),
        endSession: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
      };
      const mockedTransaction = {
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
      };
      const mockedPerformanceLogAndFindOneMongo = jest
        .fn()
        .mockRejectedValue(new Error());
      const mockedPerformanceLogAndSaveMongo = jest
        .fn()
        .mockResolvedValue(null);

      mockBookmarkModel.startSession.mockResolvedValue(mockedSession);
      mockedSession.startTransaction.mockResolvedValue(mockedTransaction);
      loggingHelperService.performanceLogAndFindOneMongo =
        mockedPerformanceLogAndFindOneMongo;
      loggingHelperService.performanceLogAndSaveMongo =
        mockedPerformanceLogAndSaveMongo;

      await bookmarkService.saveBookmark(bookmarkRequest, userInfo);
      // expect(mockBookmarkModel.save).not.toHaveBeenCalled();
      expect(
        loggingHelperService.performanceLogAndFindOneMongo,
      ).toHaveBeenCalledWith(
        bookmarkModel,
        {
          name: bookmarkRequest.name,
          create_user: userInfo.preferred_username,
          is_default: false,
          type: bookmarkRequest.type,
        },
        {},
        userInfo.preferred_username,
        '1231421432432',
        'check_bookmark_save',
        'common',
      );
      expect(
        loggingHelperService.performanceLogAndSaveMongo,
      ).not.toHaveBeenCalled();
      expect(mockBookmarkModel.startSession).toHaveBeenCalled();
      expect(mockedSession.startTransaction).toHaveBeenCalled();
      expect(mockedSession.commitTransaction).not.toHaveBeenCalled();
      expect(mockedSession.abortTransaction).toHaveBeenCalled();
      expect(mockedSession.endSession).toHaveBeenCalled();
    });
  });

  describe('getBookmarkList', () => {
    it('should get a list of bookmarks', async () => {
      const baseRequest: BaseRequest = {
        track_number: '1231421432432',
      };
      const userInfo = { preferred_username: 'testUser' };
      const mockedPerformanceLogAndFindMongo = jest
        .fn()
        .mockResolvedValue(bookmarks);

      loggingHelperService.performanceLogAndFindMongo =
        mockedPerformanceLogAndFindMongo;

      const result = await bookmarkService.getBookmarkList(
        baseRequest,
        userInfo,
      );

      expect(result).toEqual(
        bookmarks.map((bookmark) => new BookmarkData(bookmark)),
      );
      expect(
        loggingHelperService.performanceLogAndFindMongo,
      ).toHaveBeenCalledWith(
        bookmarkModel,
        {
          $or: [
            {
              access_group: 'testUser',
            },
            {
              is_default: true,
            },
          ],
        },
        { creation_date: -1 },
        null,
        null,
        {},
        userInfo.preferred_username,
        '1231421432432',
        'find_bookmarks',
        'common',
      );
    });
  });

  describe('deleteBookmark', () => {
    it('should delete a bookmark', async () => {
      const deleteRequest = { id: '123', track_number: '1231421432432' };
      const userInfo = { preferred_username: 'testUser' };
      const expectedResult = new BookmarkData({
        _id: '123',
        name: 'Basic (SNV/INDEL + SV)',
        filters: {
          highest_af: {
            $lte: 0.005,
          },
          scenario: 'any',
          clingen_hi: ['sufficient'],
        },
        panels: [],
        type: 'filter',
        create_user: 'univar-test01',
        access_group: ['univar-test01'],
        is_default: true,
        creation_date: new Date(),
      } as any);
      const mockedPerformanceLogAndDeleteOneMongo = jest
        .fn()
        .mockResolvedValue(expectedResult);

      loggingHelperService.performanceLogAndDeleteOneMongo =
        mockedPerformanceLogAndDeleteOneMongo;

      const result = await bookmarkService.deleteBookmark(
        deleteRequest,
        userInfo,
      );

      expect(result).toEqual(expectedResult);
      expect(
        loggingHelperService.performanceLogAndDeleteOneMongo,
      ).toHaveBeenCalledWith(
        bookmarkModel,
        userInfo.preferred_username,
        '1231421432432',
        {
          _id: deleteRequest.id,
          create_user: userInfo.preferred_username,
          is_default: false,
        },
        'common',
        'Bookmarks',
        'delete_bookmark',
      );
    });
  });
});
