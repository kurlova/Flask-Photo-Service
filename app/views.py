from app import app, db
from app.forms import ProfileForm
from app.models import User, Course
from app.oauth import OAuthSignIn
from flask import render_template, redirect, url_for, flash, request, jsonify
from flask.ext.login import current_user, login_user, logout_user


@app.route('/')
@app.route('/index')
def index():
    word = 'Helloy'
    return render_template('index.html', word=word)

@app.route('/search')
def search():
    courses = Course.query.all()
    courses_strg = []
    for el in range(len(courses)):
        courses_strg.append({"id": courses[el].id,
                            "name": courses[el].name,
                            "description": courses[el].description,
                            })
    return jsonify({"data": courses_strg})


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
