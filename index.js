const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, LoggerLevel } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

// graphql
const { graphqlHTTP } = require('express-graphql');
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLNonNull, GraphQLInt } = require('graphql');

// middleware 
app.use(cors());
app.use(express.json());


const uri = "mongodb+srv://learning-database:n4Jecc0URZJL35YK@cluster0.icikx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        console.log('database connecting');
        await client.connect();
        const database = client.db('group_info');
        const usersCollection = database.collection('user');
        const userPostCollection = database.collection('userPost');
        console.log('graphql server is ready ');
        //single user query type
        const userType = new GraphQLObjectType({
            name: 'user',
            description: 'We can get user info there',
            fields: () => ({

                _id: { type: GraphQLString },
                displayName: { type: GraphQLString },
                email: { type: GraphQLString },
                uid: { type: GraphQLString },
                photoURL: { type: GraphQLString },
                role: { type: GraphQLString },
                createdAt: { type: GraphQLString },
            })
        })
        //lovesType
        // const lovesType = new GraphQLString({
        //     name: 'loveEmail',
        //     description: 'all love',
        //     fields: () => {

        //     }
        // })
        //comments type
        const commentType = new GraphQLObjectType({
            name: 'commentOFPost',
            description: 'all comment key are there',
            fields: () => ({

                _id: { type: GraphQLString },
                PostInfo: { type: GraphQLString },
                postId: { type: GraphQLString },
                check: { type: GraphQLString },
                time: { type: GraphQLString },
                postIn: { type: GraphQLString },
                loves: { type: GraphQLList(GraphQLString) },
                client: { type: userType },
            })
        })
        // single post type 
        const postType = new GraphQLObjectType({
            name: 'singlePost',
            description: 'all single post key are there',
            fields: () => ({

                _id: { type: GraphQLString },
                postInfo: { type: GraphQLString },
                codeType: { type: GraphQLString },
                client: { type: userType },
                time: { type: GraphQLString },
                postIn: { type: GraphQLString },
                loves: { type: GraphQLList(GraphQLString) },
                comments: { type: GraphQLList(commentType) },
            })
        })

        // main root query type
        const RootQueryType = new GraphQLObjectType({
            name: 'Query',
            description: 'Root query ',
            fields: () => ({
                user: {
                    type: userType,
                    args: {
                        _id: { type: GraphQLString },
                        role: { type: GraphQLString },
                        uid: { type: GraphQLString },
                        displayName: { type: GraphQLString },
                        createdAt: { type: GraphQLString },
                        email: { type: GraphQLString }
                    },
                    resolve: async (parent, args) => {
                        console.log(args);
                        let data = null;
                        const queryKeys = Object.keys(args)
                        if (args._id) {
                            data = await usersCollection.findOne({ _id: ObjectId(args._id) });
                        } else if (queryKeys.length && !args._id) {
                            data = await usersCollection.findOne(args);
                        }
                        console.log(data);
                        return data;
                    }
                },
                users: {
                    type: GraphQLList(userType),
                    args: {
                        role: { type: GraphQLString },
                        displayName: { type: GraphQLString }
                    },
                    resolve: async (parent, args) => {
                        console.log(args);
                        let data;
                        const queryKeys = Object.keys(args)
                        if (args._id) {
                            data = [await usersCollection.findOne({ _id: ObjectId(args._id) })];
                        } else if (queryKeys.length && !args._id) {
                            data = await usersCollection.find(args).toArray();
                        }
                        else {
                            data = await usersCollection.find({}).toArray()
                        }
                        console.log(data);
                        return data;
                    }
                },
                // post: {
                //     type: GraphQLList(userQuery),
                //     resolve: async () => await usersCollection.find({}).toArray()
                // },
                singlePost: {
                    type: GraphQLList(postType),
                    args: {
                        _id: { type: GraphQLString }
                    },
                    resolve: async (parent, args) => {
                        const data = await userPostCollection.find({}).toArray();
                        data.forEach(element => {
                            console.log(element.comments);
                        })
                        return data;
                    }
                }
            })
        })
        schema = new GraphQLSchema({
            query: RootQueryType
        });
        app.use('/graphql', graphqlHTTP({
            schema: schema,
            graphiql: true,
        }));


    } finally {
        // await client.close();
    }
}
run().catch(console.dir);
app.listen(port, () => {
    console.log(`listening at ${port}`)
})

