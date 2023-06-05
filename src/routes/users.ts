import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function usersRoutes(app: FastifyInstance) {
  app.get('/users', { preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies

    const users = await knex('users').where('session_id', sessionId).select()

    return { users }
  })

  app.get(
    '/users/:id',
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const getUsersParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getUsersParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const user = await knex('users')
        .where({
          id,
          session_id: sessionId,
        })
        .first()

      return {
        user,
      }
    },
  )

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
      id: randomUUID(),
      name,
      email,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
