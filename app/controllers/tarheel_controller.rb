require 'typhoeus'
require 'json'

class TarheelController < ApplicationController
  def launch
    response.headers["X-FRAME-OPTIONS"] = "ALLOWALL"
    render :layout => false
  end
  
  def book
    id = params['id']
    slug = ((id || '').match(/https?:\/\/tarheelreader\.org\/\d+\/\d+\/\d+\/([^\/]+)\/?/) || [])[1]
    
    id = slug if slug
    url = "https://tarheelreader.org/book-as-json/?slug=#{CGI.escape(id)}"
    if id.match(/^http/)
      url = params['id']
    end
    res = Typhoeus.get(url)
    if res.headers['Location']
      res = Typhoeus.get(res.headers['Location'])
    end
    results = JSON.parse(res.body)
    if params['user_state_code']
      state = UserState.find_by(:user_code => params['user_state_code'])
      results['user_state'] = JSON.parse(state.state) rescue nil
    end
    render json: results.to_json
  end
end
