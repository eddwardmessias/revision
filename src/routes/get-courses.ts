import type {FastifyPluginAsyncZod} from 'fastify-type-provider-zod'
import { db } from '../database/client.ts'
import { courses } from '../database/schema.ts'
import z from 'zod'
import { ilike, asc } from 'drizzle-orm'

export const  getCoursesRoute: FastifyPluginAsyncZod = async (server) => {
  server.get('/courses', {
    schema: {
      tags: ['courses'],
      summary: 'Get all courses',
      querystring: z.object({
        search: z.string().optional(),
        orderBy: z.enum(['title','id']).optional().default('id'),
        page: z.coerce.number().optional().default(1),
      }),
      response: {
        200: z.object({ 
          courses: z.array(
            z.object({
              id: z.string().uuid(),
              title: z.string(),      
            })
          ),
          total: z.number()
        }).describe('List of all courses')
      }
    }
  }, async (request, reply) => {
    const { search, orderBy, page} = request.query

    const result = await db.select({
        id: courses.id,
        title: courses.title
      })
      .from(courses)
      .orderBy(asc(courses[orderBy]))
      .offset((page - 1) * 2)
      .limit(2)
      .where(
        search ? ilike(courses.title, `%${search}%`) : undefined
      )

    const total = await db.$count(courses,search ? ilike(courses.title, `%${search}%`) : undefined)

    return reply.send({ courses: result, total})
  })
}