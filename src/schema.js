const { gql } = require('apollo-server')

const typeDefs = gql`

    type User {
        id: ID!
        username: String!
        email: String!
        role: String!
        token: String!
        createdAt: String!
        lastLoggedInAt: String!
        currentState: String!
        isEnabled: Int!
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
        options: String
        description: String
        platform: Platform!
    }

    type Session {
        id: Int!
        name: String!
        type: String!
        command: String!
        max_jobs: Int!
        jobs: [Job!]!
        user: User!
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

    type UserSubsPayload {   
        mutation: String!
        data: User!
    }
    type SessionSubsPayload {   
        mutation: String!
        data: Session!
    }   
    type BoardSubsPayload {   
        mutation: String!
        data: Board!
    }
    type DockerImageSubsPayload {   
        mutation: String!
        data: DockerImage!
    }
    type PlatformSubsPayload {   
        mutation: String!
        data: Platform!
    }

    type Subscription {    
        subsUser: UserSubsPayload!
        subsSession: SessionSubsPayload!  
        subsBoard: BoardSubsPayload!
        subsDockerImage: DockerImageSubsPayload!
        subsPlatform: PlatformSubsPayload!
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
        unregister(
            username: String!): User!
        login(
            username: String!
            password: String!): User!
        logout: String!
    
        createPlatform(
            name: String!,
            description: String): Platform!
        createBoard(
            platformId: Int!
            hostname: String!
            description: String): Board!
        deleteBoard(
            hostname: String!): Board!        
        createDockerImage(
            platformId: Int!
            name: String!
            options: String
            description: String): DockerImage!
        createSession(
            platformId: Int!
            userId: Int!
            dockerImageId: Int!
            name: String!
            command: String!
            datasets: String!
            max_jobs: Int): Session!
        deleteSession(
            name: String!): Session!
        createJob(
            sessionId: Int!
            boardId: Int 
            dataset: String!): Job!
      }
`

module.exports = typeDefs
