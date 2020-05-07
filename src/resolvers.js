const bcrypt = require('bcryptjs')

const resolvers = {
    Query: {
        async platform (root, { id }, { models }) {
            return models.Platform.findByPk(id)
        },
        async board (root, { id }, { models }) {
            return models.Board.findByPk(id)
        },
        async session (root, { id }, { models }) {
            return models.Session.findByPk(id)
        },
        async job (root, { id }, { models }) {
            return models.Job.findByPk(id)
        },
        async allPlatforms (root, args, { models }) {
            return models.Platform.findAll()
        },
        async allBoards (root, { platformId }, { models }) {
            return models.Board.findAll({
                where: { platformId: platformId }
            })
        },
        async allSessions (root, {platformId}, { models }) {
            return models.Session.findAll({
                where: { platformId: platformId }
            })
        },
        async allJobs (root, {sessionId}, { models }) {
            return models.Board.findAll({
                where: { sessionId: sessionId }
            })
        },
      },
    Mutation: {
        async createPlatform (root, { name, spec }, { models }) {
            return models.Platform.create({
                name,
                spec,
            })
        },
        async createBoard (root, { platformId, hostname, spec }, { models }) {
            return models.Board.create({ 
                platformId, 
                hostname, 
                spec
            })
        },
        async createSession (root, { platformId, name, command, datasets, max_jobs }, { models }) {
            return models.Session.create({ 
                platformId, 
                name, 
                command,
                datasets,
                max_jobs
            })
        },
        async createJob (root, { sessionId, dataset }, { models }) {
            return models.Job.create({ 
                sessionId, 
                dataset,
            })
        }
    },
    Platform: {
        async boards (platform) {
            return platform.getBoards()
        }
    },
    Board: {
        async platform (board) {
            return board.getPlatform()
        }
    },
    Job: {
        async session (job) {
            return job.getSession()
        }
    },
    Session: {
        async jobs(session) {
            return session.getJobs()
        },
        async platform(session) { // ERROR 
            return session.getPlatform()
        }
    }
}

module.exports = resolvers