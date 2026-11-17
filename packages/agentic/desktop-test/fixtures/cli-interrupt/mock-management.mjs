// The protected fixture driver uses in-memory publication, not a native-verifiable descriptor.
export function createManagedDesktopHostResource(options) {
  let published = false;
  return {
    get descriptor() {
      return published ? (options.descriptor ?? 'supervisor-connection.json') : undefined;
    },
    resource: {
      id: 'workload-management',
      ownership: 'owned',
      prepare: () => ({
        identity: 'fixture-management',
        async acquire() {
          published = true;
        },
        async dispose() {
          published = false;
        },
      }),
    },
  };
}
