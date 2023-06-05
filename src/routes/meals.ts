import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function mealsRoutes(app: FastifyInstance) {
  // app.get('/meals', { preHandler: [checkSessionIdExists] }, async (request) => {
  //   const meals = await knex('meals').select()

  //   return { meals }
  // })

  app.get(
    '/:id/meals',
    // { preHandler: [checkSessionIdExists] },
    async (request) => {
      const getUsersParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getUsersParamsSchema.parse(request.params)

      // const { sessionId } = request.cookies

      const meals = await knex('meals')
        .where({
          user_id: id,
          // session_id: sessionId,
        })
        .first()

      return {
        meals,
      }
    },
  )

  app.post(
    '/:id/meals',
    // { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const createMealsBodySchema = z.object({
        name: z.string(),
        description: z.string(),
      })

      const getUsersParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getUsersParamsSchema.parse(request.params)

      const { name, description } = createMealsBodySchema.parse(request.body)

      // const sessionId = request.cookies.sessionId

      // if (!sessionId) {
      //   throw new Error('not allowed')
      // }

      await knex('meals').insert({
        user_id: id,
        name,
        description,
      })

      return reply.status(201).send()
    },
  )
}
