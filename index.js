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
    image: String,
    publishedAt: String
}));

// Define the schema
const typeDefs = gql`
  type Post {
    id: ID!
    title: String!
    content: String!
    order: Int!,
    image:String,
    publishedAt:String!
  }
type PostsResult {
  posts: [Post]
  totalCount: Int
  currentPage: Int
}

  type Query {
    posts(limit: Int, offset: Int): PostsResult
  }

  type Mutation {
    reorderPosts(ids: [ID!]!): [Post]
    addPost(title: String!, content: String!,image:String,publishedAt:String!): Post
  }
`;

// Define the resolvers
const resolvers = {
    Query: {
        posts: async (_, { limit = 10, offset = 0 }) => {
            const totalCount = await Post.countDocuments();
            const posts = await Post.find().sort({ order: 1 }).skip(offset).limit(limit);
            const currentPage = Math.floor(offset / limit) + 1;
            return {
                posts,
                totalCount,
                currentPage,
            };
        },
    },
    Mutation: {
        reorderPosts: async (_, { ids }) => {
            for (let i = 0; i < ids.length; i++) {
                await Post.findByIdAndUpdate(ids[i], { order: i });
            }
            return await Post.find().sort({ order: 1 });
        },
        addPost: async (_, { title, content, image, publishedAt }) => {
            const count = await Post.countDocuments();
            const post = new Post({ title, content, order: count, image, publishedAt });
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
