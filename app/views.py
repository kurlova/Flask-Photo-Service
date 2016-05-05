#!/usr/bin/env python
# -*- coding: utf-8 -*-


import flask
from app import app, db
from app.models import User, Course, users_courses_relationship, Camera
from app.oauth import OAuthSignIn
from flask import render_template, redirect, url_for, flash, request
from flask import json
from flask.ext.login import current_user, login_user, logout_user
from flask.json import jsonify


@app.route('/')
@app.route('/index')
def index():
    word = 'Helloy'
    return render_template('index.html', word=word)


# Все курсы из базы данных
@app.route('/courses')
def view_courses():
    courses = Course.query.all()
    courses_storg = []
    for el in range(len(courses)):
        courses_storg.append({"id": courses[el].id,
                              "name": courses[el].name,
                              "description": courses[el].description,
                              "image": courses[el].img,
                              "cost": courses[el].cost,
                              "format": courses[el].course_format
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
    print(result)
    return flask.Response(response=result, content_type='application/json; charset=utf-8', mimetype='application/json')


# Создание курса
@app.route('/create_course', methods=['GET', 'POST'])
def create_course():
    new_course = json.dumps({"data": request.json.get("data")}, ensure_ascii=False)
    convert = json.loads(new_course)
    name = convert["data"]["name"]
    description = convert["data"]["description"]
    img = convert["data"]["image"]
    creator_id = convert["data"]["creator_id"]
    course = Course(name=name, description=description, img=img, creator_id=creator_id)
    db.session.add(course)
    db.session.commit()
    return flask.Response(response='ok', content_type='application/json; charset=utf-8')


# Список курсов которые пользователь создал
@app.route('/created', methods=['POST', 'GET'])
def created_courses():
    user = json.dumps({"data": request.json.get("data")}, ensure_ascii=False)
    convert = json.loads(user)
    user_id = convert["data"]["user_id"]
    courses = User.query.filter_by(id=user_id).first().courses_owned.all()
    owned = []
    for el in range(len(courses)):
        owned.append({"name": courses[el].name,
                      "description": courses[el].description,
                      "image": courses[el].img})
    result = json.dumps({"data": owned}, ensure_ascii=False)
    return flask.Response(response=result, content_type='application/json; charset=utf-8')


# Подписка на курс
@app.route('/subscribe', methods=['GET', 'POST'])
def subscribe_course():
    subscription = request.get_json()
    user_id = subscription["data"]["user_id"]
    course_id = subscription["data"]["course_id"]
    user = User.query.filter_by(id=user_id).first()
    course = Course.query.filter_by(id=course_id).first()
    user.courses_subscr.append(course)
    db.session.add(user)
    db.session.commit()
    return flask.Response(response='ok', content_type='application/json; charset=utf-8')


@app.route('/api/view_profile', methods=['GET', 'POST'])
def view_profile():
    user_init = request.get_json()
    user_id = user_init["data"]["user_id"]
    user = User.query.filter_by(id=user_id).first()
    courses = User.query.filter_by(id=user_id).first().courses_subscr
    user_data = {}
    user_data['username'] = user.nickname
    user_data['country'] = user.country
    user_data['city'] = user.city
    # user_data['cameras'] = user.cameras.first()
    print(user.cameras)
    subscriptions = []
    for el in range(len(courses)):
        subscriptions.append({"name": courses[el].name,
                              "description": courses[el].description,
                              "img": courses[el].img})
    user_data['subscriptions'] = subscriptions
    result = json.dumps({"data": user_data}, ensure_ascii=False)
    return flask.Response(response=result, content_type='application/json; charset=utf-8', mimetype='application/json')


# Список курсов на которые подписан пользователь
@app.route('/subscriptions', methods=['GET', 'POST'])
def view_profile_s():
    user = json.dumps({"data": request.json.get("data")}, ensure_ascii=False)
    convert = json.loads(user)
    user_id = convert["data"]["user_id"]
    courses = User.query.filter_by(id=user_id).first().courses_subscr
    subscriptions = []
    for el in range(len(courses)):
        subscriptions.append({"name": courses[el].name,
                              "description": courses[el].description,
                              "img": courses[el].img})
    result = json.dumps({"data": subscriptions}, ensure_ascii=False)
    return flask.Response(response=result, content_type='application/json; charset=utf-8')


app.route('/course_details', methods=['GET'])
def view_course_details():
    param = request.args.get('q')
    course = Course.query.filter_by(id=param).first()
    name = course.name
    description = course.description
    course_json = {'name': name,
                   'description': description}
    result = json.dumps({"data": course_json}, ensure_ascii=False)
    print(result)
    return flask.Response(response=result, content_type='application/json; charset=utf-8', mimetype='application/json')


# Удаление курса
@app.route('/delete_course', methods=['GET', 'POST'])
def delete_course():
    deletion_data = json.dumps({"data": request.json.get("data")}, ensure_ascii=False)
    convert = json.loads(deletion_data)
    user_id = convert["data"]["user_id"]
    course_id = convert["data"]["course_id"]
    owned = User.query.filter_by(id=user_id).first().courses_owned.all()
    result = '401'
    for el in range(len(owned)):
        if owned[el].id == int(course_id):
            course = Course.query.filter_by(id=course_id).first()
            db.session.delete(course)
            db.session.commit()
            result = 'ok'
            break
    return flask.Response(response=result, content_type='application/json; charset=utf-8')


@app.route('/create_profile', methods=['GET', 'POST'])
def create_profile():
    new_user = request.get_json()
    print(new_user)
    id = new_user["data"]["id"]
    print(id)
    # id = 2
    username = new_user["data"]["username"]
    email = new_user["data"]["email"]
    city = new_user["data"]["city"]
    country = new_user["data"]["country"]
    # cams_nest = new_user["data"]["cameras"]
    # cams = []
    # for cam in range(len(cams_nest)):
    #     cams.append(cams_nest[cam]["name"])
    user = User.query.filter_by(id=id).first()
    user.nickname = username
    user.email = email
    user.country = country
    user.city = city
    # user.cameras = cams_nest
    # for cam in range(len(cams)):
    #     camera = Camera.query.filter_by(model=cams[cam]).first()
    #     user.cameras.append(camera)
    db.session.commit()
    return flask.Response(response='ok', content_type='application/json; charset=utf-8')


@app.route('/logout')
def logout():
    logout_user()
    response = redirect(url_for('index'))
    response.set_cookie('user_id', '', expires=0)
    response.set_cookie('redirect', '', expires=0)
    return response


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
        id = User.query.filter_by(social_id=social_id).first().id
        response = redirect(url_for('index'))
        response.set_cookie('user_id', value=bytes([id]))
        response.set_cookie('new_user', value='')
        return response
    else:
        login_user(user, True)
        id = User.query.filter_by(social_id=social_id).first().id
        response = redirect(url_for('index'))
        response.set_cookie('user_id', value=bytes(str(id), 'utf-8'))
        return response


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,HEAD,POST')
    return response