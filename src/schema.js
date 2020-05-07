const { gql } = require('apollo-server')

const typeDefs = gql`

    type Platform {
        id: Int!
        name: String!
        spec: String
        boards: [Board!]
        sessions: [Session!]!
      }

    type Board {
        id: Int!
        hostname: String!
        spec: String
        platform: Platform!
    }

    type Session {
        id: Int!
        name: String!
        job_command: String!
        max_jobs: Int!
        jobs: [Job!]!
        datasets: String!
        platform: Platform!
      }

    type Job {
        id: Int!
        dataset: String!
        board: Board
        session: Session!
    }



    type Query {
        platform(id: Int!): Platform
        board(id: Int!): Board
        session(id: Int!): Session
        job(id: Int!): Job

        allPlatforms: [Platform!]!
        allSessions(platformId: Int!): [Session!]
        allBoards(platformId: Int!): [Board!]
        allJobs(sessionsId: Int!): [Job!]
    }

    type Mutation {
        createPlatform(
            name: String!,
            spec: String): Platform!
        createBoard(
            platformId: Int!
            hostname: String!
            spec: String): Board!
        createSession(
            platformId: Int!
            name: String!
            command: String!
            datasets: String!
            max_jobs: Int): Session!
        createJob(
            sessionId: Int!
            boardId: Int! 
            dataset: String!): Job!
      }
`

module.exports = typeDefs