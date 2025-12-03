import { eq } from 'drizzle-orm'
import fastify from 'fastify'
import {validatorCompiler,serializerCompiler, type ZodTypeProvider} from 'fastify-type-provider-zod'
import { db } from './src/database/client.ts'
import { courses } from './src/database/schema.ts'
import {z} from 'zod'

const server = fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  }
}).withTypeProvider<ZodTypeProvider>()

server.setSerializerCompiler(serializerCompiler)
server.setValidatorCompiler(validatorCompiler)


server.get('/courses', async (request, reply) => {
  const result = await db.select({
    id: courses.id,
    title: courses.title
  }).from(courses)

  return reply.send({ courses: result})
})

server.get('/courses/:id', {
  schema: {
    params: z.object({
      id: z.string().uuid('Invalid course ID format'),
    })
  }
},async (request, reply) => {
  const courseId = request.params.id

  const result = await db
  .select()
  .from(courses)
  .where(eq(courses.id, courseId))

  if (result.length > 0) {
    return { course: result[0] }
  }

  return reply.status(404).send({ error: 'Course not found' })
})

server.post('/courses', {
  schema: {
    body: z.object({
        title: z.string().min(5, 'Title must be at least 5 characters long'),
      })
  }
},async (request, reply) => {
  const courseTitle = request.body.title

  const result = await db
    .insert(courses)
    .values({title: courseTitle})
    .returning()
    
  return reply.status(201).send({ courseId: result[0].id })
})

server.listen({ port: 3333 }).then(() => {
  console.log('HTTP Server running on http://localhost:3333')
})