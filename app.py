from flask import Flask, render_template,  request, redirect
#from flask_cors import CORS, cross_origin
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import sessionmaker
from datetime import datetime 

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///scores.db'
db = SQLAlchemy(app)

class Rankings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    player_score = db.Column(db.Integer,nullable=False)
    player_name = db.Column(db.String(12),nullable=False) 
    date_created = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return '<Scored %r>' % self.id

@app.route('/',methods=['GET','POST'])
#@cross_origin() prevent CORS error
def index():    
    if request.method == "POST":
        # process JSON 
        player_content = request.get_json() 
        name = player_content['playerName']
        score = int (player_content['score'].split()[0])

        # check
        #print("Name of the player : {}; score {}: ".format(name,score))

        # new entry
        new_player = Rankings(player_name=name,player_score=score)

        # add
        db.session.add(new_player)
        db.session.commit()


        return render_template('tetris.html')
        
    else:    
        return render_template('tetris.html') 


@app.route('/rankings/',methods=['GET'])
def rankings():

    scores = Rankings.query.order_by(Rankings.player_score.desc()).all() #

    #cheking
    #for entry in scores:
        #print("Name of the player = {}; score = {}; date {} ".format(entry.player_name,entry.player_score,entry.date_created))

    return render_template('rankings.html', scores=scores)   

if __name__ == "__main__":
    app.run(debug=True)