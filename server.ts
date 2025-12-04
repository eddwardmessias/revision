import fastify from 'fastify'
import { fastifySwagger } from '@fastify/swagger'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import { validatorCompiler, serializerCompiler, type ZodTypeProvider, jsonSchemaTransform } from 'fastify-type-provider-zod'
import { getCoursesRoute } from './src/routes/get-courses.ts'
import { getCourseByIdRoute } from './src/routes/get-courses-by-id.ts'
import { createCourseRoute } from './src/routes/create-courses.ts'
import scalarAPIReference from '@scalar/fastify-api-reference'


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

if (process.env.NODE_ENV === 'development') {
  server.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Revision Node.Js API with Fastify',
        version: '1.0.0',
      },
    },
    transform: jsonSchemaTransform,
  })

  server.register(scalarAPIReference, {
    routePrefix: '/docs',
  })
}

server.setSerializerCompiler(serializerCompiler)
server.setValidatorCompiler(validatorCompiler)

server.register(createCourseRoute)
server.register(getCoursesRoute)
server.register(getCourseByIdRoute)

server.listen({ port: 3333 }).then(() => {
  console.log('HTTP Server running on http://localhost:3333')
})