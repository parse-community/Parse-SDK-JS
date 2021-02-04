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

  save(object, serverOptions = {}) {
    return this.enqueue('save', object, serverOptions);
  },

  destroy(object, serverOptions = {}) {
    return this.enqueue('destroy', object, serverOptions);
  },
  generateQueueId(action, object) {
    object._getId();
    const { className, id, _localId } = object;
    const uniqueId = object.get('hash') || _localId;
    return [action, className, id, uniqueId].join('_');
  },
  async enqueue(action, object, serverOptions) {
    const queueData = await this.getQueue();
    const queueId = this.generateQueueId(action, object);

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
      queueId,
      action,
      object,
      serverOptions,
      id: object.id,
      className: object.className,
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

  async sendQueue() {
    const queueData = await this.getQueue();
    if (queueData.length === 0) {
      return false;
    }
    for (let i = 0; i < queueData.length; i += 1) {
      const ObjectType = ParseObject.extend(queueData[i].className);
      if (queueData[i].id) {
        await this.reprocess.byId(ObjectType, queueData[i]);
      } else if (queueData[i].hash) {
        await this.reprocess.byHash(ObjectType, queueData[i]);
      } else {
        await this.reprocess.create(ObjectType, queueData[i]);
      }
    }
    return true;
  },

  async sendQueueCallback(object, queueObject) {
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
        await object.save(queueObject.object, queueObject.serverOptions);
        await this.remove(queueObject.queueId);
      } catch (e) {
        if (e.message !== 'XMLHttpRequest failed: "Unable to connect to the Parse API"') {
          await this.remove(queueObject.queueId);
        }
      }
      break;
    case 'destroy':
      try {
        await object.destroy(queueObject.serverOptions);
        await this.remove(queueObject.queueId);
      } catch (e) {
        if (e.message !== 'XMLHttpRequest failed: "Unable to connect to the Parse API"') {
          await this.remove(queueObject.queueId);
        }
      }
      break;
    }
  },

  poll() {
    if (this.polling) {
      return;
    }
    this.polling = setInterval(() => {
      const RESTController = CoreManager.getRESTController();
      RESTController.ajax('GET', CoreManager.get('SERVER_URL')).catch(error => {
        if (error !== 'Unable to connect to the Parse API') {
          clearInterval(this.polling);
          this.polling = undefined;
          return this.sendQueue();
        }
      });
    }, 2000);
  },
  stopPoll() {
    clearInterval(this.polling);
    this.polling = undefined;
  },
  reprocess: {
    create(ObjectType, queueObject) {
      const newObject = new ObjectType();
      return EventuallyQueue.sendQueueCallback(newObject, queueObject);
    },
    async byId(ObjectType, queueObject) {
      const { sessionToken } = queueObject.serverOptions;
      const query = new ParseQuery(ObjectType);
      query.equalTo('objectId', queueObject.id);
      const results = await query.find({ sessionToken });
      return EventuallyQueue.sendQueueCallback(results[0], queueObject);
    },
    async byHash(ObjectType, queueObject) {
      const { sessionToken } = queueObject.serverOptions;
      const query = new ParseQuery(ObjectType);
      query.equalTo('hash', queueObject.hash);
      const results = await query.find({ sessionToken });
      if (results.length > 0) {
        return EventuallyQueue.sendQueueCallback(results[0], queueObject);
      }
      return EventuallyQueue.reprocess.create(ObjectType, queueObject);
    },
  },
};

module.exports = EventuallyQueue;
