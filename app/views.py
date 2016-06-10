#!/usr/bin/env python
# -*- coding: utf-8 -*-
import datetime

import flask
from app import app, db
from app.models import User, Course, users_courses_relationship, Camera, Lesson, Comment, Video
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
                           "image": db_content[el].img,
                           "id": db_content[el].id
                           })
    result = json.dumps({"data": search_res}, ensure_ascii=False)
    print(result)
    return flask.Response(response=result, content_type='application/json; charset=utf-8', mimetype='application/json')


# Создание курса
@app.route('/api/create_course', methods=['POST'])
def create_course():
    course_data = request.get_json()
    c_name = course_data["data"]["c_name"]
    c_description = course_data["data"]["c_description"]
    c_img = course_data["data"]["c_image"]
    creator_id = course_data["data"]["creator_id"]
    cost = course_data["data"]["cost"]
    course_format = course_data["data"]["course_format"]
    course = Course(name=c_name, description=c_description, img=c_img, creator_id=creator_id, cost=cost, course_format=course_format)
    db.session.add(course)
    db.session.commit()
    lessons = course_data["data"]["lessons"]
    for les in range(len(lessons)):
        les_name = lessons[les]["les_name"]
        les_description = lessons[les]["les_description"]
        les_number = lessons[les]["les_number"]
        lesson = Lesson(course_id=course.id, name=les_name, description=les_description, number=les_number)
        db.session.add(lesson)
        db.session.commit()
        for vid in range(len(lessons[les]["videos"])):
            video_name = lessons[les]["videos"][vid]["vid_name"]
            video_link = lessons[les]["videos"][vid]["link"]
            video = Video(lesson_id=lesson.id, name=video_name, link=video_link)
            db.session.add(video)
            db.session.commit()
    return jsonify({'status':'ok'}), 200


# Список курсов которые пользователь создал
@app.route('/api/created', methods=['POST'])
def created_courses():
    user = json.dumps({"data": request.json.get("data")}, ensure_ascii=False)
    convert = json.loads(user)
    user_id = convert["data"]["uid"]
    courses = User.query.filter_by(id=user_id).first().courses_owned.all()
    owned = []
    for el in range(len(courses)):
        owned.append({"name": courses[el].name,
                      "id": courses[el].id,
                      "description": courses[el].description,
                      "img": courses[el].img})
    result = json.dumps({"data": owned}, ensure_ascii=False)
    return flask.Response(response=result,
                          content_type='application/json; charset=utf-8',
                          mimetype='application/json')


# Подписка на курс
@app.route('/subscribe', methods=['GET', 'POST'])
def subscribe_course():
    subscription = request.get_json()
    print(subscription)
    user_id = int(subscription["data"]["user_id"])
    course_id = int(subscription["data"]["course_id"])
    user = User.query.filter_by(id=user_id).first()
    course = Course.query.filter_by(id=course_id).first()
    user.courses_subscr.append(course)
    db.session.add(user)
    db.session.commit()
    # return flask.Response(response=jsonify({'status':'ok'}, 200), content_type='application/json; charset=utf-8')
    return jsonify({'status':'ok'}), 200

@app.route('/api/view_profile', methods=['GET', 'POST'])
def view_profile():
    user_init = request.get_json()
    print(user_init)
    user_id = user_init["data"]["uid"]
    user = User.query.filter_by(id=user_id).first()
    courses = User.query.filter_by(id=user_id).first().courses_subscr
    user_data = {}
    user_data['username'] = user.nickname
    user_data['country'] = user.country
    user_data['city'] = user.city
    user_data['email'] = user.email
    # user_data['cameras'] = user.cameras.first()
    print(user.cameras)
    subscriptions = []
    for el in range(len(courses)):
        subscriptions.append({"name": courses[el].name,
                              "id": courses[el].id,
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


@app.route('/api/course_details', methods=['GET', 'POST'])
def view_course_details():
    # param = request.args.get('q')
    user_init = request.get_json()
    print(user_init)
    cid = user_init["data"]["course_id"]
    uid = user_init["data"]["user_id"]
    course = Course.query.filter_by(id=cid).first()
    course_json = {}
    course_json['id'] = course.id
    course_json['name'] = course.name
    course_json['description'] = course.description
    course_json['image'] = course.img
    course_json['cost'] = course.cost
    course_json['format'] = course.course_format
    course_json['subscribed'] = 'false'
    if uid != 'undefined':
        user_courses = User.query.filter_by(id=uid).first().courses_subscr
        for i in range(len(user_courses)):
            print(user_courses[i].id)
            if user_courses[i].id == int(cid):
                course_json['subscribed'] = 'true'
    result = json.dumps({"data": course_json}, ensure_ascii=False)
    print(result)
    return flask.Response(response=result, content_type='application/json; charset=utf-8', mimetype='application/json')


@app.route('/api/lessons', methods=['POST'])
def return_lessons():
    course_data = request.get_json()
    print(course_data)
    course_id = course_data['data']['course_id']
    lesson_number = course_data['data']['lesson_num']
    print(course_id, lesson_number)
    lessons = Lesson.query.filter_by(course_id=course_id).all()
    print('this is a lesson' + str(len(lessons)))
    videos = {}
    lesson = []
    for el in range(len(lessons)):
        if lessons[el].number == lesson_number:
            current_lesson = lessons[el]
            print(current_lesson)
            video = current_lesson.videos[0] # 0 потому что мы пока используем концепт 1 урок = 1 видео
            videos['id'] = video.id
            videos['name'] = video.name
            videos['link'] = video.link
            lesson.append({"id": current_lesson.id,
                            "name": current_lesson.name,
                            "description": current_lesson.description,
                            "videos": videos,
                            "lessons_amount": len(lessons)})
            break
    result = json.dumps({"data": lesson}, ensure_ascii=False)
    print(result)
    return flask.Response(response=result, content_type='application/json; charset=utf-8', mimetype='application/json')


@app.route('/api/plan', methods=['POST'])
def return_plan():
    course_data = request.get_json()
    print(course_data)
    id = course_data['data']['id']
    course = Course.query.filter_by(id=id).first()
    lessons_data = course.lessons
    videos = []
    lessons = []
    for lsn in range(len(lessons_data)):
        videos.append({"lesson_id": lessons_data[lsn].videos[0].lesson_id,
                       "link": lessons_data[lsn].videos[0].link})
        lessons.append({"id": lessons_data[lsn].id,
                        "name": lessons_data[lsn].name,
                        "description": lessons_data[lsn].description,
                        "video": videos[lsn]
                        })
    print(lessons)
    result = json.dumps({"data": lessons}, ensure_ascii=False)
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


@app.route('/api/create_profile', methods=['GET', 'POST'])
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
    print(user)
    user.nickname = username
    user.email = email
    user.country = country
    user.city = city
    # user.cameras = cams_nest
    # for cam in range(len(cams)):
    #     camera = Camera.query.filter_by(model=cams[cam]).first()
    #     user.cameras.append(camera)
    db.session.commit()
    return jsonify({'status':'ok'}), 200


@app.route('/logout')
def logout():
    logout_user()
    response = redirect(url_for('index'))
    response.set_cookie('user_id', '', expires=0)
    response.set_cookie('redirect', '', expires=0)
    return response


@app.route('/api/create_comment', methods=['POST'])
def create_comment():
    comment_data = request.get_json()
    user_id = comment_data['data']['user_id']
    vid_id = comment_data['data']['vid_id']
    com_text = comment_data['data']['text']
    timestamp = datetime.datetime.now()
    comment = Comment(author=user_id, text=com_text, timestamp=timestamp, vid_id=vid_id)
    db.session.add(comment)
    db.session.commit()
    return jsonify({'status':'ok'}), 200


@app.route('/api/show_comments', methods=["POST"])
def show_comments():
    lesson_data = request.get_json()
    lesson_id = lesson_data['data']['video_id'] # да видео потому что пока урок=1видео
    lesson = Lesson.query.filter_by(id=lesson_id).first()
    video = lesson.videos[0] # пока 0
    comments_data = video.comments.all()
    comments = []
    for comment in range(len(comments_data)):
        print(comments_data[comment].user.nickname)
        comments.append({"id": comments_data[comment].id,
                         "video_id": comments_data[comment].vid_id,
                         "author_id": comments_data[comment].author,
                         "author_name": comments_data[comment].user.nickname,
                         "text": comments_data[comment].text,
                         "timestamp": comments_data[comment].timestamp})
    result = json.dumps({"data": comments}, ensure_ascii=False)
    return flask.Response(response=result, content_type='application/json; charset=utf-8', mimetype='application/json')


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
        response.set_cookie('user_id', value=bytes(str(id), 'utf-8'))
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


@app.route('/partials/course')
def send_course():
    return app.send_static_file('app/static/partials/course.html')


@app.route('/partials/home')
def send_home():
    return app.send_static_file('app/static/partials/home.html')


@app.route('/partials/about')
def send_about():
    return app.send_static_file('app/static/partials/about.html')


@app.route('/partials/search')
def send_search():
    return app.send_static_file('app/static/partials/search.html')


@app.route('/partials/course_details')
def send_details():
    return app.send_static_file('app/static/partials/course_details.html')