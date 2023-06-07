import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function usersRoutes(app: FastifyInstance) {
  // List all Users in the database
  app.get('/users', { preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies

    const users = await knex('users').where('session_id', sessionId).select()

    return { users }
  })

  // List an specific User in the database
  app.get(
    '/users/:userId',
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const getUsersParamsSchema = z.object({
        userId: z.string().uuid(),
      })

      const { userId } = getUsersParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const user = await knex('users')
        .where({
          user_id: userId,
          session_id: sessionId,
        })
        .first()

      return {
        user,
      }
    },
  )

  // Create a new User in the database
  app.post('/users', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
    })

    const { name, email } = createUserBodySchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('users').insert({
      user_id: randomUUID(),
      name,
      email,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
