import fastify from 'fastify'
import crypto from 'node:crypto'

const server = fastify({
  logger: true
})

const courses = [
  { id: '1', title: 'NodeJS' },
  { id: '2', title: 'ReactJS' },
  { id: '3', title: 'React Native' },
]

server.get('/courses', (request, reply) => {
  return reply.send({ courses, page: 1 })
})


server.get('/courses/:id', (request, reply) => {
  
  type Params = {
    id: string
  }

  const params = request.params as Params

  const { id } = params 

  const course = courses.find(course => course.id === id)

  if (!course) {
    return reply.status(404).send({ error: 'Course not found' })
  }

  return { course }
})

server.post('/courses', (request, reply) => {

  type Body = {
    title: string
  }

  const body = request.body as Body

  const coursesId = crypto.randomUUID()

  const courseTitle = body.title

  if (!courseTitle) {
    return reply.status(400).send({ error: 'Title is required' })
  }

  courses.push({ id: coursesId, title: courseTitle })
  return reply.status(201).send({ coursesId })
})

server.listen({ port: 3333 }).then(() => {
  console.log('HTTP Server running on http://localhost:3333')
})