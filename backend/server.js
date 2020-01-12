const express = require('express');

const bodyParser = require('body-parser');
const cors = require('cors');
// const MongoClient =require('mongodb').MongoClient;
var mongoose = require('mongoose');
const app = express();
const port = 3000;
const url = 'mongodb://localhost:27017/messageBoard';
// const dbName='messageBoard';
// let db;
app.use(bodyParser.json());
app.use(cors());

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', () => console.log('connected to mongodb'));

const Message = mongoose.model('Message', {
    userName: String,
    msg: String
});

const User = mongoose.model('User', {
    name: String,
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
});


app.post('/api/message', async (req, res) => {
    // const message=req.body;
    // console.log(message);
    const message = new Message(req.body);
    message.save();




    // db.collection('messages').insertOne(message);
    let user = await User.findOne({ name: message.userName });
    console.log(user);
    if (!user) {
        user = new User({ name: message.userName });
    }
    user.messages.push(message);
    user.save();
    res.status(200).send();

})

app.get('/api/message', async (req, res) => {
    const docs = await Message.find();
    // const docs=await db.collection('messages').find({}).toArray();
    if (!docs) return res.json({ error: 'Error getting messge' });
    res.json(docs);

})

app.get('/api/user/:name', async (req, res) => {
    const name = req.params.name;
  
    const user = await User.aggregate([
        { $match : { name } },
        {
            $project: {
                messages: 1, name: 1, isGold: {
                    $gte: [{$size: "$messages"}, 5]
                }
            }
        },
    ]);
    
    await User.populate(user, {path: 'messages'});

    res.json(user[0]);
    // return res.json(await User.findOne({ name }).populate('Message'));
});

//Function to get all posts in mongodb to console

mongoose.connect(url);

// MongoClient.connect(url,function(err,client){
//     if(err) return console.log("Error",err.message);


//         console.log("Connected Successfully to Server..!");
//         db =client.db(dbName);



// });
app.listen(port, () => console.log('App running on port', port));