import Parse from './src/Parse';

Parse._initialize('eADRPQMqsSgbph6d6UrQFSdTmxpID5ZsVGv2uhAy', "", "Aevvn2IBV19ObnkeCKvRV2skgcC3kw5InDbw1zVL");
Parse.serverURL = 'http://localhost:1337/parse';

const GameScore = Parse.Object.extend("GameScore");

// const gameScore = new GameScore();

async function agg() {
  try {
    // const gs = await gameScore.save();

    // console.log({gs});
    const query = new Parse.Query(GameScore);
    const res = await query.aggregate([
      {
        'search': {
          objectId: 'cCj5wqyBHh'
        }
      }
    ]);
    console.log({res})
  } catch (error) {
    console.log({error})
  }
}

agg();
