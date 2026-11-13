import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { DesktopDriverClient } from '@fluentui-react-native/desktop-driver/client';
import { FakeDesktopHost } from '@fluentui-react-native/desktop-driver/testing';
import { startDesktopService } from '../../lib/driverService.js';

const root = process.env.FURN_INTERRUPT_ROOT;
const scenario = process.env.FURN_INTERRUPT_SCENARIO;
const events = [];
const record = (event) => {
  events.push(event);
  fs.writeFileSync(path.join(root, 'disposal.json'), JSON.stringify(events));
};

export default {
  schemaVersion: 1,
  projectRoot: root,
  targets: {
    win32: { host: { kind: 'installed', ownership: 'external', application: { executablePath: 'not-launched.exe' } } },
  },
  reporting: { artifactsRoot: path.join(root, 'reports') },
  integration: {
    name: 'interrupt-fixture',
    supportsAgent: true,
    validate() {
      if (!['stop', 'repeat', 'child-first', 'failed-cleanup', 'borrowed-close'].includes(scenario))
        throw new Error('Unknown interrupt fixture scenario.');
    },
    async run({ supervisor, target, agent, onReady }) {
      const host = new FakeDesktopHost({ endpoint: 'win32' });
      const closeApplication = host.closeApplication.bind(host);
      host.closeApplication = async (...args) => {
        record('drain-start');
        if (scenario === 'repeat' && !process.emit('SIGINT', 'SIGINT')) throw new Error('SIGINT handlers were removed before drain.');
        await delay(25);
        if (scenario === 'failed-cleanup') throw new Error('Injected session drain failure.');
        await closeApplication(...args);
        record('drain-settled');
      };
      const dispose = host.dispose.bind(host);
      host.dispose = async (...args) => {
        await dispose(...args);
        record('host-disposed');
      };
      const publications = new Map();
      const records = new Map();
      let service;
      const resources = [
        {
          id: 'protected-driver',
          ownership: 'owned',
          prepare: ({ signal }) => ({
            identity: 'interrupt-fixture-driver',
            async acquire() {
              service = await startDesktopService(host, {
                target: { endpoint: 'win32', id: target.id, platformName: 'windows', launchModes: ['attach'] },
                agent: {
                  ...agent,
                  async publish(connection) {
                    publications.set(connection.descriptor, connection);
                    const filename = path.join(root, connection.descriptor);
                    fs.writeFileSync(filename, 'published');
                    return async () => {
                      fs.unlinkSync(filename);
                      record(`withdrawn:${connection.descriptor}`);
                    };
                  },
                },
                recovery: {
                  storage: {
                    read: async (name) => records.get(name),
                    publish: async (name, contents) => {
                      if (records.has(name)) throw new Error('Duplicate recovery record.');
                      records.set(name, contents);
                    },
                    remove: async (name, contents) => records.get(name) === contents && records.delete(name),
                  },
                },
                signal,
                guard: (work) => supervisor.services.guard(work),
                addSecret: (secret) => supervisor.reporter.addSecret(secret),
              });
              const connection = publications.get(agent.descriptor);
              const client = new DesktopDriverClient({ url: service.url, grant: connection.grant });
              await client.newSession({ alwaysMatch: { 'furn:target': target.id, 'furn:launchMode': 'attach' } });
            },
            dispose: () => service.close(),
          }),
        },
      ];
      if (scenario === 'borrowed-close') {
        const plan = resources[0].prepare({ signal: supervisor.services.controller.signal });
        await plan.acquire();
        let complete;
        const completed = new Promise((resolve) => (complete = resolve));
        const start = supervisor.runner.start;
        // Historical Storybook services were commands: they settled before the scope waited on its integration.
        supervisor.runner.start = () => ({
          completed,
          waitForReadiness: async (expected) => ({ ...expected, incarnation: 'interrupt-fixture-service', processId: process.pid }),
          async stop() {
            await plan.dispose();
            complete(0);
          },
        });
        try {
          supervisor.services.start('protected-driver', { command: process.execPath, args: [], cwd: root, env: {} });
        } finally {
          supervisor.runner.start = start;
        }
        await supervisor.services.readyProcess('protected-driver', {
          tier: 'service-ready',
          service: 'protected-driver',
          descriptor: agent.descriptor,
        });
      } else {
        await supervisor.services.contribute(resources, { targetId: target.id, targetInstanceId: target.instanceId });
      }
      process.stdout.write(`${JSON.stringify({ type: 'ready', runId: supervisor.reporter.runId })}\n`);
      onReady();
      setImmediate(() => {
        if (scenario === 'child-first') supervisor.services.fail(new Error('Injected required child exit before SIGINT.'));
        process.emit('SIGINT', 'SIGINT');
      });
      try {
        await supervisor.services.guard(supervisor.services.waitForStop());
      } finally {
        if (scenario === 'borrowed-close') {
          record('borrowed-close-start');
          await supervisor.services.close();
          record('borrowed-close-settled');
        }
      }
    },
  },
};
