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
        state: String!
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
    type RSyncRequestPayload {   
        username: String
        password: String
    }
    type DataSubsPayload {   
        message: String!
    }

    type Subscription {    
        subsUser: UserSubsPayload!
        subsSession: SessionSubsPayload!  
        subsBoard: BoardSubsPayload!
        subsDockerImage: DockerImageSubsPayload!
        subsPlatform: PlatformSubsPayload!
        subsRSync: RSyncRequestPayload!
        subsData: DataSubsPayload!
    }

    type Query {
        allPlatforms: [Platform!]!
        allDockerImages(platformName: String): [DockerImage!]!
        allSessions(
            platformName: String
            status: [String]): [Session]!
        allBoards(platformName: String): [Board!]!
        allJobs(
            sessionsName: String
            platformName: String): [Job!]!
        rsyncRequest: String!
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
    
        platformCreate(
            name: String!,
            description: String): Platform!
        boardCreate(
            platform: String!
            hostname: String!
            description: String): Board!
        dockerImageCreate(
            platformid: String!
            name: String!
            options: String
            description: String): DockerImage!
        sessionCreate(
            platform: String!
            dockerimage: String!
            name: String!
            type: String!
            command: String!
            datasets: String!
            max_jobs: Int): Session!
        sessionUpdate(
            name: String!
            state: String!
        ): Session!
        jobCreate(
            session: String!
            boardId: Int 
            dataset: String!): Job!
        publishData(
            username: String!
            data: String!
        ): Boolean
      }
`

module.exports = typeDefs
