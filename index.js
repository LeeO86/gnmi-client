import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { EventEmitter } from 'events';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_PATH = path.join(__dirname, 'gnmi.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const gnmiProto = grpc.loadPackageDefinition(packageDefinition).gnmi;

/**
 * gNMI Client for interacting with network devices.
 * 
 * @example
 * const client = new GnmiClient('localhost:50051', 'admin', 'password');
 * client.get('/interfaces/interface[name=eth0]').then(console.log).catch(console.error);
 */
class GnmiClient {
  constructor(target, username, password) {
    this.target = target;
    this.username = username;
    this.password = password;
    this.client = new gnmiProto.gNMI(target, grpc.credentials.createInsecure());
  }

  createMetadata() {
    const metadata = new grpc.Metadata();
    metadata.add('username', this.username);
    metadata.add('password', this.password);
    return metadata;
  }

  /**
   * Retrieves the capabilities of the gNMI target.
   * @returns {Promise<object>} Resolves with capabilities response.
   */
  getCapabilities() {
    return new Promise((resolve, reject) => {
      this.client.Capabilities({}, this.createMetadata(), (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Retrieves data from the gNMI target.
   * @param {string} path - The gNMI path to fetch.
   * @returns {Promise<object>} Resolves with the retrieved data.
   */
  get(path) {
    return new Promise((resolve, reject) => {
      const request = {
        path: [{ elem: path.split('/') }],
      };
      this.client.Get(request, this.createMetadata(), (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Updates a value on the gNMI target.
   * @param {string} updatePath - The gNMI path to update.
   * @param {string} value - The new value to set.
   * @returns {Promise<object>} Resolves with the set response.
   */
  set(updatePath, value) {
    return new Promise((resolve, reject) => {
      const request = {
        update: [{ path: { elem: updatePath.split('/') }, val: { stringVal: value } }],
      };
      this.client.Set(request, this.createMetadata(), (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Subscribes to updates from the gNMI target.
   * @param {string} path - The gNMI path to subscribe to.
   * @returns {EventEmitter} EventEmitter that emits 'update', 'error', and 'end' events.
   */
  subscribe(path) {
    const eventEmitter = new EventEmitter();
    const call = this.client.Subscribe(this.createMetadata());
    
    call.on('data', (response) => {
      eventEmitter.emit('update', response);
    });
    call.on('error', (error) => {
      eventEmitter.emit('error', error);
    });
    call.on('end', () => {
      eventEmitter.emit('end');
    });

    call.write({ subscribe: { prefix: {}, subscription: [{ path: { elem: path.split('/') } }] } });
    return eventEmitter;
  }
}

export default GnmiClient;
