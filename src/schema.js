const { gql } = require('apollo-server')

const typeDefs = gql`

    type User {
        id: ID!
        email: String!
        token: String!
        username: String!
        createdAt: String!
    }

    type Platform {
        id: Int!
        name: String!
        description: String
        boards: [Board!]
        dockerImages: [DockerImage!]
        sessions: [Session!]!
    }

    type Board {
        id: Int!
        hostname: String!
        description: String
        platform: Platform!
    }

    type DockerImage {
        id: Int!
        name: String!
        description: String
        platform: Platform!
    }

    type Session {
        id: Int!
        name: String!
        command: String!
        max_jobs: Int!
        jobs: [Job!]!
        datasets: String!
        platform: Platform!
        dockerImage: DockerImage!
    }

    type Job {
        id: Int!
        dataset: String!
        board: Board
        session: Session!
    }

    type Subscription {    
        sessionAdded: Session!  
        boardAdded: Board!
        dockerImageAdded: DockerImage!
        platformAdded: Platform!
    }

    type Query {
        users: [User]!
        platform(id: Int!): Platform
        board(id: Int!): Board
        dockerImage(id: Int!): DockerImage
        session(id: Int!): Session
        job(id: Int!): Job

        allPlatforms: [Platform!]!
        allDockerImages(platformId: Int!): [DockerImage!]
        allSessions(platformId: Int!): [Session!]
        allBoards(platformId: Int!): [Board!]
        allJobs(sessionsId: Int!): [Job!]
    }

    type Mutation {
        register(
            username: String!
            email: String!
            password: String!
            cpassword: String!): User!
        login(
            username: String!
            password: String!): User!
        createPlatform(
            name: String!,
            description: String): Platform!
        createBoard(
            platformId: Int!
            hostname: String!
            description: String): Board!
        createDockerImage(
            platformId: Int!
            name: String!
            description: String): DockerImage!
        createSession(
            platformId: Int!
            dockerImageId: Int!
            name: String!
            command: String!
            datasets: String!
            max_jobs: Int): Session!
        createJob(
            sessionId: Int!
            boardId: Int 
            dataset: String!): Job!
      }
`

module.exports = typeDefs
