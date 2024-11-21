import { buildOpenIdClient } from '../functions';
import { OidcStrategy } from '../strategy';

export const OidcStrategyFactory = {
  provide: 'OidcStrategy',
  useFactory: async () => {
    const client = await buildOpenIdClient(); // secret sauce! build the dynamic client before injecting it into the strategy for use in the constructor super call.
    const strategy = new OidcStrategy(client);
    return strategy;
  },
};
