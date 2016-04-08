from flask.ext.login import LoginManager, UserMixin
from app import db, lm


class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    social_id = db.Column(db.String(64), nullable=False) #ids for oAuth
    nickname = db.Column(db.String(64), nullable=False)
    email = db.Column(db.String(64), nullable=True)
    country = db.Column(db.String(64), nullable=True)
    city = db.Column(db.String(64), nullable=True)

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