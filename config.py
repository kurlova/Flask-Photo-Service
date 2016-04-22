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
        'id': '1522300574742943',
        'secret': '5633207a0f69164ec817bf8c80ff794d'
    },
    'vkontakte': {
        'id': '5356466',
        'secret': 'HItjnrMuiFJaRAhzbbIJ'
    },
    'google': {
            'id': '486274894648-aapkse42usip95n5c3uvp9enockq1fh2.apps.googleusercontent.com',
            'secret': '5bQ4cWS-36QT5fCEFe-1hPt8'
    },
    'twitter': {
        'id': '6a5SurCSNVyT2XdbE8I9MaAmm',
        'secret': 'a4sSfbsoICYsdgpv1bpr4iE1Gj45RoVG7wDfWZGemD1PABc9KF'
    },
}
SESSION_TYPE = 'filesystem'