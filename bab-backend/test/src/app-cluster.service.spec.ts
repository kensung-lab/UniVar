import cluster, { ClusterSettings } from 'cluster';
import { AppClusterService } from 'src/app-cluster.service';

jest.mock('cluster');

describe('AppClusterService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('clusterize', () => {
    it('should start master server, fork worker processes, and handle worker exit', () => {
      const mockFork = jest.spyOn(cluster, 'fork');
      const mockOn = jest.spyOn(cluster, 'on');
      const consoleLog = jest.spyOn(global.console, 'log');

      AppClusterService.clusterize(() => {
        // This is the callback for the worker process
      });

      expect(cluster.isPrimary).toBe(true);
      expect(mockFork).toHaveBeenCalledTimes(1); // Assuming numCPUs is 1 in this example
      expect(mockOn).toHaveBeenCalledWith('exit', expect.any(Function));

      // Simulate worker exit
      const exitCallback = mockOn.mock.calls[0][1];
      const mockWorker = {
        uid: 1234,
        gid: 2345,
        process: {
          pid: 3456,
        },
      } as ClusterSettings;
      exitCallback(mockWorker);

      expect(consoleLog).toHaveBeenCalledWith(
        `Worker ${(<any>mockWorker).process.pid} died. Restarting`,
      );
      expect(mockFork).toHaveBeenCalledTimes(2); // One additional fork after worker exit
    });

    it('should start cluster server and execute the callback', () => {
      const mockCallback = jest.fn();

      (<any>cluster).isPrimary = false;

      AppClusterService.clusterize(mockCallback);

      expect(cluster.isPrimary).toBe(false);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });
});
