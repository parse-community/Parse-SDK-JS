'use strict';

const Parse = require('../../node');

describe('Parse Push', () => {
  it('can get pushStatusId', async () => {
    const payload = {
      data: { alert: 'We return status!' },
      where: { deviceType: { $eq: 'random' } },
    };
    const pushStatusId = await Parse.Push.send(payload, { useMasterKey: true });
    const pushStatus = await Parse.Push.getPushStatus(pushStatusId, { useMasterKey: true });
    expect(pushStatus.id).toBe(pushStatusId);
  });
});
