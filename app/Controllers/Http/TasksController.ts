import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Task from 'App/Models/Task'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class TasksController {
    public async index({ view, auth }: HttpContextContract) {
        //const task = await Task.all()
        const user = auth.user
        await user?.load('tasks')
        return view.render('tasks/index', { task: user?.tasks })
    }
    public async store({ request, response, session, auth }: HttpContextContract) {
        const validationSchema = schema.create({
            title: schema.string({ trim: true }, [
                rules.maxLength(25)
            ])
        })

        const validatedData = await request.validate({
            schema: validationSchema,
            messages: {
                'title.required': 'Enter task title',
                'title.maxLenght': 'Task title can not exceed 25 characters'
            },
        })
        await auth.user?.related('tasks').create({
            title: validatedData.title,

        })
        session.flash('notifi cation', 'Task added!')
        return response.redirect('back')
    }

    public async update({ request, response, session, params }: HttpContextContract) {
        const task = await Task.findOrFail(params.id)
        task.is_completed = !!request.input('completed')
        await task.save()
        session.flash('notification', 'Task completed')

        return response.redirect('back')
    }

    public async destroy({ params, session, response }: HttpContextContract) {
        const task = await Task.findOrFail(params.id)
        await task.delete()
        session.flash('notification', 'Task deleted')

        return response.redirect('back')
    }
}
