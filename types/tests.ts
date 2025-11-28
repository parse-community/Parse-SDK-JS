import Parse from 'parse';
import ParseNode from 'parse/node';
import ParseRN from 'parse/react-native';

class GameScore extends Parse.Object {
  constructor() {
    super('GameScore');
  }
}

class Game extends Parse.Object {
  constructor() {
    super('Game');
  }
}

async function test_config() {
  await Parse.Config.save({ foo: 'bar' }, { foo: true });
  await Parse.Config.get({ useMasterKey: true });
}

async function test_object() {
  const game = new Game();
  game
    .save(null, {
      useMasterKey: true,
      sessionToken: 'sometoken',
      cascadeSave: false,
    })
    .then(result => result)
    .catch(error => error);

  // $ExpectType boolean
  game.isNew();
  // $ExpectType Pointer
  game.toPointer();
  // $ExpectType string
  game.toPointer().className;

  await game.fetch({});

  // Create a new instance of that class.
  const gameScore = new GameScore();

  gameScore.set('score', 1337);
  gameScore.set('playerName', 'Sean Plott');
  gameScore.set('cheatMode', false);

  // Setting attrs using object
  gameScore.set({
    level: '10',
    difficult: 15,
  });
  gameScore.get('score');
  gameScore.get('playerName');
  gameScore.get('cheatMode');
  gameScore.increment('score');
  gameScore.addUnique('skills', 'flying');
  gameScore.addUnique('skills', 'kungfu');
  gameScore.addAll('skills', ['kungfu']);
  gameScore.addAllUnique('skills', ['kungfu']);
  gameScore.remove('skills', 'flying');
  gameScore.removeAll('skills', ['kungFu']);
  game.set('gameScore', gameScore);
  // $ExpectType ParseObject<Attributes>
  Game.fromJSON(JSON.parse(JSON.stringify(game)), true);

  const object = new Parse.Object('TestObject');
  object.equals(gameScore);
  await object.fetchWithInclude(['key1', 'key2']);
}

function test_errors() {
  const error = new Parse.Error(Parse.Error.INTERNAL_SERVER_ERROR, 'sdfds');
  // $ExpectType number
  error.code;
  // $ExpectType string
  error.message;
}

async function test_query() {
  const gameScore = new GameScore();

  const query = new Parse.Query(GameScore);
  query.equalTo('playerName', 'Dan Stemkoski');
  query.notEqualTo('playerName', 'Michael Yabuti');
  query.fullText('playerName', 'dan', {
    language: 'en',
    caseSensitive: false,
    diacriticSensitive: true,
  });
  query.greaterThan('playerAge', 18);
  await query.eachBatch(objs => {}, { batchSize: 10 });
  await query.each(score => {});
  query.hint('_id_');
  query.explain(true);
  query.limit(10);
  query.skip(10);

  // Sorts the results in ascending order by the score field
  query.ascending('score');

  // Sorts the results in descending order by the score field
  query.descending('score');

  // Restricts to wins < 50
  query.lessThan('wins', 50);

  // Restricts to wins <= 50
  query.lessThanOrEqualTo('wins', 50);

  // Restricts to wins > 50
  query.greaterThan('wins', 50);

  // Restricts to wins >= 50
  query.greaterThanOrEqualTo('wins', 50);

  query.containedBy('place', ['1', '2']);
  // Finds scores from any of Jonathan, Dario, or Shawn
  query.containedIn('playerName', ['Jonathan Walsh', 'Dario Wunsch', 'Shawn Simon']);

  // Finds scores from anyone who is neither Jonathan, Dario, nor Shawn
  query.notContainedIn('playerName', ['Jonathan Walsh', 'Dario Wunsch', 'Shawn Simon']);

  // Finds objects that have the score set
  query.exists('score');

  // Finds objects that don't have the score set
  query.doesNotExist('score');
  query.matchesKeyInQuery('hometown', 'city', query);
  query.doesNotMatchKeyInQuery('hometown', 'city', query);
  query.select('score', 'playerName');

  // Find objects where the array in arrayKey contains 2.
  query.equalTo('arrayKey', 2);

  // Find objects where the array in arrayKey contains all of the elements 2, 3, and 4.
  query.containsAll('arrayKey', [2, 3, 4]);
  query.containsAllStartingWith('arrayKey', ['2', '3', '4']);

  query.startsWith('name', "Big Daddy's");
  query.equalTo('score', gameScore);
  query.exists('score');
  query.include('score');
  query.include('score', 'team');
  query.include(['score.team']);
  query.include('*');
  query.includeAll();
  query.sortByTextScore();
  // Find objects that match the aggregation pipeline
  await query.aggregate({
    group: {
      objectId: '$name',
    },
  });

  await query.aggregate({
    count: 'total',
  });

  await query.aggregate({
    lookup: {
      from: 'Collection',
      foreignField: 'id',
      localField: 'id',
      as: 'result',
    },
  });
  await query.aggregate({
    lookup: {
      from: 'Target',
      let: { foo: 'bar', baz: 123 },
      pipeline: [],
      as: 'result',
    },
  });

  await query.aggregate({
    graphLookup: {
      from: 'Target',
      connectFromField: 'objectId',
      connectToField: 'newId',
      as: 'result',
    },
  });

  await query.aggregate({
    facet: {
      foo: [
        {
          count: 'total',
        },
      ],
      bar: [
        {
          group: {
            objectId: '$name',
          },
        },
      ],
    },
  });

  await query.aggregate({
    unwind: '$field',
  });

  await query.aggregate({
    unwind: {
      path: '$field',
      includeArrayIndex: 'newIndex',
      preserveNullAndEmptyArrays: true,
    },
  });

  // Find objects with distinct key
  await query.distinct('name');

  const testQuery = Parse.Query.or(query, query);
}

function test_query_exclude() {
  const gameScore = new GameScore();

  const query = new Parse.Query(GameScore);

  // Show all keys, except the specified key.
  query.exclude('place');

  const testQuery = Parse.Query.or(query, query);
}

async function test_query_promise() {
  // Test promise with a query
  const findQuery = new Parse.Query('Test');
  findQuery
    .find()
    .then(() => {
      // success
    })
    .catch(() => {
      // error
    });

  const getQuery = new Parse.Query('Test');
  try {
    await getQuery.get('objectId');
  } catch (error) {
    // noop
  }

  await getQuery.map((score, index) => score.increment('score', index));
  await getQuery.reduce((accum, score, index) => (accum += score.get('score')), 0);
  await getQuery.reduce((accum, score, index) => (accum += score.get('score')), 0, {
    batchSize: 200,
  });
  await getQuery.filter(scores => scores.get('score') > 0);
  await getQuery.filter(scores => scores.get('score') > 0, { batchSize: 10 });
}

async function test_live_query() {
  const subscription = await new Parse.Query('Test').subscribe();
  subscription.on('close', (object: Parse.Object) => {
    // $ExpectType ParseObject<Attributes>
    object;
  });
  subscription.on('create', (object: Parse.Object) => {
    // $ExpectType ParseObject<Attributes>
    object;
  });
  subscription.on('delete', (object: Parse.Object) => {
    // $ExpectType ParseObject<Attributes>
    object;
  });
  subscription.on('enter', (object: Parse.Object) => {
    // $ExpectType ParseObject<Attributes>
    object;
  });
  subscription.on('leave', (object: Parse.Object) => {
    // $ExpectType ParseObject<Attributes>
    object;
  });
  subscription.on('open', (object: Parse.Object) => {
    // $ExpectType ParseObject<Attributes>
    object;
  });
  subscription.on('update', (object: Parse.Object) => {
    // $ExpectType ParseObject<Attributes>
    object;
  });
}

async function test_anonymous_utils() {
  // $ExpectType boolean
  Parse.AnonymousUtils.isLinked(new Parse.User());
  // $ExpectType ParseUser<Attributes>
  await Parse.AnonymousUtils.link(new Parse.User(), { useMasterKey: true, sessionToken: '' });
  // $ExpectType ParseUser<Attributes>
  await Parse.AnonymousUtils.logIn({ useMasterKey: true, sessionToken: '' });
}

function return_a_query(): Parse.Query {
  return new Parse.Query(Game);
}

async function test_each() {
  await new Parse.Query(Game).each(game => {
    // $ExpectType Game
    game;
  });
}

async function test_file() {
  const base64 = 'V29ya2luZyBhdCBQYXJzZSBpcyBncmVhdCE=';
  let file = new Parse.File('myfile.txt', { base64 });

  file = new Parse.File('nana', { uri: 'http://example.com/image.jps' });

  const bytes = [0xbe, 0xef, 0xca, 0xfe];
  file = new Parse.File('myfile.txt', bytes);

  file = new Parse.File('myfile.zzz', new Blob(), 'image/png');

  const src = file.url();
  const secure = file.url({ forceSecure: true });

  await file.save();
  file.cancel();
  await file.destroy();
}

function test_file_tags_and_metadata() {
  const base64 = 'V29ya2luZyBhdCBQYXJzZSBpcyBncmVhdCE=';
  const file = new Parse.File('myfile.txt', { base64 });
  file.setTags({ ownerId: 42, status: 'okay' });
  file.addTag('labes', 'one');
  file.setMetadata({ contentType: 'plain/text', contentLength: 579 });
  file.addMetadata('author', 'John Doe');
  // $ExpectType Record<string, any>
  file.tags();
  // $ExpectType Record<string, any>
  file.metadata();
}

async function test_analytics() {
  const dimensions = {
    // Define  ranges to bucket data points into meaningful segments
    priceRange: '1000-1500',
    // Did the user filter the query?
    source: 'craigslist',
    // Do searches happen more often on weekdays or weekends?
    dayType: 'weekday',
  };
  // Send the dimensions to Parse along with the 'search' event
  await Parse.Analytics.track('search', dimensions);

  const codeString = '404';
  await Parse.Analytics.track('error', { code: codeString });
}

function test_relation() {
  const game1 = new Game();
  const game2 = new Game();

  new Parse.User()
    .relation<Game>('games')
    .query()
    .find()
    .then((g: Game[]) => {})
    .catch(error => error);
  new Parse.User().relation('games').add(game1);
  new Parse.User().relation('games').add([game1, game2]);

  new Parse.User().relation('games').remove(game1);
  new Parse.User().relation('games').remove([game1, game2]);
}

async function test_user() {
  const user = new Parse.User();
  user.set('username', 'my name');
  user.set('password', 'my pass');
  user.set('email', 'email@example.com');
  await user.signUp(null, { useMasterKey: true });

  const anotherUser: Parse.User = Parse.User.fromJSON({});
  anotherUser.set('email', 'email@example.com');
}

async function test_user_currentAsync() {
  const asyncUser = await Parse.User.currentAsync();
  if (asyncUser) {
    asyncUser.set('email', 'email@example.com');
  } else if (asyncUser === null) {
    await Parse.User.logIn('email@example.com', 'my pass');
  }
}

async function test_user_acl_roles() {
  const user = new Parse.User();
  user.set('username', 'my name');
  user.set('password', 'my pass');
  user.set('email', 'email@example.com');

  // other fields can be set just like with Parse.Object
  user.set('phone', '415-392-0202');

  const currentUser = Parse.User.current();
  if (currentUser) {
    // do stuff with the user
  } else {
    // show the signup or login page
  }

  Parse.User.become('session-token-here')
    .then(
      user => {
        // The current user is now set to user.
      },
      error => {
        // The token could not be validated.
      }
    )
    .catch(error => error);

  Parse.User.hydrate({})
    .then(
      user => {
        // The current user is now set to user.
      },
      error => {
        // The token could not be validated.
      }
    )
    .catch(error => error);

  const game = new Game();
  game.set('gameScore', new GameScore());
  game.setACL(new Parse.ACL(Parse.User.current()));
  game
    .save()
    .then((game: Game) => {})
    .catch(error => error);
  await game.save(null, { useMasterKey: true });
  game
    .save({ score: '10' }, { useMasterKey: true })
    .then(
      game => {
        // Update game then revert it to the last saved state.
        game.set('score', '20');
        game.revert('score');
        game.revert('score', 'ACL');
        game.revert();
      },
      error => {
        // The save failed
      }
    )
    .catch(error => error);

  const groupACL = new Parse.ACL();

  const userList: Parse.User[] = [Parse.User.current()!];
  // userList is an array with the users we are sending this message to.
  for (const userListItem of userList) {
    groupACL.setReadAccess(userListItem, true);
    groupACL.setWriteAccess(userListItem, true);
  }

  groupACL.setPublicReadAccess(true);

  game.setACL(groupACL);

  Parse.User.requestPasswordReset('email@example.com')
    .then(
      data => {
        // The current user is now set to user.
      },
      error => {
        // The token could not be validated.
      }
    )
    .catch(error => error);

  Parse.User.requestEmailVerification('email@example.com')
    .then(
      data => {
        // The current user is now set to user.
      },
      error => {
        // The token could not be validated.
      }
    )
    .catch(error => error);

  // By specifying no write privileges for the ACL, we can ensure the role cannot be altered.
  const role = new Parse.Role('Administrator', groupACL);
  role.getUsers().add(userList[0]);
  role.getRoles().add(role);
  await role.save();

  await Parse.User.logOut()
    .then(data => {
      // logged out
    })
    .catch(error => error);
}

async function test_facebook_util() {
  Parse.FacebookUtils.init({
    appId: 'YOUR_APP_ID', // Facebook App ID
    channelUrl: '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel File
    cookie: true, // enable cookies to allow Parse to access the session
    xfbml: true, // parse XFBML
  });

  await Parse.FacebookUtils.logIn(null, {
    success: (user: Parse.User) => {
      if (!user.existed()) {
        alert('User signed up and logged in through Facebook!');
      } else {
        alert('User logged in through Facebook!');
      }
    },
    error: (user: Parse.User, error: any) => {
      alert('User cancelled the Facebook login or did not fully authorize.');
    },
  });

  const user = Parse.User.current()!;

  if (!Parse.FacebookUtils.isLinked(user)) {
    await Parse.FacebookUtils.link(user, null, {
      success: (user: any) => {
        alert('Woohoo, user logged in with Facebook!');
      },
      error: (user: any, error: any) => {
        alert('User cancelled the Facebook login or did not fully authorize.');
      },
    });
  }

  await Parse.FacebookUtils.unlink(user, {
    success: (user: Parse.User) => {
      alert('The user is no longer associated with their Facebook account.');
    },
  });
}

async function test_cloud_functions() {
  // $ExpectType any
  await Parse.Cloud.run('SomeFunction');
  // $ExpectType any
  await Parse.Cloud.run('SomeFunction', { something: 'whatever' });
  // $ExpectType any
  await Parse.Cloud.run('SomeFunction', null, { useMasterKey: true });
  // ExpectType boolean
  await Parse.Cloud.run<() => boolean>('SomeFunction');
  // $ExpectType boolean
  await Parse.Cloud.run<() => boolean>('SomeFunction', null);
  // $ExpectType boolean
  await Parse.Cloud.run<() => boolean>('SomeFunction', null, { useMasterKey: true });
  // $ExpectType number
  await Parse.Cloud.run<(params: { paramA: string }) => number>('SomeFunction', {
    paramA: 'hello',
  });
  // $ExpectError
  await Parse.Cloud.run<(params: { paramA: string }) => number>('SomeFunction');
  await Parse.Cloud.run<(params: { paramA: string }) => number>('SomeFunction', {
    // $ExpectError
    paramZ: 'hello',
  });
  // $ExpectError
  await Parse.Cloud.run<(params: { paramA: string }) => number>('SomeFunction', null, {
    useMasterKey: true,
  });
  // $ExpectError
  await Parse.Cloud.run<(params: string) => any>('SomeFunction', 'hello');
  // Parse.Cloud.afterDelete('MyCustomClass', (request: Parse.Cloud.AfterDeleteRequest) => {
  //   // result
  // });
  // Parse.Cloud.afterSave('MyCustomClass', (request: Parse.Cloud.AfterSaveRequest) => {
  //   if (!request.context) {
  //     throw new Error('Request context should be defined');
  //   }
  //   // result
  // });
  // Parse.Cloud.beforeDelete('MyCustomClass', (request: Parse.Cloud.BeforeDeleteRequest) => {
  //   // result
  // });
  // Parse.Cloud.beforeDelete('MyCustomClass', async (request: Parse.Cloud.BeforeDeleteRequest) => {
  //   // result
  // });
  // interface BeforeSaveObject {
  //   immutable: boolean;
  // }
  // Parse.Cloud.beforeSave('MyCustomClass', request => {
  //   if (request.object.isNew()) {
  //     if (!request.object.has('immutable')) throw new Error('Field immutable is required');
  //   } else {
  //     const original = request.original;
  //     if (original == null) {
  //       // When the object is not new, request.original must be defined
  //       throw new Error('Original must me defined for an existing object');
  //     }
  //     if (original.get('immutable') !== request.object.get('immutable')) {
  //       throw new Error('This field cannot be changed');
  //     }
  //   }
  //   if (!request.context) {
  //     throw new Error('Request context should be defined');
  //   }
  // });
  // Parse.Cloud.beforeFind('MyCustomClass', (request: Parse.Cloud.BeforeFindRequest) => {
  //   const query = request.query; // the Parse.Query
  //   const user = request.user; // the user
  //   const isMaster = request.master; // if the query is run with masterKey
  //   const isCount = request.count; // if the query is a count operation (available on parse-server 2.4.0 or up)
  //   const isGet = request.isGet; // if the query is a get operation
  //   // All possible read preferences
  //   request.readPreference = Parse.Cloud.ReadPreferenceOption.Primary;
  //   request.readPreference = Parse.Cloud.ReadPreferenceOption.PrimaryPreferred;
  //   request.readPreference = Parse.Cloud.ReadPreferenceOption.Secondary;
  //   request.readPreference = Parse.Cloud.ReadPreferenceOption.SecondaryPreferred;
  //   request.readPreference = Parse.Cloud.ReadPreferenceOption.Nearest;
  // });
  // Parse.Cloud.beforeFind('MyCustomClass', (request: Parse.Cloud.BeforeFindRequest) => {
  //   const query = request.query; // the Parse.Query
  //   return new Parse.Query('QueryMe!');
  // });
  // Parse.Cloud.beforeFind('MyCustomClass', (request: Parse.Cloud.BeforeFindRequest) => {
  //   const query = request.query; // the Parse.Query
  //   return new Parse.Query('QueryMe, IN THE FUTURE!');
  // });
  // Parse.Cloud.afterFind('MyCustomClass', (request: Parse.Cloud.AfterFindRequest) => {
  //   return new Parse.Object('MyCustomClass');
  // });
  // Parse.Cloud.beforeLogin((request: Parse.Cloud.TriggerRequest) => {
  //   return Promise.resolve();
  // });
  // Parse.Cloud.afterLogin((request: Parse.Cloud.TriggerRequest) => {
  //   return Promise.resolve();
  // });
  // Parse.Cloud.afterLogout((request: Parse.Cloud.TriggerRequest) => {
  //   return Promise.resolve();
  // });
  // Parse.Cloud.beforeSaveFile((request: Parse.Cloud.FileTriggerRequest) => {
  //   return Promise.resolve(new Parse.File('myFile.txt', { base64: '' }));
  // });
  // Parse.Cloud.beforeSaveFile((request: Parse.Cloud.FileTriggerRequest) => {});
  // Parse.Cloud.beforeDeleteFile((request: Parse.Cloud.FileTriggerRequest) => {});
  // Parse.Cloud.afterDeleteFile((request: Parse.Cloud.FileTriggerRequest) => {});
  // Parse.Cloud.define('AFunc', (request: Parse.Cloud.FunctionRequest) => {
  //   return 'Some result';
  // });
  // Parse.Cloud.define(
  //   'AFunc',
  //   (request: Parse.Cloud.FunctionRequest) => {
  //     return 'Some result';
  //   },
  //   {
  //     requireUser: true,
  //     requireMaster: true,
  //     validateMasterKey: true,
  //     skipWithMasterKey: true,
  //     requireAnyUserRoles: ['a'],
  //     requireAllUserRoles: ['a'],
  //     fields: {
  //       name: {
  //         type: String,
  //         constant: true,
  //         default: true,
  //         options: [],
  //         error: 'invalid field.',
  //       },
  //     },
  //     requireUserKeys: {
  //       name: {
  //         type: String,
  //         constant: true,
  //         default: true,
  //         options: [],
  //         error: 'invalid field.',
  //       },
  //     },
  //   }
  // );
  // Parse.Cloud.define('AFunc', request => {
  //   // $ExpectType Params
  //   request.params;
  //   // $ExpectType any
  //   request.params.anything;
  // });
  // Parse.Cloud.define<() => void>('AFunc', request => {
  //   // $ExpectType {}
  //   request.params;
  // });
  // Parse.Cloud.define<(params: { something: string }) => number>('AFunc', request => {
  //   // $ExpectType { something: string; }
  //   request.params;
  //   // $ExpectError
  //   request.params.somethingElse;
  //   return 123;
  // });
  // // $ExpectError
  // Parse.Cloud.define('AFunc');
  // // $ExpectError
  // Parse.Cloud.define<() => string>('AFunc', () => 123);
  // // $ExpectError
  // Parse.Cloud.define<(params: string) => number>('AFunc', () => 123);
  // Parse.Cloud.job('AJob', (request: Parse.Cloud.JobRequest) => {
  //   request.message('Message to associate with this job run');
  // });
  await Parse.Cloud.startJob('AJob', {}).then(v => v);
  await Parse.Cloud.getJobStatus('AJob').then(v => v);
  await Parse.Cloud.getJobsData().then(v => v);
}

class PlaceObject extends Parse.Object {}

function test_geo_points() {
  let point = new Parse.GeoPoint();
  // $ExpectError
  point = new Parse.GeoPoint('40.0');
  // $ExpectType ParseGeoPoint
  point = new Parse.GeoPoint(40.0);
  // $ExpectError
  point = new Parse.GeoPoint([40.0, -30.0, 20.0]);
  point = new Parse.GeoPoint([40.0, -30.0]);
  point = new Parse.GeoPoint(40.0, -30.0);
  point = new Parse.GeoPoint({ latitude: 40.0, longitude: -30.0 });

  const userObject = Parse.User.current<Parse.User<{ location: Parse.GeoPoint }>>()!;

  // User's location
  const userGeoPoint = userObject.get('location');

  // Create a query for places
  const query = new Parse.Query(Parse.User);
  // Interested in locations near user.
  query.near('location', userGeoPoint);
  // Limit what could be a lot of points.
  query.limit(10);

  const southwestOfSF = new Parse.GeoPoint(37.708813, -122.526398);
  const northeastOfSF = new Parse.GeoPoint(37.822802, -122.373962);

  const query2 = new Parse.Query(PlaceObject);
  query2.withinGeoBox('location', southwestOfSF, northeastOfSF);

  const query3 = new Parse.Query('PlaceObject')
    .find()
    .then((o: Parse.Object[]) => {})
    .catch(error => error);
}

async function test_push() {
  await Parse.Push.send(
    {
      channels: ['Gia nts', 'Mets'],
      data: {
        alert: 'The Giants won against the Mets 2-3.',
      },
    },
    {
      success: () => {
        // Push was successful
      },
      error: (error: any) => {
        // Handle error
      },
    }
  );

  const query = new Parse.Query(Parse.Installation);
  query.equalTo('injuryReports', true);

  await Parse.Push.send(
    {
      where: query, // Set our Installation query
      data: {
        alert: 'Willie Hayes injured by own pop fly.',
      },
    },
    {
      success() {
        // Push was successful
      },
      error(error: any) {
        // Handle error
      },
    }
  );
}

async function test_batch_operations() {
  const game1 = new Game();
  const game2 = new Game();
  const games = [game1, game2];

  // Master key
  await Parse.Object.saveAll(games, { useMasterKey: true });
  await Parse.Object.destroyAll(games, { useMasterKey: true });
  await Parse.Object.fetchAll(games, { useMasterKey: true });
  await Parse.Object.fetchAllIfNeeded(games, { useMasterKey: true });

  // Session token
  await Parse.Object.saveAll(games, { sessionToken: '' });
  await Parse.Object.destroyAll(games, { sessionToken: '' });
  await Parse.Object.fetchAll(games, { sessionToken: '' });
  await Parse.Object.fetchAllIfNeeded(games, { sessionToken: '' });
}

async function test_query_subscribe() {
  // create new query from Game object type
  const query = new Parse.Query(Game);

  // create subscription to Game object
  // Without a token
  // $ExpectType LiveQuerySubscription
  let subscription = await query.subscribe();

  // With a session token
  // $ExpectType LiveQuerySubscription
  subscription = await query.subscribe(new Parse.User().getSessionToken());

  // listen for new Game objects created on Parse server
  subscription.on('create', (game: any) => {
    console.log(game);
  });

  // unsubscribe
  await subscription.unsubscribe();
}

function test_serverURL() {
  Parse.serverURL = 'http://localhost:1337/parse';
}
function test_polygon() {
  const point = new Parse.GeoPoint(1, 2);
  const polygon1 = new Parse.Polygon([
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ]);
  const polygon2 = new Parse.Polygon([point, point, point]);
  polygon1.equals(polygon2);
  polygon1.containsPoint(point);

  const query = new Parse.Query('TestObject');
  query.polygonContains('key', point);
  query.withinPolygon('key', [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ]);
}

async function test_local_datastore() {
  Parse.enableLocalDatastore();
  const name = 'test_pin';
  const obj = new Parse.Object('TestObject');
  await obj.pin();
  await obj.unPin();
  await obj.isPinned();
  await obj.pinWithName(name);
  await obj.unPinWithName(name);
  await obj.fetchFromLocalDatastore();

  await Parse.Object.pinAll([obj]);
  await Parse.Object.unPinAll([obj]);
  await Parse.Object.pinAllWithName(name, [obj]);
  await Parse.Object.unPinAllWithName(name, [obj]);
  await Parse.Object.unPinAllObjects();
  await Parse.Object.unPinAllObjectsWithName(name);
  // $ExpectType boolean
  Parse.isLocalDatastoreEnabled();
  // $ExpectType any
  await Parse.dumpLocalDatastore();

  const query = new Parse.Query('TestObject');
  query.fromPin();
  query.fromPinWithName(name);
  query.fromLocalDatastore();

  Parse.setLocalDatastoreController({});
}

async function test_from_network() {
  const obj = new Parse.Object('TestObject');
  await obj.save();

  const query = new Parse.Query('TestObject');
  query.fromNetwork();
}

async function test_cancel_query() {
  const obj = new Parse.Object('TestObject');
  await obj.save();

  const query = new Parse.Query('TestObject');
  await query.fromNetwork().find();
  query.cancel();
}

/* eslint-disable @typescript-eslint/no-redundant-type-constituents -- object is intentionally included for testing Exclude<FieldType, object>. */
type FieldType =
  | string
  | number
  | boolean
  | Date
  | Parse.File
  | Parse.GeoPoint
  | any[]
  | object
  | Parse.Pointer
  | Parse.Polygon
  | Parse.Relation;
/* eslint-enable @typescript-eslint/no-redundant-type-constituents */
async function test_schema(
  anyField: FieldType,
  notString: Exclude<FieldType, string>,
  notNumber: Exclude<FieldType, number>,
  notboolean: Exclude<FieldType, boolean>,
  notDate: Exclude<FieldType, Date>,
  notFile: Exclude<FieldType, Parse.File>,
  notGeopoint: Exclude<FieldType, Parse.GeoPoint[]>,
  notArray: Exclude<FieldType, any[]>,
  notObject: Exclude<FieldType, object>,
  notPointer: Exclude<FieldType, Parse.Pointer>,
  notPolygon: Exclude<FieldType, Parse.Polygon>
) {
  // $ExpectType RestSchema[]
  await Parse.Schema.all();

  const schema = new Parse.Schema('TestSchema');

  schema.addArray('arrayField');
  schema.addArray('arrayField', { defaultValue: [1, 2, 3, 4] });
  // $ExpectError
  schema.addArray('arrayField', { defaultValue: notArray });

  /**
   * @todo Enable type check for default value
   */
  schema.addField('defaultFieldString');
  schema.addField('defaultFieldString', 'String', { defaultValue: anyField });
  schema.addField('defaultFieldString', 'Number');
  schema.addField('defaultFieldString', 'Relation');
  // $ExpectError
  schema.addField('defaultFieldString', 'String', 'Invalid Options');

  schema.addString('field');
  schema.addString('field', { defaultValue: 'some string', required: true });
  // $ExpectError
  schema.addString('field', { defaultValue: notString });

  schema.addNumber('field');
  schema.addNumber('field', { defaultValue: 0, required: true });
  // $ExpectError
  schema.addNumber('field', { defaultValue: notNumber });

  schema.addBoolean('field');
  schema.addBoolean('field', { defaultValue: true, required: true });
  // $ExpectError
  schema.addBoolean('field', { defaultValue: notboolean });

  schema.addDate('field');
  schema.addDate('field', { defaultValue: new Date(), required: true });
  // $ExpectError
  schema.addDate('field', { defaultValue: notDate });

  schema.addFile('field');
  schema.addFile('field', { defaultValue: new Parse.File('myfile', []), required: true });
  // $ExpectError
  schema.addFile('field', { defaultValue: notFile });

  schema.addGeoPoint('field');
  schema.addGeoPoint('field', { defaultValue: new Parse.GeoPoint(), required: true });
  // $ExpectError
  schema.addGeoPoint('field', { defaultValue: notGeopoint });

  schema.addPolygon('field');
  schema.addPolygon('field', { defaultValue: new Parse.Polygon([]), required: true });
  // $ExpectError
  schema.addPolygon('field', { defaultValue: notPolygon });

  schema.addObject('field');
  schema.addObject('field', { defaultValue: {}, required: true });
  schema.addObject('field', { defaultValue: { abc: 'def' } });
  // $ExpectError
  schema.addObject('field', { defaultValue: notObject });

  schema.addPointer('field', 'SomeClass');
  // $ExpectError
  schema.addPointer('field');
  /**
   * @todo Infer defaultValue type from targetClass
   */
  schema.addPointer('field', '_User', {
    defaultValue: new Parse.User().toPointer(),
    required: true,
  });
  // $ExpectError
  schema.addPointer('field', { defaultValue: notPointer });

  schema.addRelation('field', 'SomeClass');
  // $ExpectError
  schema.addRelation('field');
  // $ExpectError
  schema.addRelation('field', 'SomeClass', 'anything');

  schema.addIndex('testIndex', { stringField: 'text' });
  schema.addIndex('testIndex', { stringField: 1 });
  schema.addIndex('testIndex', { stringField: -1 });
  // $ExpectError
  schema.addIndex('testIndex', { stringField: true });

  schema.deleteField('defaultFieldString');
  schema.deleteIndex('testIndex');
  await schema.delete();
  // $ExpectType RestSchema
  await schema.get();
  await schema.purge();
  await schema.save();
  await schema.update();

  function testGenericType() {
    interface iTestAttributes {
      arrField: any[];
      boolField: boolean;
      stringField: string;
      numField: number;
      dateField: Date;
      fileField: Parse.File;
      geoPointField: Parse.GeoPoint;
      polygonField: Parse.Polygon;
      objectField: object;
      relationField: Parse.Relation;
      pointerField: Parse.Pointer | Parse.Object;
    }
    class TestObject extends Parse.Object<iTestAttributes> {}

    const schema = new Parse.Schema<TestObject>('TestObject');
    schema.addArray('arrField');
    schema.addBoolean('boolField');
    schema.addDate('dateField');
    schema.addFile('fileField');
    schema.addGeoPoint('geoPointField');
    schema.addNumber('numField');
    schema.addObject('objectField');
    schema.addPointer('pointerField', 'FooClass');
    schema.addPolygon('polygonField');
    schema.addRelation('relationField', 'FooClass');
    schema.addString('stringField');

    // $ExpectError
    schema.addArray('wrong');
    // $ExpectError
    schema.addBoolean('wrong');
    // $ExpectError
    schema.addDate('wrong');
    // $ExpectError
    schema.addFile('wrong');
    // $ExpectError
    schema.addGeoPoint('wrong');
    // $ExpectError
    schema.addNumber('wrong');
    // $ExpectError
    schema.addObject('wrong');
    // $ExpectError
    schema.addPointer('wrong', 'FooClass');
    // $ExpectError
    schema.addPolygon('wrong');
    // $ExpectError
    schema.addRelation('wrong', 'FooClass');
    // $ExpectError
    schema.addString('wrong');
  }
}

function testObject() {
  function testConstructor() {
    // $ExpectType ParseObject<Attributes>
    new Parse.Object();

    // $ExpectType ParseObject<Attributes>
    new Parse.Object('TestObject');

    // $ExpectType ParseObject<{ example: number; }>
    new Parse.Object('TestObject', { example: 100 });

    // $ExpectType ParseObject<{ example: boolean; }>
    new Parse.Object<{ example: boolean }>('TestObject', { example: true });

    // $ExpectType ParseObject<{ example: string; }>
    new Parse.Object('TestObject', { example: 'hello' }, { ignoreValidation: true });

    // $ExpectType ParseObject<{ example: string; }>
    new Parse.Object<{ example: string }>('TestObject');

    // $ExpectType ParseObject<{ example: number; }>
    new Parse.Object<{ example: number }>('TestObject', { example: 100 });

    // $ExpectError
    new Parse.Object<{ example: boolean }>('TestObject', { example: 'hello' });
  }

  function testStaticMethods() {
    async function testSaveAll(
      objUntyped: Parse.Object,
      objTyped: Parse.Object<{ example: string }>
    ) {
      // $ExpectType ParseObject<Attributes>[]
      await Parse.Object.saveAll([objUntyped]);

      // $ExpectType ParseObject<{ example: string; }>[]
      await Parse.Object.saveAll([objTyped]);

      // $ExpectType [ParseObject<Attributes>, ParseObject<{ example: string; }>]
      await Parse.Object.saveAll<[typeof objUntyped, typeof objTyped]>([objUntyped, objTyped]);

      // $ExpectError
      await Parse.Object.saveAll([123]);
    }
  }

  function testAttributes(objUntyped: Parse.Object, objTyped: Parse.Object<{ example: string }>) {
    // $ExpectType any
    objUntyped.attributes.whatever;

    // $ExpectType string
    objTyped.attributes.example;

    // $ExpectError
    objTyped.attributes.other;
  }

  function testAdd(
    objUntyped: Parse.Object,
    objTyped: Parse.Object<{ stringList: string[]; thing: boolean }>
  ) {
    // $ExpectType ParseObject<Attributes>
    objUntyped.add('whatever', 'hello');

    // $ExpectType ParseObject<{ stringList: string[]; thing: boolean; }>
    objTyped.add('stringList', 'hello');

    // $ExpectError
    objTyped.add('stringList', 100);

    // $ExpectError
    objTyped.add('thing', true);

    // $ExpectError
    objTyped.add('whatever', 'hello');
  }

  function testAddAll(
    objUntyped: Parse.Object,
    objTyped: Parse.Object<{ stringList: string[]; thing: boolean }>
  ) {
    // $ExpectType ParseObject<Attributes>
    objUntyped.addAll('whatever', ['hello', 100]);

    // $ExpectType ParseObject<{ stringList: string[]; thing: boolean; }>
    objTyped.addAll('stringList', ['hello']);

    // $ExpectError
    objTyped.addAll('stringList', [100]);

    // $ExpectError
    objTyped.addAll('thing', [true]);

    // $ExpectError
    objTyped.addAll('whatever', ['hello']);
  }

  function testAddAllUnique(
    objUntyped: Parse.Object,
    objTyped: Parse.Object<{ stringList: string[]; thing: boolean }>
  ) {
    // $ExpectType ParseObject<Attributes>
    objUntyped.addAllUnique('whatever', ['hello', 100]);

    // $ExpectType ParseObject<{ stringList: string[]; thing: boolean; }>
    objTyped.addAllUnique('stringList', ['hello']);

    // $ExpectError
    objTyped.addAllUnique('stringList', [100]);

    // $ExpectError
    objTyped.addAllUnique('thing', [true]);

    // $ExpectError
    objTyped.addAllUnique('whatever', ['hello']);
  }

  function testAddUnique(
    objUntyped: Parse.Object,
    objTyped: Parse.Object<{ stringList: string[]; thing: boolean }>
  ) {
    // $ExpectType ParseObject<Attributes>
    objUntyped.addUnique('whatever', 'hello');

    // $ExpectType ParseObject<{ stringList: string[]; thing: boolean; }>
    objTyped.addUnique('stringList', 'hello');

    // $ExpectError
    objTyped.addUnique('stringList', 100);

    // $ExpectError
    objTyped.addUnique('thing', true);

    // $ExpectError
    objTyped.addUnique('whatever', 'hello');
  }

  function testDirty(objUntyped: Parse.Object, objTyped: Parse.Object<{ example: string }>) {
    // $ExpectType boolean
    objUntyped.dirty();

    // $ExpectType boolean
    objUntyped.dirty('whatever');

    // $ExpectType boolean
    objTyped.dirty();

    // $ExpectType boolean
    objTyped.dirty('example');

    // $ExpectError
    objTyped.dirty('other');
  }

  function testEquals(objUntyped: Parse.Object, objTyped: Parse.Object<{ example: string }>) {
    // $ExpectType boolean
    objUntyped.equals(objTyped);

    // $ExpectType boolean
    objTyped.equals(objUntyped);

    // $ExpectError
    objUntyped.equals('blah');
  }

  function testEscape(objUntyped: Parse.Object, objTyped: Parse.Object<{ example: string }>) {
    // $ExpectType string
    objUntyped.escape('whatever');

    // $ExpectType string
    objTyped.escape('example');

    // $ExpectError
    objTyped.escape('other');
  }

  async function testFetchWithInclude(
    objUntyped: Parse.Object,
    objTyped: Parse.Object<{ example: string }>
  ) {
    // $ExpectType ParseObject<Attributes>
    await objUntyped.fetchWithInclude('whatever');

    // $ExpectType ParseObject<Attributes>
    await objUntyped.fetchWithInclude(['whatever']);

    // $ExpectType ParseObject<Attributes>
    await objUntyped.fetchWithInclude([['whatever']]);

    // $ExpectError
    await objUntyped.fetchWithInclude([[['whatever']]]);

    // $ExpectType ParseObject<{ example: string; }>
    await objTyped.fetchWithInclude('example');

    // $ExpectType ParseObject<{ example: string; }>
    await objTyped.fetchWithInclude(['example']);

    // $ExpectType ParseObject<{ example: string; }>
    await objTyped.fetchWithInclude([['example']]);

    // $ExpectError
    await objTyped.fetchWithInclude([[['example']]]);

    // $ExpectType ParseObject<{ example: string; }>[]
    await Parse.Object.fetchAllIfNeededWithInclude([objTyped], 'example');

    // $ExpectError
    await Parse.Object.fetchAllIfNeededWithInclude([objTyped], 'notAnAttribute');

    // $ExpectType ParseObject<{ example: string; }>[]
    await Parse.Object.fetchAllWithInclude([objTyped], 'example');

    // $ExpectError
    await Parse.Object.fetchAllWithInclude([objTyped], 'notAnAttribute');
  }

  function testGet(objUntyped: Parse.Object, objTyped: Parse.Object<{ example: number }>) {
    // $ExpectType any
    objUntyped.get('whatever');

    // $ExpectType number
    objTyped.get('example');

    // $ExpectError
    objTyped.get('other');
  }

  function testHas(objUntyped: Parse.Object, objTyped: Parse.Object<{ example: number }>) {
    // $ExpectType boolean
    objUntyped.has('whatever');

    // $ExpectType boolean
    objTyped.has('example');

    // $ExpectError
    objTyped.has('other');
  }

  function testIncrement(objUntyped: Parse.Object, objTyped: Parse.Object<{ example: number }>) {
    // $ExpectType ParseObject<Attributes>
    objUntyped.increment('whatever');

    // $ExpectType ParseObject<Attributes>
    objUntyped.increment('whatever', 10);

    // $ExpectType ParseObject<{ example: number; }>
    objTyped.increment('example');

    // $ExpectType ParseObject<{ example: number; }>
    objTyped.increment('example', 20);

    // $ExpectError
    objTyped.increment('example', true);

    // $ExpectError
    objTyped.increment('other');
  }

  function testDecrement(objUntyped: Parse.Object, objTyped: Parse.Object<{ example: number }>) {
    // $ExpectType ParseObject<Attributes>
    objUntyped.decrement('whatever');

    // $ExpectType ParseObject<Attributes>
    objUntyped.decrement('whatever', 10);

    // $ExpectType ParseObject<{ example: number; }>
    objTyped.decrement('example');

    // $ExpectType ParseObject<{ example: number; }>
    objTyped.decrement('example', 20);

    // $ExpectError
    objTyped.decrement('example', true);

    // $ExpectError
    objTyped.decrement('other');
  }

  function testNewInstance(objUntyped: Parse.Object, objTyped: Parse.Object<{ example: number }>) {
    // $ExpectType ParseObject<Attributes>
    objUntyped.newInstance();

    // $ExpectType ParseObject<{ example: number; }>
    objTyped.newInstance();
  }

  function testOp(objUntyped: Parse.Object, objTyped: Parse.Object<{ example: number }>) {
    // $ExpectType Op | undefined
    objUntyped.op('whatever');

    // $ExpectType Op | undefined
    objTyped.op('example');

    // $ExpectError
    objTyped.op('other');
  }

  function testRelation(
    objUntyped: Parse.Object,
    objTyped: Parse.Object<{ example: number; rel: Parse.Relation }>
  ) {
    // $ExpectType ParseRelation<ParseObject<Attributes>, ParseObject<Attributes>>
    objUntyped.relation('whatever');

    // $ExpectType ParseRelation<ParseObject<{ example: number; rel: ParseRelation<ParseObject<Attributes>, ParseObject<Attributes>>; }>, ParseObject<Attributes>>
    objTyped.relation('rel');

    // $ExpectError
    objTyped.relation('example');

    // $ExpectError
    objTyped.relation('other');
  }

  function testRemove(
    objUntyped: Parse.Object,
    objTyped: Parse.Object<{ stringList: string[]; thing: boolean }>
  ) {
    // $ExpectType ParseObject<Attributes>
    objUntyped.remove('whatever', 'hello');

    // $ExpectType ParseObject<{ stringList: string[]; thing: boolean; }>
    objTyped.remove('stringList', 'hello');

    // $ExpectError
    objTyped.remove('stringList', 100);

    // $ExpectError
    objTyped.remove('thing', true);

    // $ExpectError
    objTyped.remove('whatever', 'hello');
  }

  function testRemoveAll(
    objUntyped: Parse.Object,
    objTyped: Parse.Object<{ stringList: string[]; thing: boolean }>
  ) {
    // $ExpectType ParseObject<Attributes>
    objUntyped.removeAll('whatever', ['hello', 100]);

    // $ExpectType ParseObject<{ stringList: string[]; thing: boolean; }>
    objTyped.removeAll('stringList', ['hello']);

    // $ExpectError
    objTyped.removeAll('stringList', [100]);

    // $ExpectError
    objTyped.removeAll('thing', [true]);

    // $ExpectError
    objTyped.removeAll('whatever', ['hello']);
  }

  function testRevert(
    objUntyped: Parse.Object,
    objTyped: Parse.Object<{ thingOne: number; thingTwo: boolean }>
  ) {
    // $ExpectType void
    objUntyped.revert();

    // $ExpectType void
    objUntyped.revert('whatever', 'more whatever');

    // $ExpectType void
    objTyped.revert();

    // $ExpectType void
    objTyped.revert('thingOne', 'thingTwo');

    // $ExpectError
    objTyped.revert('other');
  }
  interface ObjectAttributes {
    example: boolean;
    someString: string;
  }
  interface OptionalObjectAttributes {
    example?: boolean | undefined;
    another?: string | undefined;
  }

  async function testSave(
    objUntyped: Parse.Object,
    objTyped: Parse.Object<ObjectAttributes>,
    objTypedOptional: Parse.Object<OptionalObjectAttributes>
  ) {
    // $ExpectType ParseObject<Attributes>
    await objUntyped.save({ whatever: 100 });

    // $ExpectType ParseObject<Attributes>
    await objUntyped.save('whatever', 100);

    // $ExpectType ParseObject<ObjectAttributes>
    await objTyped.save({ example: true });

    // $ExpectType ParseObject<ObjectAttributes>
    await objTyped.save({ example: true, someString: 'hello' });

    // $ExpectError
    await objTyped.save({ example: 'hello', someString: true });

    // $ExpectType ParseObject<ObjectAttributes>
    await objTyped.save('example', true);

    // $ExpectError
    await objTyped.save({ example: 'hello' });

    // $ExpectError
    await objTyped.save({ wrongProp: 5 });

    // $ExpectError
    await objTyped.save('example', 10);

    // $ExpectError
    await objTyped.save('wrongProp', true);

    // $ExpectError
    await objTyped.save({ example: undefined });

    // $ExpectError
    await objTyped.save('example', undefined);

    // $ExpectType ParseObject<ObjectAttributes>
    await objTyped.save({});

    // $ExpectType ParseObject<ObjectAttributes>
    await objTyped.save();

    // $ExpectType ParseObject<OptionalObjectAttributes>
    await objTypedOptional.save({ example: undefined });

    // $ExpectType ParseObject<OptionalObjectAttributes>
    await objTypedOptional.save('example', undefined);

    // $ExpectType ParseObject<OptionalObjectAttributes>
    await objTypedOptional.save({});

    // $ExpectType ParseObject<OptionalObjectAttributes>
    await objTypedOptional.saveEventually({});

    // $ExpectType ParseObject<OptionalObjectAttributes>
    await objTypedOptional.destroyEventually({});

    // $ExpectType ParseObject<OptionalObjectAttributes>
    await objTypedOptional.saveEventually();

    // $ExpectType ParseObject<OptionalObjectAttributes>
    await objTypedOptional.destroyEventually();
  }

  function testSet(
    objUntyped: Parse.Object,
    objTyped: Parse.Object<ObjectAttributes>,
    objTypedOptional: Parse.Object<OptionalObjectAttributes>
  ) {
    // $ExpectType ParseObject<Attributes>
    objUntyped.set('propA', 'some value');

    // $ExpectType ParseObject<Attributes>
    objUntyped.set({ propA: undefined });

    // $ExpectError
    objTyped.set({ example: false });

    // $ExpectType ParseObject<ObjectAttributes>
    objTyped.set({ example: true, someString: 'abc' });

    // $ExpectError
    objTyped.set({ example: 123, someString: 'abc' });

    // $ExpectType ParseObject<ObjectAttributes>
    objTyped.set('example', true);

    // $ExpectError
    objTyped.set({ example: 100 });

    // $ExpectError
    objTyped.set({ other: 'something' });

    // $ExpectError
    objTyped.set('example', 100);

    // $ExpectError
    objTyped.set('other', 100);

    // $ExpectError
    objTyped.set({ example: undefined });

    // $ExpectType ParseObject<ObjectAttributes>
    objTyped.set({}); // Should this error?

    // $ExpectType ParseObject<ObjectAttributes>
    objTyped.set('example', undefined); // Should this error?

    // $ExpectType ParseObject<OptionalObjectAttributes>
    objTypedOptional.set({ example: undefined });

    // $ExpectType ParseObject<OptionalObjectAttributes>
    objTypedOptional.set('example', undefined);

    // $ExpectType ParseObject<OptionalObjectAttributes>
    objTypedOptional.set({});
  }

  interface AttributesAllTypes {
    someString: string;
    someNumber: number;
    someBoolean: boolean;
    someDate: Date;
    someJSONObject: AttributesAllTypes;
    someJSONArray: AttributesAllTypes[];
    someRegExp: RegExp;
    someUndefined: undefined;
    someNull: null;
    someParseObjectUntyped: Parse.Object;
    someParseObjectTyped: Parse.Object<AttributesAllTypes>;
    someParseACL: Parse.ACL;
    someParseGeoPoint: Parse.GeoPoint;
    someParsePolygon: Parse.Polygon;
    someParseRelation: Parse.Relation;
    someParseFile: Parse.File;
  }

  function testToJSON(objUntyped: Parse.Object, objTyped: Parse.Object<AttributesAllTypes>) {
    // $ExpectType ToJSON<Attributes> & JSONBaseAttributes
    const JSONUntyped = objUntyped.toJSON();
    // $ExpectType string
    JSONUntyped.objectId;
    // $ExpectType string
    JSONUntyped.createdAt;
    // $ExpectType string
    JSONUntyped.updatedAt;
    // $ExpectType any
    JSONUntyped.anything;

    // $ExpectType ToJSON<AttributesAllTypes> & JSONBaseAttributes
    const JSONTyped = objTyped.toJSON();
    // $ExpectType string
    JSONTyped.objectId;
    // $ExpectType string
    JSONTyped.createdAt;
    // $ExpectType string
    JSONTyped.updatedAt;
    // $ExpectType string
    JSONTyped.someString;
    // $ExpectType number
    JSONTyped.someNumber;
    // $ExpectType boolean
    JSONTyped.someBoolean;
    // $ExpectType { __type: "Date"; iso: string; }
    JSONTyped.someDate;
    // $ExpectType ToJSON<AttributesAllTypes>
    JSONTyped.someJSONObject;
    // $ExpectType ToJSON<AttributesAllTypes>[]
    JSONTyped.someJSONArray;
    // $ExpectType string
    JSONTyped.someRegExp;
    // $ExpectType undefined
    JSONTyped.someUndefined;
    // $ExpectType null
    JSONTyped.someNull;
    // $ExpectType Pointer | (ToJSON<Attributes> & JSONBaseAttributes)
    JSONTyped.someParseObjectUntyped;
    // $ExpectType Pointer | (ToJSON<AttributesAllTypes> & JSONBaseAttributes)
    JSONTyped.someParseObjectTyped;
    // $ExpectType ByIdMap
    JSONTyped.someParseACL;
    // $ExpectType { __type: string; latitude: number; longitude: number; }
    JSONTyped.someParseGeoPoint;
    // $ExpectType { __type: string; coordinates: Coordinates; }
    JSONTyped.someParsePolygon;
    // $ExpectType { __type: "Relation"; className: string | null; }
    JSONTyped.someParseRelation;
    // $ExpectType { __type: "File"; name?: string | undefined; url?: string | undefined; }
    JSONTyped.someParseFile;
  }

  function testUnset(objUntyped: Parse.Object, objTyped: Parse.Object<{ example: string }>) {
    // $ExpectType ParseObject<Attributes>
    objUntyped.unset('whatever');

    // $ExpectType ParseObject<{ example: string; }>
    objTyped.unset('example');

    // $ExpectError
    objTyped.unset('other');
  }

  function testValidate(obj: Parse.Object) {
    // Note: The attributes being validated don't necessarily have to match the current object's attributes

    // $ExpectType ParseError | boolean
    obj.validate({ someAttrToValidate: 'hello' });
  }

  function testNullableArrays(objTyped: Parse.Object<{ stringList?: string[] | null }>) {
    // $ExpectType ParseObject<{ stringList?: string[] | null | undefined; }>
    objTyped.add('stringList', 'foo');

    // $ExpectError
    objTyped.add('stringList', 4);

    // $ExpectType ParseObject<{ stringList?: string[] | null | undefined; }>
    objTyped.addAll('stringList', ['foo']);

    // $ExpectError
    objTyped.addAll('stringList', [4]);

    // $ExpectType ParseObject<{ stringList?: string[] | null | undefined; }>
    objTyped.addAllUnique('stringList', ['foo', 'bar']);

    // $ExpectError
    objTyped.addAllUnique('stringList', [4]);

    // $ExpectType ParseObject<{ stringList?: string[] | null | undefined; }>
    objTyped.addUnique('stringList', 'foo');

    // $ExpectError
    objTyped.addUnique('stringList', 4);

    // $ExpectType ParseObject<{ stringList?: string[] | null | undefined; }>
    objTyped.remove('stringList', 'bar');

    // $ExpectError
    objTyped.remove('stringList', 4);

    // $ExpectType ParseObject<{ stringList?: string[] | null | undefined; }>
    objTyped.removeAll('stringList', ['bar']);

    // $ExpectError
    objTyped.removeAll('stringList', [4]);
  }
}

function testInstallation() {
  function testConstructor() {
    // $ExpectType ParseInstallation<Attributes>
    new Parse.Installation();

    // $ExpectType ParseInstallation<{ example: number; }>
    new Parse.Installation({ example: 100 });

    // $ExpectType ParseInstallation<{ example: number; }>
    new Parse.Installation<{ example: number }>();

    // $ExpectType ParseInstallation<{ example: number; }>
    new Parse.Installation<{ example: number }>({ example: 100 });

    // $ExpectError
    new Parse.Installation<{ example: number }>({ example: 'hello' });
  }
}

function testQuery() {
  function testConstructor() {
    // $ExpectType ParseQuery<ParseObject<Attributes>>
    new Parse.Query('TestObject');

    // $ExpectType ParseQuery<ParseRole<Attributes>>
    new Parse.Query(Parse.Role);

    // $ExpectType ParseQuery<ParseUser<Attributes>>
    new Parse.Query(Parse.User);

    // $ExpectType ParseQuery<ParseObject<{ example: string; }>>
    new Parse.Query<Parse.Object<{ example: string }>>('TestObject');

    // $ExpectType ParseQuery<ParseRole<{ name: string; }>>
    new Parse.Query<Parse.Role<{ name: string }>>(Parse.Role);

    // $ExpectType ParseQuery<ParseUser<{ example: string; }>>
    new Parse.Query<Parse.User<{ example: string }>>(Parse.User);
  }

  function testQueryMethodTypes() {
    class AnotherSubClass extends Parse.Object<{ x: any }> {
      constructor() {
        super('Another', { x: 'example' });
      }
    }
    class MySubClass extends Parse.Object<{
      attribute1: string;
      attribute2: number;
      attribute3: AnotherSubClass;
      attribute4: string[];
    }> {}
    const query = new Parse.Query(MySubClass);

    // $ExpectType ParseQuery<MySubClass>
    query.addAscending(['attribute1', 'attribute2', 'updatedAt']);

    // $ExpectType ParseQuery<MySubClass>
    query.addAscending('attribute1', 'attribute2', 'updatedAt');

    // $ExpectError
    query.addAscending(['attribute1', 'unexistenProp']);

    // $ExpectType ParseQuery<MySubClass>
    query.addDescending(['attribute1', 'attribute2', 'createdAt']);
    // $ExpectError
    query.addDescending(['attribute1', 'unexistenProp']);

    // $ExpectType ParseQuery<MySubClass>
    query.ascending(['attribute1', 'attribute2', 'objectId']);
    // $ExpectError
    query.ascending(['attribute1', 'nonexistentProp']);

    // $ExpectType ParseQuery<MySubClass>
    query.containedBy('attribute1', ['a', 'b', 'c']);
    // $ExpectType ParseQuery<MySubClass>
    query.containedBy('attribute3', ['objectId1', 'objectId2', 'objectId3']);
    // $ExpectError
    query.containedBy('attribute2', ['a', 'b', 'c']);
    // $ExpectError
    query.containedBy('attribute1', [1, 2, 3]);
    // $ExpectError
    query.containedBy('nonexistentProp', ['a', 'b', 'c']);

    // $ExpectType ParseQuery<MySubClass>
    query.containedIn('attribute1', ['a', 'b', 'c']);
    // $ExpectType ParseQuery<MySubClass>
    query.containedIn('attribute3', ['objectId1', 'objectId2', 'objectId3']);
    // $ExpectError
    query.containedIn('attribute2', ['a', 'b', 'c']);
    // $ExpectError
    query.containedIn('attribute1', [1, 2, 3]);
    // $ExpectError
    query.containedIn('nonexistentProp', ['a', 'b', 'c']);

    // $ExpectType ParseQuery<MySubClass>
    query.contains('attribute1', 'a substring');
    // $ExpectError
    query.contains('nonexistentProp', 'a substring');

    // $ExpectType ParseQuery<MySubClass>
    query.containsAll('attribute1', ['a', 'b', 'c']);
    // $ExpectError
    query.containsAll('nonexistentProp', ['a', 'b', 'c']);

    // $ExpectType ParseQuery<MySubClass>
    query.containsAllStartingWith('attribute1', ['a', 'b', 'c']);
    // $ExpectError
    query.containsAllStartingWith('nonexistentProp', ['a', 'b', 'c']);

    // $ExpectType ParseQuery<MySubClass>
    query.descending(['attribute1', 'attribute2', 'objectId']);
    // $ExpectError
    query.descending(['attribute1', 'nonexistentProp']);

    // $ExpectType ParseQuery<MySubClass>
    query.doesNotExist('attribute1');
    // $ExpectError
    query.doesNotExist('nonexistentProp');

    // $ExpectType ParseQuery<MySubClass>
    query.doesNotMatchKeyInQuery('attribute1', 'x', new Parse.Query(AnotherSubClass));
    // $ExpectError
    query.doesNotMatchKeyInQuery('unexistenProp', 'x', new Parse.Query(AnotherSubClass));
    // $ExpectError
    query.doesNotMatchKeyInQuery('attribute1', 'unknownKey', new Parse.Query(AnotherSubClass));
    // $ExpectType ParseQuery<MySubClass>
    query.doesNotMatchKeyInQuery('objectId', 'x', new Parse.Query(AnotherSubClass));
    // $ExpectType ParseQuery<MySubClass>
    query.doesNotMatchKeyInQuery('updatedAt', 'x', new Parse.Query(AnotherSubClass));

    // $ExpectType ParseQuery<MySubClass>
    query.doesNotMatchQuery('attribute1', new Parse.Query('Example'));
    // $ExpectError
    query.doesNotMatchQuery('nonexistentProp', new Parse.Query('Example'));

    // $ExpectType ParseQuery<MySubClass>
    query.endsWith('attribute1', 'asuffixstring');
    // $ExpectError
    query.endsWith('nonexistentProp', 'asuffixstring');

    // $ExpectType ParseQuery<MySubClass>
    query.equalTo('attribute2', 0);
    // $ExpectType ParseQuery<MySubClass>
    query.equalTo('attribute3', new AnotherSubClass());
    // $ExpectType ParseQuery<MySubClass>
    query.equalTo('attribute3', new AnotherSubClass().toPointer());
    // $ExpectError
    query.equalTo('attribute1', new AnotherSubClass().toPointer());
    // $ExpectError
    query.equalTo('attribute2', 'a string value');
    // $ExpectError
    query.equalTo('nonexistentProp', 'any value');

    // $ExpectType ParseQuery<MySubClass>
    query.equalTo('attribute4', 'a_string_value'); // Can query contents of array
    // Can query array itself if equal too (mongodb $eq matches the array exactly or the <field> contains an element that matches the array exactly)
    // $ExpectType ParseQuery<MySubClass>
    query.equalTo('attribute4', ['a_string_value']);

    // $ExpectType ParseQuery<MySubClass>
    query.notEqualTo('attribute4', 'a_string_value');
    // $ExpectType ParseQuery<MySubClass>
    query.notEqualTo('attribute4', ['a_string_value']);

    // $ExpectError
    query.equalTo('attribute4', 5);
    // $ExpectError
    query.notEqualTo('attribute4', 5);
    // $ExpectError
    query.equalTo('attribute4', [5]);
    // $ExpectError
    query.notEqualTo('attribute4', [5]);

    // $ExpectType ParseQuery<MySubClass>
    query.exists('attribute1');
    // $ExpectError
    query.exists('nonexistentProp');

    // $ExpectType ParseQuery<MySubClass>
    query.fullText('attribute1', 'full text');
    // $ExpectError
    query.fullText('nonexistentProp', 'full text');

    // $ExpectType ParseQuery<MySubClass>
    query.greaterThan('attribute2', 1000);
    // $ExpectError
    query.greaterThan('attribute2', '1000');
    // $ExpectError
    query.greaterThan('nonexistentProp', 1000);

    // $ExpectType ParseQuery<MySubClass>
    query.greaterThanOrEqualTo('attribute2', 1000);
    // $ExpectError
    query.greaterThanOrEqualTo('attribute2', '1000');
    // $ExpectError
    query.greaterThanOrEqualTo('nonexistentProp', 1000);

    // $ExpectType ParseQuery<MySubClass>
    query.include(['attribute1', 'attribute2']);
    // $ExpectType ParseQuery<MySubClass>
    query.include('attribute1', 'attribute2');
    // $ExpectType ParseQuery<MySubClass>
    query.include<any>('attribute3.someProp');
    // $ExpectError
    query.include(['attribute1', 'nonexistentProp']);

    // $ExpectType ParseQuery<MySubClass>
    query.exclude('attribute1', 'attribute2');
    // $ExpectType ParseQuery<MySubClass>
    query.exclude(['attribute1', 'attribute2']);
    // $ExpectError
    query.exclude('attribute1', 'nonexistentProp');

    // $ExpectType ParseQuery<MySubClass>
    query.lessThan('attribute2', 1000);
    // $ExpectError
    query.lessThan('attribute2', '1000');
    // $ExpectError
    query.lessThan('nonexistentProp', 1000);

    // $ExpectType ParseQuery<MySubClass>
    query.lessThanOrEqualTo('attribute2', 1000);
    // $ExpectError
    query.lessThanOrEqualTo('attribute2', '1000');
    // $ExpectError
    query.lessThanOrEqualTo('nonexistentProp', 1000);

    // $ExpectType ParseQuery<MySubClass>
    query.matches('attribute1', /a regex/);
    // $ExpectError
    query.matches('nonexistentProp', /a regex/);

    // $ExpectType ParseQuery<MySubClass>
    query.matchesKeyInQuery('attribute1', 'x', new Parse.Query(AnotherSubClass));
    // $ExpectError
    query.matchesKeyInQuery('nonexistentProp', 'x', new Parse.Query(AnotherSubClass));
    // $ExpectError
    query.matchesKeyInQuery('attribute1', 'unknownKey', new Parse.Query(AnotherSubClass));

    // $ExpectType ParseQuery<MySubClass>
    query.matchesQuery('attribute1', new Parse.Query('Example'));
    // $ExpectError
    query.matchesQuery('nonexistentProp', new Parse.Query('Example'));

    // $ExpectType ParseQuery<MySubClass>
    query.near('attribute1', new Parse.GeoPoint());
    // $ExpectError
    query.near('nonexistentProp', new Parse.GeoPoint());

    // $ExpectType ParseQuery<MySubClass>
    query.notContainedIn('attribute2', [1, 2, 3]);
    // $ExpectError
    query.notContainedIn('attribute2', ['1', '2', '3']);
    // $ExpectError
    query.notContainedIn('nonexistentProp', [1, 2, 3]);

    // $ExpectType ParseQuery<MySubClass>
    query.notEqualTo('attribute1', '1');
    // $ExpectError
    query.notEqualTo('attribute1', 1);
    // $ExpectError
    query.notEqualTo('nonexistentProp', 1);

    // $ExpectType ParseQuery<MySubClass>
    query.polygonContains('attribute1', new Parse.GeoPoint());
    // $ExpectError
    query.polygonContains('nonexistentProp', new Parse.GeoPoint());

    // $ExpectType ParseQuery<MySubClass>
    query.select('attribute1', 'attribute2');
    // $ExpectType ParseQuery<MySubClass>
    query.select(['attribute1', 'attribute2']);
    // $ExpectError
    query.select('attribute1', 'nonexistentProp');

    // $ExpectType ParseQuery<MySubClass>
    query.startsWith('attribute1', 'prefix string');
    // $ExpectError
    query.startsWith('nonexistentProp', 'prefix string');

    // $ExpectType ParseQuery<MySubClass>
    query.watch('attribute1', 'attribute2');
    // $ExpectType ParseQuery<MySubClass>
    query.watch(['attribute1', 'attribute2']);
    // $ExpectError
    query.watch('attribute1', 'nonexistentProp');

    // $ExpectType ParseQuery<MySubClass>
    query.withCount(true);

    // $ExpectType ParseQuery<MySubClass>
    query.withinGeoBox('attribute1', new Parse.GeoPoint(), new Parse.GeoPoint());
    // $ExpectError
    query.withinGeoBox('nonexistentProp', new Parse.GeoPoint(), new Parse.GeoPoint());

    // $ExpectType ParseQuery<MySubClass>
    query.withinKilometers('attribute1', new Parse.GeoPoint(), 100);
    // $ExpectError
    query.withinKilometers('nonexistentProp', new Parse.GeoPoint(), 100);

    // $ExpectType ParseQuery<MySubClass>
    query.withinMiles('attribute1', new Parse.GeoPoint(), 100);
    // $ExpectError
    query.withinMiles('nonexistentProp', new Parse.GeoPoint(), 100);

    // $ExpectType ParseQuery<MySubClass>
    query.withinPolygon('attribute1', [
      [12.3, 45.6],
      [-78.9, 10.1],
    ]);
    // $ExpectError
    query.withinPolygon('nonexistentProp', [
      [12.3, 45.6],
      [-78.9, 10.1],
    ]);

    // $ExpectType ParseQuery<MySubClass>
    query.withinRadians('attribute1', new Parse.GeoPoint(), 100);
    // $ExpectError
    query.withinRadians('nonexistentProp', new Parse.GeoPoint(), 100);
  }

  async function testQueryMethods(
    queryUntyped: Parse.Query,
    queryTyped: Parse.Query<Parse.Object<{ example: string }>>
  ) {
    // $ExpectType ParseObject<Attributes>
    await queryUntyped.get('objectId');

    // $ExpectType ParseObject<Attributes>[]
    await queryUntyped.find();

    // $ExpectType string[]
    await queryTyped.distinct('example');

    // $ExpectType ParseObject<Attributes> | undefined
    await queryUntyped.first();

    // $ExpectType ParseObject<{ example: string; }>
    await queryTyped.get('objectId');

    // $ExpectType ParseObject<{ example: string; }>[]
    await queryTyped.find();

    // $ExpectType ParseObject<{ example: string; }> | undefined
    await queryTyped.first();
  }
}

function testRole() {
  function testConstructor(acl: Parse.ACL) {
    // $ExpectType ParseRole<{ example: string; }>
    new Parse.Role<{ example: string }>('TestRole', acl);
  }

  function testAttributes(roleUntyped: Parse.Role, roleTyped: Parse.Role<{ example: number }>) {
    // $ExpectType Attributes
    roleUntyped.attributes;

    // $ExpectType { example: number; }
    roleTyped.attributes;
  }
}

function testSession() {
  async function testConstructor() {
    // $ExpectType ParseSession<Attributes>
    const session = new Parse.Session();

    // $ExpectType ParseSession<{ example: number; }>
    new Parse.Session({ example: 100 });

    // $ExpectType ParseSession<{ example: number; }>
    new Parse.Session<{ example: number }>();

    // $ExpectType ParseSession<{ example: number; }>
    new Parse.Session<{ example: number }>({ example: 100 });

    // $ExpectError
    new Parse.Session<{ example: number }>({ example: 'hello' });

    // $ExpectType boolean
    Parse.Session.isCurrentSessionRevocable();

    // $ExpectType string[]
    Parse.Session.readOnlyAttributes();

    // $ExpectType string
    session.getSessionToken();

    // $ExpectType ParseSession<Attributes>
    await Parse.Session.current();

    // $ExpectType ParseSession<{ example: string; }>
    await Parse.Session.current<Parse.Session<{ example: string }>>();
  }
}

function testUser() {
  function testConstructor() {
    // $ExpectType ParseUser<Attributes>
    new Parse.User();

    // $ExpectType ParseUser<{ example: number; }>
    new Parse.User({ example: 100 });

    // $ExpectType ParseUser<{ example: number; }>
    new Parse.User<{ example: number }>();

    // $ExpectType ParseUser<{ example: number; }>
    new Parse.User<{ example: number }>({ example: 100 });

    // $ExpectError
    new Parse.User<{ example: number }>({ example: 'hello' });
  }

  async function testStatic() {
    const user = new Parse.User<{ field: 'hello' }>();

    // $ExpectType ParseUser<{ field: "hello"; }> | null
    Parse.User.current<Parse.User<{ field: 'hello' }>>();

    // $ExpectType ParseUser<{ field: "hello"; }> | null
    await Parse.User.currentAsync<Parse.User<{ field: 'hello' }>>();

    // $ExpectType ParseUser<{ field: "hello"; }>
    await Parse.User.signUp<Parse.User<{ field: 'hello' }>>('username', 'password', {});

    // $ExpectType ParseUser<{ field: "hello"; }>
    await Parse.User.become<Parse.User<{ field: 'hello' }>>('session-token');

    // $ExpectType ParseUser<{ field: "hello"; }>
    await Parse.User.logIn<Parse.User<{ field: 'hello' }>>('username', 'password');

    // $ExpectType ParseUser<{ field: "hello"; }>
    await Parse.User.logInWith<Parse.User<{ field: 'hello' }>>('provider', {});

    // $ExpectType ParseUser<{ field: "hello"; }>
    await Parse.User.logInWithAdditionalAuth<Parse.User<{ field: 'hello' }>>(
      'username',
      'password',
      {}
    );

    // $ExpectType ParseUser<{ field: "hello"; }>
    await Parse.User.loginAs<Parse.User<{ field: 'hello' }>>(user.id!);

    // $ExpectType ParseUser<{ field: "hello"; }>
    await Parse.User.verifyPassword<Parse.User<{ field: 'hello' }>>('username', 'password');

    // $ExpectType ParseUser<{ field: "hello"; }>
    await Parse.User.hydrate<Parse.User<{ field: 'hello' }>>(user);

    // $ExpectType ParseUser<{ field: "hello"; }>
    await Parse.User.me<Parse.User<{ field: 'hello' }>>('session-token');
  }

  async function testAuthenticationProvider() {
    const authProvider: Parse.AuthProvider = {
      authenticate: () => {},
      getAuthType: () => 'customAuthorizationProvider',
      restoreAuthentication: () => false,
      deauthenticate: () => {},
    };
    const authData: Parse.AuthData = {
      id: 'some-user-authentication-id',
      access_token: 'some-access-token',
      expiration_date: new Date().toISOString(),
    };
    Parse.User._registerAuthenticationProvider(authProvider);

    const user = await Parse.User.logInWith(
      authProvider,
      { authData },
      { sessionToken: 'some-session-token', useMasterKey: true }
    );
    const isLinked = user._isLinked(authProvider);
    const unlinkedUser = await user._unlinkFrom(authProvider);
    const linkedUser = await user.linkWith(authProvider, { authData });
  }
}

function testEncryptingUser() {
  function testSecretKey() {
    Parse.secret = 'secret!';
  }

  function testEnableEncryptedUserKey() {
    Parse.encryptedUser = true;
  }

  function testEnablingEncryptedUser() {
    Parse.enableEncryptedUser();
  }

  function testIsEncryptedUserEnabled() {
    Parse.isEncryptedUserEnabled();
  }
}

function testEventuallyQueue() {
  async function test() {
    const obj = new Parse.Object('TestObject');
    // $ExpectType void
    await Parse.EventuallyQueue.clear();
    // $ExpectType Queue
    await Parse.EventuallyQueue.getQueue();
    // $ExpectType boolean
    Parse.EventuallyQueue.isPolling();
    // $ExpectType void
    await Parse.EventuallyQueue.save(obj);
    // $ExpectType void
    await Parse.EventuallyQueue.save(obj, {});
    // $ExpectType void
    await Parse.EventuallyQueue.destroy(obj);
    // $ExpectType void
    await Parse.EventuallyQueue.destroy(obj, {});
    // $ExpectType number
    await Parse.EventuallyQueue.length();
    // $ExpectType boolean
    await Parse.EventuallyQueue.sendQueue();
    // $ExpectType void
    Parse.EventuallyQueue.stopPoll();
    // $ExpectType void
    Parse.EventuallyQueue.poll();
    // $ExpectType void
    Parse.EventuallyQueue.poll(300);
    // $ExpectError
    Parse.EventuallyQueue.poll('300');
  }
}

function LiveQueryEvents() {
  function testLiveQueryEvents() {
    Parse.LiveQuery.on('open', () => {});
    Parse.LiveQuery.on('close', () => {});
    Parse.LiveQuery.on('error', (error: any) => {});
  }
}
