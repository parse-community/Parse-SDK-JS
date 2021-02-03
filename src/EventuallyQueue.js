/**
 * https://github.com/francimedia/parse-js-local-storage
 *
 * @flow
 */

import CoreManager from './CoreManager';
import ParseObject from './ParseObject';
import ParseQuery from './ParseQuery';
import Storage from './Storage';

const EventuallyQueue = {
  localStorageKey: 'Parse.Eventually.Queue',
  polling: undefined,

  save(object) {
    return this.enqueue('save', object);
  },

  destroy(object) {
    return this.enqueue('delete', object);
  },

  async enqueue(action, object) {
    const queueData = await this.getQueue();
    object._getId();
    const { className, id, _localId } = object;
    const hash = object.get('hash') || _localId;
    const queueId = [action, className, id, hash].join('_');

    let index = this.queueItemExists(queueData, queueId);
    if (index > -1) {
      // Add cached values to new object if they don't exist
      for (const prop in queueData[index].object.attributes) {
        if (typeof object.get(prop) === 'undefined') {
          object.set(prop, queueData[index].object.attributes[prop]);
        }
      }
    } else {
      index = queueData.length;
    }
    queueData[index] = {
      id,
      queueId,
      className,
      action,
      object,
      hash: object.get('hash'),
      createdAt: new Date(),
    };
    return this.setQueue(queueData);
  },

  async getQueue() {
    const q = await Storage.getItemAsync(this.localStorageKey);
    if (!q) {
      return [];
    }
    return JSON.parse(q);
  },

  setQueue(queueData) {
    return Storage.setItemAsync(this.localStorageKey, JSON.stringify(queueData));
  },

  async remove(queueId) {
    const queueData = await this.getQueue();
    const index = this.queueItemExists(queueData, queueId);
    if (index > -1) {
      queueData.splice(index, 1);
      await this.setQueue(queueData);
    }
  },

  clear() {
    return Storage.setItemAsync(this.localStorageKey, JSON.stringify([]));
  },

  queueItemExists(queueData, queueId) {
    return queueData.findIndex(data => data.queueId === queueId);
  },

  async length() {
    const queueData = await this.getQueue();
    return queueData.length;
  },

  async sendQueue(sessionToken) {
    const queueData = await this.getQueue();
    if (queueData.length === 0) {
      return false;
    }
    for (let i = 0; i < queueData.length; i += 1) {
      const ObjectType = ParseObject.extend(queueData[i].className);
      if (queueData[i].id) {
        await this.reprocess.byId(ObjectType, queueData[i], sessionToken);
      } else if (queueData[i].hash) {
        await this.reprocess.byHash(ObjectType, queueData[i], sessionToken);
      } else {
        await this.reprocess.create(ObjectType, queueData[i], sessionToken);
      }
    }
    return true;
  },

  async sendQueueCallback(object, queueObject, sessionToken) {
    if (!object) {
      return this.remove(queueObject.queueId);
    }
    switch (queueObject.action) {
    case 'save':
      // Queued update was overwritten by other request. Do not save
      if (
        typeof object.updatedAt !== 'undefined' &&
          object.updatedAt > new Date(queueObject.object.createdAt)
      ) {
        return this.remove(queueObject.queueId);
      }
      try {
        await object.save(queueObject.object, { sessionToken });
        await this.remove(queueObject.queueId);
      } catch (e) {
        // Do Nothing
      }
      break;
    case 'delete':
      try {
        await object.destroy({ sessionToken });
      } catch (e) {
        // Do Nothing
      }
      await this.remove(queueObject.queueId);
      break;
    }
  },

  poll(sessionToken) {
    if (this.polling) {
      return;
    }
    this.polling = setInterval(() => {
      let url = CoreManager.get('SERVER_URL');
      url += url[url.length - 1] !== '/' ? '/health' : 'health';

      const RESTController = CoreManager.getRESTController();
      RESTController.ajax('GET', url)
        .then(async () => {
          clearInterval(this.polling);
          delete this.polling;
          await this.sendQueue(sessionToken);
        })
        .catch(() => {
          // Can't connect to server, continue
        });
    }, 2000);
  },

  reprocess: {
    create(ObjectType, queueObject, sessionToken) {
      const newObject = new ObjectType();
      return EventuallyQueue.sendQueueCallback(newObject, queueObject, sessionToken);
    },
    async byId(ObjectType, queueObject, sessionToken) {
      const query = new ParseQuery(ObjectType);
      query.equalTo('objectId', queueObject.id);
      const results = await query.find({ sessionToken });
      return EventuallyQueue.sendQueueCallback(results[0], queueObject, sessionToken);
    },
    async byHash(ObjectType, queueObject, sessionToken) {
      const query = new ParseQuery(ObjectType);
      query.equalTo('hash', queueObject.hash);
      const results = await query.find({ sessionToken });
      if (results.length > 0) {
        return EventuallyQueue.sendQueueCallback(results[0], queueObject, sessionToken);
      }
      return EventuallyQueue.reprocess.create(ObjectType, queueObject, sessionToken);
    },
  },
};

module.exports = EventuallyQueue;
