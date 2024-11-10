const { gql } = require('apollo-server')

const typeDefs = gql`

    type HandshakePayload {
        api_version: String!
    }

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
        bastionKey: String
        userKey: String
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
        ip: String!
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
        state: String!
        dataset: String!
        session: Session!
    }

    type UserSubsPayload {
        mutation: String!
        data: User!
    }
    type SessionSubsPayload {
        mutation: String!
        data: String!
    }
    type AdminSubsPayload {
        username: String!
        command: String!
        data: String
    }
    type SaveOTPPayload {
        status: Boolean!
        email: String
        message: String!
    }
    type VerifyOTPPayload {
        status: Boolean!
        message: String!
        user: User
    }
    type SessionStatusPayload {
        jobs: [Job]!
        state: String!
    }
    type JobSubsPayload {
        mutation: String!
        data: Job!
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
        public_key: String
    }
    type DataSubsPayload {
        message: String!
    }
    type DockerImageSavePayload {
        status: String!
    }

    type Subscription {
        subsUser: UserSubsPayload!
        subsSession: SessionSubsPayload!
        subsAdmin: AdminSubsPayload!
        subsJob: JobSubsPayload!
        subsBoard: BoardSubsPayload!
        subsDockerImage: DockerImageSubsPayload!
        subsPlatform: PlatformSubsPayload!
        subsRSync: RSyncRequestPayload!
        subsData: DataSubsPayload!
    }

    type Query {
        handshake: HandshakePayload!
        allPlatforms: [Platform!]!
        allDockerImages(platformName: String): [DockerImage!]!
        allSessions(
            platformName: String
            status: [String]): [Session]!
        user(username: String): User
        verifyOTP(
            username: String
            otp: String): VerifyOTPPayload!
        allBoards(platformName: String): [Board!]!
        sessionStatus(
            name: String): SessionStatusPayload!
        session(
            name: String): Session
        rsyncRequest: Boolean!
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
            token: String!): User!
        logout: String!
        saveKeys(
            username: String!
            bastionKey: String!,
            userKey: String!): User
        saveOTP(
            username: String!
            otp: String!,
            expiry: Int!): SaveOTPPayload!
        platformCreate(
            name: String!,
            description: String): Platform!
        boardCreate(
            platform: String!
            hostname: String!
            ip: String!
            description: String): Board!
        dockerImageCreate(
            platformId: Int!
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
        sessionSave(
            name: String!
            dockerimage: String!
            description: String): DockerImageSavePayload!    
        sessionUpdateState(
            name: String!
            state: String!
            ): Session!
        sessionUpdateCommand(
            name: String!
            command: String
            ): Session!
        jobCreate(
            sessionId: Int!
            datasets: String): [Job!]!
        jobUpdate(
            id: Int!
            state: String!
            ): Job!
        adminRequest(
                command: String!
                data: String
                ): Boolean
        publishData(
            username: String!
            data: String!
        ): Boolean
      }
`

module.exports = typeDefs
