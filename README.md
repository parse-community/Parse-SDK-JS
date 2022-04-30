![parse-repository-header-sdk-dart](https://user-images.githubusercontent.com/5673677/166120960-ea1f58e3-a62b-4770-b541-f64186859339.png)

---

A library that gives you access to the powerful Parse Server backend from your Dart app. For more information on Parse Platform and its features, visit [parseplatform.org](https://parseplatform.org). The Flutter package was moved [here](https://pub.dev/packages/parse_server_sdk_flutter). If you are using Flutter see [this guide](https://github.com/parse-community/Parse-SDK-Flutter/blob/release/2.0.0/docs/migrate-2-0-0.md) for how to migrate.

---

- [Getting Started](#getting-started)
    - [Early Web support](#early-web-support)
- [Objects](#objects)
- [Custom Objects](#custom-objects)
- [Add new values to objects](#add-new-values-to-objects)
- [Save objects using pins](#save-objects-using-pins)
- [Storage](#storage)
- [Increment Counter values in objects](#increment-counter-values-in-objects)
- [Array Operator in objects](#array-operator-in-objects)
- [Queries](#queries)
  - [Alternative query methods](#alternative-query-methods)
- [Complex queries](#complex-queries)
- [Relational queries](#relational-queries)
- [Counting Objects](#counting-objects)
- [Live Queries](#live-queries)
- [ParseLiveList](#parselivelist)
  - [General Use](#general-use)
  - [included Sub-Objects](#included-sub-objects)
- [Users](#users)
- [Facebook, OAuth and 3rd Party Login/User](#facebook-oauth-and-3rd-party-loginuser)
- [Security for Objects - ParseACL](#security-for-objects---parseacl)
- [Config](#config)
- [Cloud Functions](#cloud-functions)
- [Relation](#relation)
- [File](#file)
- [Other Features](#other-features)

## Getting Started

To install, either add [dependency in your pubspec.yaml file](https://pub.dev/packages/parse_server_sdk/install).

Once you have the library added to your project, upon first call to your app (Similar to what your application class would be) add the following...

```dart
await Parse().initialize(
        keyApplicationId,
        keyParseServerUrl,
        );
```

If you want to use secure storage or use the Flutter web/desktop SDK, please change to the below instance of CoreStorage as it has no dependencies on Flutter.

**The `CoreStoreSembastImp` does not encrypt the data on web!** (Web is not safe anyway. Encrypt fields manually as needed.)
```dart

await Parse().initialize(
  	keyParseApplicationId, 
  	keyParseServerUrl,
    coreStore: await CoreStoreSembastImp.getInstance("/data"));
```
It's possible to add other parameters to work with your instance of Parse Server:-

```dart
  await Parse().initialize(
        keyApplicationId,
        keyParseServerUrl,
        clientKey: keyParseClientKey, // Required for some setups
        debug: true, // When enabled, prints logs to console
        liveQueryUrl: keyLiveQueryUrl, // Required if using LiveQuery 
        autoSendSessionId: true, // Required for authentication and ACL
        securityContext: securityContext, // Again, required for some setups
	coreStore: CoreStoreMemoryImp()); // Non persistent mode (default): Sdk will store everything in memmore instead of using Sembast as an internal DB.
```
⚠️ Please note that the master key should only be used in safe environments and never on client side ‼️ Using this package on a server should be fine.

#### Early Web support
Currently this requires adding `X-Parse-Installation-Id` as an allowed header to parse-server.
When running directly via docker, set the env var `PARSE_SERVER_ALLOW_HEADERS=X-Parse-Installation-Id`.
When running via express, set [ParseServerOptions](https://parseplatform.org/parse-server/api/master/ParseServerOptions.html) `allowHeaders: ['X-Parse-Installation-Id']`.

Be aware that for web ParseInstallation does include app name, version or package identifier.

## Objects
You can create custom objects by calling:
```dart
var dietPlan = ParseObject('DietPlan')
	..set('Name', 'Ketogenic')
	..set('Fat', 65);
await dietPlan.save();
```
Or update existing object by its objectId by calling:
```dart
var dietPlan = ParseObject('DietPlan')
	..objectId = 'R5EonpUDWy'
	..set('Fat', 70);
await dietPlan.save();
```
Verify that the object has been successfully saved using
```dart
var response = await dietPlan.save();
if (response.success) {
   dietPlan = response.results.first;
}
```
Types supported:
 * String
 * Double
 * Int
 * Boolean
 * DateTime
 * File
 * Geopoint
 * ParseObject/ParseUser (Pointer)
 * Map
 * List (all types supported)

You then have the ability to do the following with that object:
The features available are:-
 * Get
 * GetAll
 * Create
 * Save
 * Query - By object Id
 * Delete
 * Complex queries as shown above
 * Pin
 * Plenty more
 * Counters
 * Array Operators

## Custom Objects
You can create your own `ParseObjects` or convert your existing objects into Parse Objects by doing the following:

```dart
class DietPlan extends ParseObject implements ParseCloneable {

  DietPlan() : super(_keyTableName);
  DietPlan.clone(): this();

  /// Looks strangely hacky but due to Flutter not using reflection, we have to
  /// mimic a clone
  @override clone(Map map) => DietPlan.clone()..fromJson(map);

  static const String _keyTableName = 'Diet_Plans';
  static const String keyName = 'Name';
  
  String get name => get<String>(keyName);
  set name(String name) => set<String>(keyName, name);
}
  
```

When receiving an `ParseObject` from the SDK, you can often provide an instance of your custom object as an copy object.
To always use your custom object class, you can register your subclass at the initialization of the SDK.
```dart
Parse().initialize(
   ...,
   registeredSubClassMap: <String, ParseObjectConstructor>{
     'Diet_Plans': () => DietPlan(),
   },
   parseUserConstructor: (username, password, emailAddress, {client, debug, sessionToken}) => CustomParseUser(username, password, emailAddress),
);
```
Additionally you can register `SubClasses` after the initialization of the SDK.
```dart
ParseCoreData().registerSubClass('Diet_Plans', () => DietPlan());
ParseCoreData().registerUserSubClass((username, password, emailAddress, {client, debug, sessionToken}) => CustomParseUser(username, password, emailAddress));
```
Providing a `ParseObject` as described above should still work, even if you have registered a different `SubClass`.

For custom file classes have a lock at [here](#File).

## Add new values to objects
To add a variable to an object call and retrieve it, call

```dart
dietPlan.set<int>('RandomInt', 8);
var randomInt = dietPlan.get<int>('RandomInt');
```

## Save objects using pins
You can now save an object by calling `.pin()` on an instance of an object

```dart
dietPlan.pin();
```

and to retrieve it

```dart
var dietPlan = DietPlan().fromPin('OBJECT ID OF OBJECT');
```

## Storage
We now have 2 types of storage, secure and unsecure. We currently rely on 2 third party options:

- SharedPreferences
- Sembast
Sembast offers secured storage, whilst SharePreferences wraps NSUserDefaults (on iOS) and SharedPreferences (on Android).

The storage method is defined in the parameter __coreStore__ in  Parse().initialize

Check sample code for options

## Increment Counter values in objects
Retrieve it, call

```dart
var response = await dietPlan.increment("count", 1);

```
or using with save function

```dart
dietPlan.setIncrement('count', 1);
dietPlan.setDecrement('count', 1);
var response = dietPlan.save()

```

## Array Operator in objects
Retrieve it, call

```dart
var response = await dietPlan.add("listKeywords", ["a", "a","d"]);

var response = await dietPlan.addUnique("listKeywords", ["a", "a","d"]);

var response = await dietPlan.remove("listKeywords", ["a"]);

```
or using with save function

```dart
dietPlan.setAdd('listKeywords', ['a','a','d']);
dietPlan.setAddUnique('listKeywords', ['a','a','d']);
dietPlan.setRemove('listKeywords', ['a']);
var response = dietPlan.save()
```

## Queries
Once you have setup the project and initialised the instance, you can then retreive data from your server by calling:
```dart
var apiResponse = await ParseObject('ParseTableName').getAll();

if (apiResponse.success){
  for (var testObject in apiResponse.result) {
    print(ApplicationConstants.APP_NAME + ": " + testObject.toString());
  }
}
```
Or you can get an object by its objectId:

```dart
var dietPlan = await DietPlan().getObject('R5EonpUDWy');

if (dietPlan.success) {
  print(ApplicationConstants.keyAppName + ": " + (dietPlan.result as DietPlan).toString());
} else {
  print(ApplicationConstants.keyAppName + ": " + dietPlan.exception.message);
}
```

### Alternative query methods

The standard query method `query()` returns a `ParseResponse` that contains the result or the error. As an alternative, you can also use `Future<List<T>> find()` for receiving options.
This method returns an `Future` that either resolves in an error (equivalent of the error in the `ParseResponse`) or an `List` containing the queried objects. One difference, you should be aware of, is the fact, that `Future<List<T>> find()` will return an empty list instead of the 'No results' error you receive in case no object matches you query.

Choosing between `query()` and `find()` comes down to personal preference. Both methods can be used for querying a `ParseQuery`, just the output method differs.

Similar to `find()` the `QueryBuilder` also has a function called `Future<T>? first()`. Just like `find()` `first()` is just a convenience method that makes querying the first object satisfying the query simpler. `first()` returns an `Future`, that resoles in an error or the first object matching the query. In case no object satisfies the query, the result will be `null`.

## Complex queries
You can create complex queries to really put your database to the test:

```dart
var queryBuilder = QueryBuilder<DietPlan>(DietPlan())
  ..startsWith(DietPlan.keyName, "Keto")
  ..greaterThan(DietPlan.keyFat, 64)
  ..lessThan(DietPlan.keyFat, 66)
  ..equals(DietPlan.keyCarbs, 5);

var response = await queryBuilder.query();

if (response.success) {
  print(ApplicationConstants.keyAppName + ": " + ((response.results as List<dynamic>).first as DietPlan).toString());
} else {
  print(ApplicationConstants.keyAppName + ": " + response.exception.message);
}
```

if you want to find objects that match one of several queries, you can use __QueryBuilder.or__ method to construct a query that is an OR of the queries passed in. For instance if you want to find players who either have a lot of wins or a few wins, you can do:
```dart
ParseObject playerObject = ParseObject("Player");

QueryBuilder<ParseObject> lotsOfWins =
    QueryBuilder<ParseObject>(playerObject))
      ..whereGreaterThan('wins', 50);

QueryBuilder<ParseObject> fewWins =
    QueryBuilder<ParseObject>(playerObject)
      ..whereLessThan('wins', 5);

QueryBuilder<ParseObject> mainQuery = QueryBuilder.or(
      playerObject,
      [lotsOfWins, fewWins],
    );

var apiResponse = await mainQuery.query();
```

The features available are:-
 * Equals
 * Contains
 * LessThan
 * LessThanOrEqualTo
 * GreaterThan
 * GreaterThanOrEqualTo
 * NotEqualTo
 * StartsWith
 * EndsWith
 * Exists
 * Near
 * WithinMiles
 * WithinKilometers
 * WithinRadians
 * WithinGeoBox
 * WithinPolygon
 * MatchesQuery
 * DoesNotMatchQuery
 * MatchesKeyInQuery
 * DoesNotMatchKeyInQuery
 * Regex
 * Order
 * Limit
 * Skip
 * Ascending
 * Descending
 * Plenty more!

## Relational queries
If you want to retrieve objects where a field contains an object that matches another query, you can use the
__whereMatchesQuery__ condition.
For example, imagine you have Post class and a Comment class, where each Comment has a pointer to its parent Post.
You can find comments on posts with images by doing:

```dart
QueryBuilder<ParseObject> queryPost =
    QueryBuilder<ParseObject>(ParseObject('Post'))
      ..whereValueExists('image', true);

QueryBuilder<ParseObject> queryComment =
    QueryBuilder<ParseObject>(ParseObject('Comment'))
      ..whereMatchesQuery('post', queryPost);

var apiResponse = await queryComment.query();
```

If you want to retrieve objects where a field contains an object that does not match another query,  you can use the
__whereDoesNotMatchQuery__ condition.
Imagine you have Post class and a Comment class, where each Comment has a pointer to its parent Post.
You can find comments on posts without images by doing:

```dart
QueryBuilder<ParseObject> queryPost =
    QueryBuilder<ParseObject>(ParseObject('Post'))
      ..whereValueExists('image', true);

QueryBuilder<ParseObject> queryComment =
    QueryBuilder<ParseObject>(ParseObject('Comment'))
      ..whereDoesNotMatchQuery('post', queryPost);

var apiResponse = await queryComment.query();
```

You can use the __whereMatchesKeyInQuery__ method to get objects where a key matches the value of a key in a set of objects resulting from another query. For example, if you have a class containing sports teams and you store a user’s hometown in the user class, you can issue one query to find the list of users whose hometown teams have winning records. The query would look like::

```dart
QueryBuilder<ParseObject> teamQuery =
    QueryBuilder<ParseObject>(ParseObject('Team'))
      ..whereGreaterThan('winPct', 0.5);

QueryBuilder<ParseUser> userQuery =
    QueryBuilder<ParseUser>ParseUser.forQuery())
      ..whereMatchesKeyInQuery('hometown', 'city', teamQuery);

var apiResponse = await userQuery.query();
```

Conversely, to get objects where a key does not match the value of a key in a set of objects resulting from another query, use __whereDoesNotMatchKeyInQuery__. For example, to find users whose hometown teams have losing records:

```dart
QueryBuilder<ParseObject> teamQuery =
    QueryBuilder<ParseObject>(ParseObject('Team'))
      ..whereGreaterThan('winPct', 0.5);

QueryBuilder<ParseUser> losingUserQuery =
    QueryBuilder<ParseUser>ParseUser.forQuery())
      ..whereDoesNotMatchKeyInQuery('hometown', 'city', teamQuery);

var apiResponse = await losingUserQuery.query();
```

To filter rows based on objectId’s from pointers in a second table, you can use dot notation:
```dart
QueryBuilder<ParseObject> rolesOfTypeX =
    QueryBuilder<ParseObject>(ParseObject('Role'))
      ..whereEqualTo('type', 'x');

QueryBuilder<ParseObject> groupsWithRoleX =
    QueryBuilder<ParseObject>(ParseObject('Group')))
      ..whereMatchesKeyInQuery('objectId', 'belongsTo.objectId', rolesOfTypeX);

var apiResponse = await groupsWithRoleX.query();
```

## Counting Objects
If you only care about the number of games played by a particular player:

```dart
QueryBuilder<ParseObject> queryPlayers =
    QueryBuilder<ParseObject>(ParseObject('GameScore'))
      ..whereEqualTo('playerName', 'Jonathan Walsh');
var apiResponse = await queryPlayers.count();
if (apiResponse.success && apiResponse.result != null) {
  int countGames = apiResponse.count;
}
```

## Live Queries
This tool allows you to subscribe to a QueryBuilder you are interested in. Once subscribed, the server will notify clients
whenever a ParseObject that matches the QueryBuilder is created or updated, in real-time.

Parse LiveQuery contains two parts, the LiveQuery server and the LiveQuery clients. In order to use live queries, you need
to set up both of them.

The Parse Server configuration guide on the server is found here https://docs.parseplatform.org/parse-server/guide/#live-queries and is not part of this documentation.

Initialize the Parse Live Query by entering the parameter liveQueryUrl in Parse().initialize:
```dart
Parse().initialize(
      keyApplicationId,
      keyParseServerUrl,
      clientKey: keyParseClientKey,
      debug: true,
      liveQueryUrl: keyLiveQueryUrl,
      autoSendSessionId: true);
```

Declare LiveQuery:
```dart
final LiveQuery liveQuery = LiveQuery();
```

Set the QueryBuilder that will be monitored by LiveQuery:
```dart
QueryBuilder<ParseObject> query =
  QueryBuilder<ParseObject>(ParseObject('TestAPI'))
  ..whereEqualTo('intNumber', 1);
```
__Create a subscription__
You’ll get the LiveQuery events through this subscription.
The first time you call subscribe, we’ll try to open the WebSocket connection to the LiveQuery server for you.

```dart
Subscription subscription = await liveQuery.client.subscribe(query);
```

__Event Handling__
We define several types of events you’ll get through a subscription object:

__Create event__
When a new ParseObject is created and it fulfills the QueryBuilder you subscribe, you’ll get this event.
The object is the ParseObject which was created.
```dart
subscription.on(LiveQueryEvent.create, (value) {
    print('*** CREATE ***: ${DateTime.now().toString()}\n $value ');
    print((value as ParseObject).objectId);
    print((value as ParseObject).updatedAt);
    print((value as ParseObject).createdAt);
    print((value as ParseObject).get('objectId'));
    print((value as ParseObject).get('updatedAt'));
    print((value as ParseObject).get('createdAt'));
});
```

__Update event__
When an existing ParseObject which fulfills the QueryBuilder you subscribe is updated (The ParseObject fulfills the
QueryBuilder before and after changes), you’ll get this event.
The object is the ParseObject which was updated. Its content is the latest value of the ParseObject.
```dart
subscription.on(LiveQueryEvent.update, (value) {
    print('*** UPDATE ***: ${DateTime.now().toString()}\n $value ');
    print((value as ParseObject).objectId);
    print((value as ParseObject).updatedAt);
    print((value as ParseObject).createdAt);
    print((value as ParseObject).get('objectId'));
    print((value as ParseObject).get('updatedAt'));
    print((value as ParseObject).get('createdAt'));
});
```

__Enter event__
When an existing ParseObject’s old value does not fulfill the QueryBuilder but its new value fulfills the QueryBuilder,
you’ll get this event. The object is the ParseObject which enters the QueryBuilder.
Its content is the latest value of the ParseObject.
```dart
subscription.on(LiveQueryEvent.enter, (value) {
    print('*** ENTER ***: ${DateTime.now().toString()}\n $value ');
    print((value as ParseObject).objectId);
    print((value as ParseObject).updatedAt);
    print((value as ParseObject).createdAt);
    print((value as ParseObject).get('objectId'));
    print((value as ParseObject).get('updatedAt'));
    print((value as ParseObject).get('createdAt'));
});
```

__Leave event__
When an existing ParseObject’s old value fulfills the QueryBuilder but its new value doesn’t fulfill the QueryBuilder,
you’ll get this event. The object is the ParseObject which leaves the QueryBuilder.
Its content is the latest value of the ParseObject.
```dart
subscription.on(LiveQueryEvent.leave, (value) {
    print('*** LEAVE ***: ${DateTime.now().toString()}\n $value ');
    print((value as ParseObject).objectId);
    print((value as ParseObject).updatedAt);
    print((value as ParseObject).createdAt);
    print((value as ParseObject).get('objectId'));
    print((value as ParseObject).get('updatedAt'));
    print((value as ParseObject).get('createdAt'));
});
```

__Delete event__
When an existing ParseObject which fulfills the QueryBuilder is deleted, you’ll get this event.
The object is the ParseObject which is deleted
```dart
subscription.on(LiveQueryEvent.delete, (value) {
    print('*** DELETE ***: ${DateTime.now().toString()}\n $value ');
    print((value as ParseObject).objectId);
    print((value as ParseObject).updatedAt);
    print((value as ParseObject).createdAt);
    print((value as ParseObject).get('objectId'));
    print((value as ParseObject).get('updatedAt'));
    print((value as ParseObject).get('createdAt'));
});
```

__Unsubscribe__
If you would like to stop receiving events from a QueryBuilder, you can just unsubscribe the subscription.
After that, you won’t get any events from the subscription object and will close the WebSocket connection to the
LiveQuery server.

```dart
liveQuery.client.unSubscribe(subscription);
```

__Disconnection__
In case the client's connection to the server breaks,
LiveQuery will automatically try to reconnect.
LiveQuery will wait at increasing intervals between reconnection attempts.
By default, these intervals are set to `[0, 500, 1000, 2000, 5000, 10000]` for mobile and `[0, 500, 1000, 2000, 5000]` for web.
You can change these by providing a custom list using the `liveListRetryIntervals` parameter at `Parse.initialize()` ("-1" means "do not try to reconnect").

## ParseLiveList
ParseLiveList makes implementing a dynamic List as simple as possible.

### General Use
It ships with the ParseLiveList class itself, this class manages all elements of the list, sorts them,
keeps itself up to date and Notifies you on changes.

### included Sub-Objects
By default, ParseLiveQuery will provide you with all the objects you included in your Query like this:
```dart
queryBuilder.includeObject(/*List of all the included sub-objects*/);
```
ParseLiveList will not listen for updates on this objects by default.
To activate listening for updates on all included objects, add `listenOnAllSubItems: true` to your ParseLiveListWidgets constructor.
If you want ParseLiveList to listen for updates on only some sub-objects, use `listeningIncludes: const <String>[/*all the included sub-objects*/]` instead.
Just as QueryBuilder, ParseLiveList supports nested sub-objects too.

**NOTE:** To use this features you have to enable [Live Queries](#live-queries) first.

## Users
You can create and control users just as normal using this SDK.

To register a user, first create one :
```dart
var user =  ParseUser().create("TestFlutter", "TestPassword123", "TestFlutterSDK@gmail.com");
```
Then have the user sign up:

```dart
var response = await user.signUp();
if (response.success) user = response.result;
```
You can also login with the user:
```dart
var response = await user.login();
if (response.success) user = response.result;
```
You can also logout with the user:
```dart
var response = await user.logout();
if (response.success) {
    print('User logout');
}
```
Also, once logged in you can manage sessions tokens. This feature can be called after Parse().init() on startup to check for a logged in user.
```dart
user = ParseUser.currentUser();
```

To add additional columns to the user:
```dart
var user = ParseUser("TestFlutter", "TestPassword123", "TestFlutterSDK@gmail.com")
            ..set("userLocation", "FlutterLand");
```

Other user features are:-
 * Request Password Reset
 * Verification Email Request
 * Get all users
 * Save
 * Destroy user
 * Queries

 ## Facebook, OAuth and 3rd Party Login/User

 Usually, each provider will provide their own library for logins, but the loginWith method on ParseUser accepts a name of provider, then a Map<String, dynamic> with the authentication details required.
 For Facebook and the example below, we used the library provided at https://pub.dev/packages/flutter_facebook_login

 ```
 Future<void> goToFacebookLogin() async {
        final FacebookLogin facebookLogin = FacebookLogin();
        final FacebookLoginResult result = await facebookLogin.logInWithReadPermissions(['email']);
    
        switch (result.status) {
          case FacebookLoginStatus.loggedIn:
            final ParseResponse response = await ParseUser.loginWith(
                'facebook',
                facebook(result.accessToken.token,
                    result.accessToken.userId,
                    result.accessToken.expires));
    
            if (response.success) {
              // User is logged in, test with ParseUser.currentUser()
            }
            break;
          case FacebookLoginStatus.cancelledByUser:
                // User cancelled
            break;
          case FacebookLoginStatus.error:
                // Error
            break;
        }
      }
```

For Google and the example below, we used the library provided at https://pub.dev/packages/google_sign_in

```
class OAuthLogin {
  final GoogleSignIn _googleSignIn = GoogleSignIn( scopes: ['email', 'https://www.googleapis.com/auth/contacts.readonly'] );
  
  sigInGoogle() async {
    GoogleSignInAccount account = await _googleSignIn.signIn();
    GoogleSignInAuthentication authentication = await account.authentication;
    await ParseUser.loginWith(
        'google',
        google(_googleSignIn.currentUser.id, 
               authentication.accessToken, 
               authentication.idToken));
  }
}
```

## Security for Objects - ParseACL
For any object, you can specify which users are allowed to read the object, and which users are allowed to modify an object.
To support this type of security, each object has an access control list, implemented by the __ParseACL__ class.

If ParseACL is not specified (with the exception of the ParseUser class) all objects are set to Public for read and write.
The simplest way to use a ParseACL is to specify that an object may only be read or written by a single user.
To create such an object, there must first be a logged in ParseUser. Then, new ParseACL(user) generates a ParseACL that
limits access to that user. An object’s ACL is updated when the object is saved, like any other property.

```dart
ParseUser user = await ParseUser.currentUser() as ParseUser;
ParseACL parseACL = ParseACL(owner: user);
  
ParseObject parseObject = ParseObject("TestAPI");
...
parseObject.setACL(parseACL);
var apiResponse = await parseObject.save();
```
Permissions can also be granted on a per-user basis. You can add permissions individually to a ParseACL using
__setReadAccess__ and __setWriteAccess__
```dart
ParseUser user = await ParseUser.currentUser() as ParseUser;
ParseACL parseACL = ParseACL();
//grant total access to current user
parseACL.setReadAccess(userId: user.objectId, allowed: true);
parseACL.setWriteAccess(userId: user.objectId, allowed: true);
//grant read access to userId: 'TjRuDjuSAO' 
parseACL.setReadAccess(userId: 'TjRuDjuSAO', allowed: true);
parseACL.setWriteAccess(userId: 'TjRuDjuSAO', allowed: false);

ParseObject parseObject = ParseObject("TestAPI");
...
parseObject.setACL(parseACL);
var apiResponse = await parseObject.save();
```
You can also grant permissions to all users at once using setPublicReadAccess and setPublicWriteAccess.
```dart
ParseACL parseACL = ParseACL();
parseACL.setPublicReadAccess(allowed: true);
parseACL.setPublicWriteAccess(allowed: true);

ParseObject parseObject = ParseObject("TestAPI");
...  
parseObject.setACL(parseACL);
var apiResponse = await parseObject.save();
```
Operations that are forbidden, such as deleting an object that you do not have write access to, result in a
ParseError with code 101: 'ObjectNotFound'.
For security purposes, this prevents clients from distinguishing which object ids exist but are secured, versus which
object ids do not exist at all.

You can retrieve the ACL list of an object using:
```dart
ParseACL parseACL = parseObject.getACL();
```

## Config
The SDK supports Parse Config. A map of all configs can be grabbed from the server by calling :
```dart
var response = await ParseConfig().getConfigs();
```

and to add a config:
```dart
ParseConfig().addConfig('TestConfig', 'testing');
```

## Cloud Functions
The SDK supports call Cloud Functions.

Executes a cloud function that returns a ParseObject type
```dart
final ParseCloudFunction function = ParseCloudFunction('hello');
final ParseResponse result =
    await function.executeObjectFunction<ParseObject>();
if (result.success) {
  if (result.result is ParseObject) {
    final ParseObject parseObject = result.result;
    print(parseObject.className);
  }
}
```

Executes a cloud function with parameters
```dart
final ParseCloudFunction function = ParseCloudFunction('hello');
final Map<String, String> params = <String, String>{'plan': 'paid'};
function.execute(parameters: params);
```

## Relation

The SDK supports Relation.

To add relation to object:

```dart
dietPlan.addRelation('fruits', [ParseObject("Fruits")..set("objectId", "XGadzYxnac")]);
```

To remove relation to object:

```dart
dietPlan.removeRelation('fruits', [ParseObject("Fruits")..set("objectId", "XGadzYxnac")]);
```

To Retrive a relation instance for user, call:
```dart
final relation = dietPlan.getRelation('fruits');
```

and then you can add a relation to the passed in object:
```
relation.add(dietPlan);
final result = await user.save();
```

To retrieve objects that are members of Relation field of a parent object:
```dart
QueryBuilder<ParseObject> query =
    QueryBuilder<ParseObject>(ParseObject('Fruits'))
      ..whereRelatedTo('fruits', 'DietPlan', DietPlan.objectId);
```

## File
There are three different file classes in this SDK:
- `ParseFileBase` is and abstract class and is the foundation of every file class that can be handled by this SDK.
- `ParseFile` (former the only file class in the SDK) extends ParseFileBase and is by default used as the file class on every platform but web.
This class uses a `File` from `dart:io` for storing the raw file.
- `ParseWebFile` is the equivalent to ParseFile used at Flutter Web.
This class uses an `Uint8List` for storing the raw file.

These classes are used by default to represent files, but you can also build your own class extending ParseFileBase and provide a custom `ParseFileConstructor` similar to the `SubClasses`.

Have a look at the example application for a small (non web) example.

When uploading or downloading a file, you can use the `progressCallback`-parameter to track the progress of the http request.
```dart
//A short example for showing an image from a ParseFileBase
Widget buildImage(ParseFileBase image){
  return FutureBuilder<ParseFileBase>(
    future: image.download(),
    builder: (BuildContext context,
    AsyncSnapshot<ParseFileBase> snapshot) {
      if (snapshot.hasData) {
        if (kIsWeb) {
          return Image.memory((snapshot.data as ParseWebFile).file);
        } else {
          return Image.file((snapshot.data as ParseFile).file);
        }
      } else {
        return CircularProgressIndicator();
      }
    },
  );
}
```
```dart
//A short example for storing a selected picture
//libraries: image_picker (https://pub.dev/packages/image_picker), image_picker_for_web (https://pub.dev/packages/image_picker_for_web)
PickedFile pickedFile = await ImagePicker().getImage(source: ImageSource.gallery);
ParseFileBase parseFile;
if (kIsWeb) {
  //Seems weird, but this lets you get the data from the selected file as an Uint8List very easily. 
  ParseWebFile file = ParseWebFile(null, name: null, url: pickedFile.path);
  await file.download();
  parseFile = ParseWebFile(file.file, name: file.name);
} else {
  parseFile = ParseFile(File(pickedFile.path));
}
someParseObject.set("image", parseFile);
//This saves the ParseObject as well as all of its children, and the ParseFileBase is such a child. 
await someParseObject.save();
```
```dart
//progressCallback example
file.upload(progressCallback: (int count, int total) => print("$count of $total"));
```

## Other Features

Main:
* Installation (View the example application)
* GeoPoints (View the example application)
* Persistent storage
* Debug Mode - Logging API calls
* Manage Session ID's tokens

User:
* Queries
* Anonymous (View the example application)
* 3rd Party Authentication

Objects:
* Create new object
* Extend Parse Object and create local objects that can be saved and retreived
* Queries
