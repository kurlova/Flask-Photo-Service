#!/usr/bin/env python
# -*- coding: utf-8 -*-


import flask
from app import app, db
from app.models import User, Course
from app.oauth import OAuthSignIn
from flask import render_template, redirect, url_for, flash, request
from flask import json
from flask.ext.login import current_user, login_user, logout_user


@app.route('/')
@app.route('/index')
def index():
    word = 'Helloy'
    return render_template('index.html', word=word)


@app.route('/courses')
def view_courses():
    courses = Course.query.all()
    courses_storg = []
    for el in range(len(courses)):
        courses_storg.append({"id": courses[el].id,
                            "name": courses[el].name,
                            "description": courses[el].description,
                            "image": courses[el].img
                            })
    result = json.dumps({"data": courses_storg}, ensure_ascii=False)
    return flask.Response(response=result, content_type='application/json; charset=utf-8',)


# for test search: localhost:5000/search?q=<some value>
@app.route('/search', methods=['GET'])
def search():
    param = request.args.get('q')
    l_param = param.lower()
    db_content = Course.query.all()
    indexes = []
    for el in range(len(db_content)):
        if l_param in db_content[el].name.lower():
            indexes.append(el)
    search_res = []
    for el in indexes:
        search_res.append({"name": db_content[el].name,
                           "description": db_content[el].description,
                           "image": db_content[el].img})
    result = json.dumps({"data": search_res}, ensure_ascii=False)
    return flask.Response(response=result, content_type='application/json; charset=utf-8',)


@app.route('/create', methods=['GET', 'POST'])
def create_course():
    length = len(Course.query.all()) + 1
    test = [{"id": length,
                     "name": "Test course №" + str(length),
                     "description": "This is a description for test course №" + str(length),
                     "image": "icon/course.png"}]
    s = json.dumps({"data": test}, ensure_ascii=False)
    dict_convert = json.loads(s)
    name = dict_convert['data'][0]['name']
    description = dict_convert['data'][0]['description']
    img = dict_convert['data'][0]['image']
    course = Course(name=name, description=description, img=img)
    db.session.add(course)
    db.session.commit()
    return flask.Response(response='ok', content_type='application/json; charset=utf-8',)


@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('index'))


#When the user clicks the "Login in with ..." link to initiate an OAuth authentication
# the following application route is invoked
@app.route('/authorize/<provider>')
def oauth_authorize(provider):
    if not current_user.is_anonymous:
        return redirect(url_for('index'))
    oauth = OAuthSignIn.get_provider(provider)
    return oauth.authorize()


@app.route('/callback/<provider>')
def oauth_callback(provider):
    if not current_user.is_anonymous:
        return redirect(url_for('index'))
    oauth = OAuthSignIn.get_provider(provider)
    social_id, username, email = oauth.callback()
    if social_id is None:
        flash('Authentication failed.')
        return redirect(url_for('index'))
    user = User.query.filter_by(social_id=social_id).first()
    if not user:
        print(username)
        user = User(social_id=social_id, nickname=username, email=email)
        db.session.add(user)
        db.session.commit()
        login_user(user, True)
        return redirect(url_for('create_profile'))
    else:
        login_user(user, True)
        return redirect(url_for('index'))

@app.route('/create_profile', methods=['GET', 'POST'])
def create_profile():
        form = ProfileForm()
        if request.method == 'POST' and form.validate_on_submit():
            new_data = User.query.get(str(id))
            new_data.email = form.email.data
            db.session.commit()
            return redirect('/index')
        return render_template('create_profile.html', form=form)

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404
