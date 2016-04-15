from flask.ext.login import UserMixin
from app import db, lm


class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    social_id = db.Column(db.String(64), nullable=False) #ids for oAuth
    nickname = db.Column(db.String(64), nullable=False)
    email = db.Column(db.String(64), nullable=True)
    country = db.Column(db.String(64), nullable=True)
    city = db.Column(db.String(64), nullable=True)
    org_name = db.Column(db.Integer, db.ForeignKey('organizations.name'), nullable=True)

    def __repr__(self):
        return '<User number %r>' % self.id


@lm.user_loader
def load_user(id):
    return User.query.get(int(id))


class Course(db.Model):
    __tablename__ = 'coursers'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=False)
    img = db.Column(db.String(128), nullable=True)
    org_name = db.Column(db.Integer, db.ForeignKey('organizations.name'))


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


