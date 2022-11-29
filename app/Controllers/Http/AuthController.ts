import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
//import Task from 'App/Models/Task'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'

export default class AuthController {
  public showRegister({ view }: HttpContextContract) {
    return view.render('auth/register')
  }

  public async register({ request, auth, response }: HttpContextContract) {
    const validationSchema = schema.create({
      name: schema.string({ trim: true }),
      email: schema.string({ trim: true }, [
        rules.email(),
        rules.maxLength(50),
        rules.unique({ table: 'users', column: 'email' })
      ]),
      password: schema.string({ trim: true }, [
        rules.confirmed(),
      ])
    })
    const validatedData = await request.validate({
      schema: validationSchema,
    })

    const user = await User.create(validatedData)

    await auth.login(user)

    return response.redirect('/')
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.logout()
    return response.redirect('/login')
  }

  public async showLogin({ view }: HttpContextContract) {
    return view.render('auth/login')
  }
  public async login({ request, auth, session, response }: HttpContextContract) {
    const { email, password } = request.all()
    try {
      await auth.attempt(email, password)
      return response.redirect('/')
    } catch (error) {
      session.flash('notification', 'we can not verify yours credentials.')
      return response.redirect('back')
    }
  }

}
