from flask import json
from flask.ext.login import UserMixin
from app import db, lm


users_courses_relationship = db.Table('users_courses_relationship',
                                      db.Column('user_id', db.Integer, db.ForeignKey('users.id')),
                                      db.Column('course_id', db.Integer, db.ForeignKey('courses.id')),
                                      db.PrimaryKeyConstraint('user_id', 'course_id')
                                      )


class UsersCoursesRelationship():
    def __init__(self, user_id, course_id):
        self.user_id = user_id
        self.course_id = course_id


db.mapper(UsersCoursesRelationship, users_courses_relationship)


class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    social_id = db.Column(db.String(64), nullable=False) #ids for oAuth
    nickname = db.Column(db.String(64), nullable=False)
    email = db.Column(db.String(64), nullable=True)
    country = db.Column(db.String(64), nullable=True)
    city = db.Column(db.String(64), nullable=True)
    org_name = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=True)
    courses_owned = db.relationship('Course', backref='creator', lazy='dynamic')
    courses_subscr = db.relationship('Course', secondary=users_courses_relationship, backref='users')


    def __repr__(self):
        return '<User number %r>' % self.id

    def to_json(self):
        return json.loads(json.dumps({"id": self.id,
                                      "nickname": self.nickname,
                                      "email" : self.email,
                                      "city" : self.city if self.city else ""}, ensure_ascii=False))

@lm.user_loader
def load_user(id):
    return User.query.get(int(id))


class Course(db.Model):
    __tablename__ = 'courses'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=False)
    img = db.Column(db.String(128), nullable=True)
    org_name = db.Column(db.Integer, db.ForeignKey('organizations.name'))
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'))


class Organization(db.Model):
    __tablename__ = 'organizations'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), unique=True)
    website = db.Column(db.String(64), nullable=True)
    country = db.Column(db.String(64), nullable=True)
    city = db.Column(db.String(64), nullable=True)
    creator = db.relationship('User', backref='creator', lazy='dynamic')
    courses = db.relationship('Course', backref='courses', lazy='dynamic')
    type = db.Column(db.String, db.ForeignKey('types.type'))


class OrganizationType(db.Model):
    __tablename__ = 'types'
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(30))





