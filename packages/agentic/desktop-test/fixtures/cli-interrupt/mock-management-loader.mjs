import { registerHooks } from 'node:module';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === './managedHost.js' && context.parentURL?.endsWith('/lib/hostedDriver.js')) {
      return { shortCircuit: true, url: new URL('./mock-management.mjs', import.meta.url).href };
    }
    return nextResolve(specifier, context);
  },
});
