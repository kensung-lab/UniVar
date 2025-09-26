import { BaseResponse, QueryRequest, Sample } from 'src/common';
import { SampleController, VariantService } from 'src/variantsInfo';

describe('SampleController', () => {
  let controller: SampleController;
  let variantService: VariantService;

  beforeEach(() => {
    variantService = (<any>{
      findSamples: jest.fn(),
    }) as VariantService;
    controller = new SampleController(variantService);
  });

  describe('findSamples', () => {
    it('should return a BaseResponse with the correct samples and track number', async () => {
      // Arrange
      const expectedTrackNumber = 'trackNumber';
      const queryRequest: QueryRequest = {
        track_number: expectedTrackNumber,
      } as QueryRequest;
      const userInfo = { username: 'user' };

      const expectedSamples: Sample[] = [<any>{ id: 1, name: 'Sample 1' }];

      jest
        .spyOn(variantService, 'findSamples')
        .mockResolvedValue(expectedSamples);

      // Act
      const result = await controller.findSamples(queryRequest, userInfo);

      // Assert
      expect(result).toBeInstanceOf(BaseResponse);
      expect(result.data).toBe(expectedSamples);
      expect(result.track_number).toBe(expectedTrackNumber);
      expect(variantService.findSamples).toHaveBeenCalledWith(
        queryRequest,
        userInfo,
      );
    });
  });
});
