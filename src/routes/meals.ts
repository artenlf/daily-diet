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
      const createMealsBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        fulfilDiet: z.boolean(),
      })

      const getUsersParamsSchema = z.object({
        userId: z.string().uuid(),
      })

      const { userId } = getUsersParamsSchema.parse(request.params)

      const { name, description, fulfilDiet } = createMealsBodySchema.parse(
        request.body,
      )

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
        date: dayjs().format('DD/MM/YYYY HH:mm'),
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
      const today = dayjs().locale('pt-BR')
      const maxDate = today
        .add(5, 'year')
        .endOf('day')
        .format('DD/MM/YYYY HH:mm')
      const startDate = today.startOf('day').format('DD/MM/YYYY HH:mm')

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
          .datetime({ offset: true })
          .transform((value) => {
            const formattedTime = dayjs(value).format('DD/MM/YYYY HH:mm')

            return formattedTime
          })
          .refine(
            (value) => {
              const selectedDate = dayjs(value)
              return (
                selectedDate.isAfter(today) && selectedDate.isBefore(maxDate)
              )
            },
            {
              message: `Date must be between ${startDate} and ${maxDate}.`,
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
  app.delete(
    '/:userId/meals/:mealId',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
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

      await knex('meals')
        .where({
          meal_id: mealId,
          user_id: userId,
          session_id: sessionId,
        })
        .delete()

      return reply.status(204).send()
    },
  )

  // User stats
  app.get(
    '/:userId/stats',
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const getUsersParamsSchema = z.object({
        userId: z.string().uuid(),
      })

      const { userId } = getUsersParamsSchema.parse(request.params)

      // Get the total number of meals of the user
      const totalNumberOfMeals = (
        await knex('meals').where({ user_id: userId })
      ).length

      // Get the total number of meals fulfilling the Diet of the user
      const totalNumberOfMealsFulfillingDiet = (
        await knex('meals').where({
          user_id: userId,
          fulfil_diet: true,
        })
      ).length

      // Get the total number of meals not fulfilling the Diet of the user
      const totalNumberOfMealsNotFulfillingDiet = (
        await knex('meals').where({
          user_id: userId,
          fulfil_diet: false,
        })
      ).length

      // Streak of meals fulfilling the Diet of the user
      const meals = await knex('meals').where({
        user_id: userId,
      })

      const streakOfMealsFullingDiet = meals.reduce(
        (result, meal) => {
          if (meal.fulfil_diet === 1) {
            result.count += 1
            result.maxStreak = Math.max(result.maxStreak, result.count)
          } else {
            result.count = 0
          }
          return result
        },
        { count: 0, maxStreak: 0 },
      ).maxStreak

      return {
        totalNumberOfMeals,
        totalNumberOfMealsFulfillingDiet,
        totalNumberOfMealsNotFulfillingDiet,
        streakOfMealsFullingDiet,
      }
    },
  )
}
