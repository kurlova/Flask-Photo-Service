import os


basedir = os.path.abspath(os.path.dirname(__file__))
SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(basedir, 'app.db') # is required by the Flask-SQLAlchemy extension.
                                                                         # This is the path of our database file.
SQLALCHEMY_MIGRATE_REPO = os.path.join(basedir, 'migrate_repository') #is the folder where we will store
                                                                      # the SQLAlchemy-migrate data files.
WTF_CSRF_ENABLED = True
SECRET_KEY = 'you-will-never-guess'

OAUTH_CREDENTIALS = {
    'facebook': {
        'id': '',
        'secret': ''
    },
    'vkontakte': {
        'id': '',
        'secret': ''
    },
    'google': {
            'id': '',
            'secret': ''
    },
    'twitter': {
        'id': '',
        'secret': ''
    },
}
SESSION_TYPE = 'filesystem'
