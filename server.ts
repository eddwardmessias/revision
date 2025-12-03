import fastify from 'fastify'
import crypto from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from './src/database/client.ts'
import { courses } from './src/database/schema.ts'

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
})

// const courses = [
//   { id: '1', title: 'NodeJS' },
//   { id: '2', title: 'ReactJS' },
//   { id: '3', title: 'React Native' },
// ]

server.get('/courses', async (request, reply) => {

  const result = await db.select({
    id: courses.id,
    title: courses.title
  }).from(courses)

  return reply.send({ courses: result})
})


server.get('/courses/:id', async (request, reply) => {
  
  type Params = {
    id: string
  }

  const params = request.params as Params

  const courseId = params.id

  const result = await db
  .select()
  .from(courses)
  .where(eq(courses.id, courseId))

  if (result.length > 0) {
    return { course: result[0] }
  }

  return reply.status(404).send({ error: 'Course not found' })
})

// server.post('/courses', (request, reply) => {

//   type Body = {
//     title: string
//   }

//   const body = request.body as Body

//   const coursesId = crypto.randomUUID()

//   const courseTitle = body.title

//   if (!courseTitle) {
//     return reply.status(400).send({ error: 'Title is required' })
//   }

//   courses.push({ id: coursesId, title: courseTitle })
//   return reply.status(201).send({ coursesId })
// })

server.listen({ port: 3333 }).then(() => {
  console.log('HTTP Server running on http://localhost:3333')
})