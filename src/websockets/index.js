/* eslint-disable no-console */
const WebSocket = require('ws');
const qs = require('qs');
const { ModuleProgress } = require('../models');

const websock = async (expressServer) => {
  const websocketServer = new WebSocket.Server({
    noServer: true,
    path: '/websockets',
  });

  expressServer.on('upgrade', (request, socket, head) => {
    websocketServer.handleUpgrade(request, socket, head, (websocket) => {
      websocketServer.emit('connection', websocket, request);
    });
  });

  websocketServer.on('connection', function connection(websocketConnection, connectionRequest) {
    // eslint-disable-next-line no-unused-vars
    const [_path, params] = connectionRequest.url.split('?');
    const connectionParams = qs.parse(params);

    // NOTE: connectParams are not used here but good to understand how to get
    // to them if you need to pass data with the connection to identify it (e.g., a userId).
    console.log(connectionParams);

    websocketConnection.on('message', async (message) => {
      const parsedMessage = JSON.parse(message);
      console.log(parsedMessage);
      const currentProgress = await ModuleProgress.findOne({ module_id: parsedMessage.module_id });
      if (currentProgress) {
        if (currentProgress.progress < parsedMessage.module_progress.video_played_time) {
          currentProgress.video_played_time = parsedMessage.module_progress.video_played_time;
          currentProgress.progress = (parsedMessage.module_progress.video_played_time / parsedMessage.video_duration) * 100;
          currentProgress
            .save()
            .then((updatedUser) => {
              console.log('User updated successfully:', updatedUser);
            })
            .catch((error) => {
              console.error('Error updating user:', error);
            });
        }
      } else {
        ModuleProgress.create({
          ...parsedMessage.module_progress,
          module_id: parsedMessage.module_id,
          progress: 0,
        });
      }
      websocketConnection.send(JSON.stringify({ message: 'There be gold in them thar hills.' }));
    });
  });

  return websocketServer;
};

module.exports = websock;
