require 'json'
class StatesController < ApplicationController
  def get
  end
  
  def update
    json = JSON.parse(request.body.read)
    json.delete('authenticity_token')
    state = UserState.find_or_create_by(user_code: params['code'])
    
    state.state = json.to_json
    state.save
    render json: {saved: true}
  end
end
