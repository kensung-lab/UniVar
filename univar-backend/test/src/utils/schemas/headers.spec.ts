import { Headers } from 'src/utils';

describe('Headers', () => {
  describe('constructor', () => {
    it('should create an instance of Headers with all properties set', () => {
      const incomingHttpHeaders = {
        accept: 'application/json',
        'accept-language': 'en-US',
        'content-type': 'application/json',
      };
      const headers = new Headers(incomingHttpHeaders);

      expect(headers.accept).toEqual('application/json');
      expect(headers.accept_language).toEqual('en-US');
      expect(headers.content_type).toEqual('application/json');
    });
  });
});
