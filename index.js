const { ApolloServer, gql } = require('apollo-server');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://root:admin@cluster.vbbaz.mongodb.net/posts', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define the Post model
const Post = mongoose.model('Post', new mongoose.Schema({
    title: String,
    content: String,
    order: Number,
}));

// Define the schema
const typeDefs = gql`
  type Post {
    id: ID!
    title: String!
    content: String!
    order: Int!
  }

  type Query {
    posts: [Post]
  }

  type Mutation {
    reorderPosts(ids: [ID!]!): [Post]
    addPost(title: String!, content: String!): Post
  }
`;

// Define the resolvers
const resolvers = {
    Query: {
        posts: async () => await Post.find().sort({ order: 1 }),
    },
    Mutation: {
        reorderPosts: async (_, { ids }) => {
            for (let i = 0; i < ids.length; i++) {
                await Post.findByIdAndUpdate(ids[i], { order: i });
            }
            return await Post.find().sort({ order: 1 });
        },
        addPost: async (_, { title, content }) => {
            const count = await Post.countDocuments();
            const post = new Post({ title, content, order: count });
            await post.save();
            return post;
        },
    },
};

// Create the Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// Start the server
server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});
