# gNMI Client for JavaScript

A JavaScript gNMI client for interacting with network devices using gRPC.

## Installation

```sh
npm install gnmi-client
```

## Usage

```javascript
import GnmiClient from "gnmi-client";

const client = new GnmiClient("localhost:50051", "admin", "password");

// Get capabilities
client.getCapabilities().then(console.log).catch(console.error);

// Fetch data
client
  .get("/interfaces/interface[name=eth0]")
  .then(console.log)
  .catch(console.error);

// Set data
client
  .set("/interfaces/interface[name=eth0]/description", "New Description")
  .then(console.log)
  .catch(console.error);

// Subscribe to updates
const subscription = client.subscribe("/interfaces/interface[name=eth0]");
subscription.on("update", (data) => console.log("Update:", data));
subscription.on("error", (error) => console.error("Error:", error));
subscription.on("end", () => console.log("Subscription ended."));
```

## API

### `new GnmiClient(target, username, password)`

Creates a new gNMI client instance.

- `target`: The gNMI server address (e.g., `localhost:50051`)
- `username`: Authentication username
- `password`: Authentication password

### `client.getCapabilities()`

Retrieves the capabilities of the gNMI target. Returns a Promise resolving to the capabilities response.

### `client.get(path)`

Fetches data from the gNMI target.

- `path`: gNMI path (e.g., `/interfaces/interface[name=eth0]`) Returns a Promise resolving to the retrieved data.

### `client.set(updatePath, value)`

Updates a value on the gNMI target.

- `updatePath`: gNMI path to update
- `value`: New value to set Returns a Promise resolving to the set response.

### `client.subscribe(path)`

Subscribes to updates from the gNMI target.

- `path`: gNMI path to subscribe to Returns an `EventEmitter` that emits:
- `'update'`: New data received
- `'error'`: Subscription error
- `'end'`: Subscription ended

## License

MIT
