import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import dayjs from 'dayjs'

import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  // List all meals from a User
  app.get(
    '/:userId/meals',
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const getUsersParamsSchema = z.object({
        userId: z.string().uuid(),
      })

      const { userId } = getUsersParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const meals = await knex('meals').where({
        user_id: userId,
        session_id: sessionId,
      })

      return {
        meals,
      }
    },
  )

  // List an specific meal from a User
  app.get(
    '/:userId/meals/:mealId',
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const getUsersParamsSchema = z.object({
        userId: z.string().uuid(),
      })
      const getMealsParamsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const { userId } = getUsersParamsSchema.parse(request.params)
      const { mealId } = getMealsParamsSchema.parse(request.params)

      const { sessionId } = request.cookies
      if (!sessionId) {
        throw new Error('not allowed')
      }

      const meal = await knex('meals').where({
        meal_id: mealId,
        user_id: userId,
        session_id: sessionId,
      })

      return {
        meal,
      }
    },
  )

  // Create a new meal from a User
  app.post(
    '/:userId/meals',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const today = dayjs()
      const maxDate = today.add(5, 'year')
      const startDate = today.format('DD/MM/YYYY')
      const maxDateFormatted = maxDate.format('DD/MM/YYYY')

      const createMealsBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z
          .string()
          .refine((value) => dayjs(value, 'DD/MM/YYYY-HHTmm', true).isValid(), {
            message: 'Invalid date format. Expected DD/MM/YYYY.',
          })
          .refine(
            (value) => {
              const selectedDate = dayjs(value, 'DD/MM/YYYY')
              return (
                selectedDate.isAfter(today) && selectedDate.isBefore(maxDate)
              )
            },
            {
              message: `Date must be between ${startDate} and ${maxDateFormatted} and contain.`,
            },
          ),
        fulfilDiet: z.boolean(),
      })

      const getUsersParamsSchema = z.object({
        userId: z.string().uuid(),
      })

      const { userId } = getUsersParamsSchema.parse(request.params)

      const { name, description, date, fulfilDiet } =
        createMealsBodySchema.parse(request.body)

      const sessionId = request.cookies.sessionId
      if (!sessionId) {
        throw new Error('not allowed')
      }

      await knex('meals').insert({
        user_id: userId,
        session_id: sessionId,
        meal_id: randomUUID(),
        name,
        description,
        date,
        fulfil_diet: fulfilDiet,
      })

      return reply.status(201).send()
    },
  )

  // Update an existing meal from a User
  app.patch(
    '/:userId/meals/:mealId',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const today = dayjs()
      const maxDate = today.add(5, 'year')
      const startDate = today.format('DD/MM/YYYY')
      const maxDateFormatted = maxDate.format('DD/MM/YYYY')

      const getUsersParamsSchema = z.object({
        userId: z.string().uuid(),
      })
      const getMealsParamsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const updateMealsBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z
          .string()
          .refine((value) => dayjs(value, 'DD/MM/YYYY', true).isValid(), {
            message: 'Invalid date format. Expected DD/MM/YYYY.',
          })
          .refine(
            (value) => {
              const selectedDate = dayjs(value, 'DD/MM/YYYY')
              return (
                selectedDate.isAfter(today) && selectedDate.isBefore(maxDate)
              )
            },
            {
              message: `Date must be between ${startDate} and ${maxDateFormatted}.`,
            },
          ),
        fulfilDiet: z.boolean(),
      })

      const { userId } = getUsersParamsSchema.parse(request.params)
      const { mealId } = getMealsParamsSchema.parse(request.params)

      const { name, description, date, fulfilDiet } =
        updateMealsBodySchema.parse(request.body)

      const { sessionId } = request.cookies
      if (!sessionId) {
        throw new Error('not allowed')
      }

      const meal = await knex('meals')
        .where({
          meal_id: mealId,
          user_id: userId,
          session_id: sessionId,
        })
        .update({
          name,
          description,
          date,
          fulfil_diet: fulfilDiet,
        })
      if (!meal) {
        throw new Error('not found')
      }

      return reply.status(200).send()
    },
  )

  // Delete an existing meal from a User
}
