import { BaseResponse, QueryRequest } from 'src/common';
import { GeneDBController, VariantService } from 'src/variantsInfo';

describe('GeneDBController', () => {
  let controller: GeneDBController;
  let variantService: VariantService;

  beforeEach(() => {
    variantService = (<any>{
      findGeneDBVersion: jest.fn(),
    }) as VariantService;
    controller = new GeneDBController(variantService);
  });

  describe('findVariants', () => {
    it('should return a BaseResponse with the correct version and track number', async () => {
      // Arrange
      const expectedTrackNumber = 'trackNumber';
      const queryRequest: QueryRequest = {
        track_number: expectedTrackNumber,
      } as QueryRequest;
      const userInfo = { username: 'user' };

      const expectedVersion = { version: '1.0' };

      jest
        .spyOn(variantService, 'findGeneDBVersion')
        .mockResolvedValue(expectedVersion);

      // Act
      const result = await controller.findVariants(queryRequest, userInfo);

      // Assert
      expect(result).toBeInstanceOf(BaseResponse);
      expect(result.data).toBe(expectedVersion);
      expect(result.track_number).toBe(expectedTrackNumber);
      expect(variantService.findGeneDBVersion).toHaveBeenCalledWith(
        queryRequest,
        userInfo,
      );
    });
  });
});
