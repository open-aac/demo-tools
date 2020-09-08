require 'typhoeus'
require 'json'

class TarheelController < ApplicationController
  def launch
    response.headers["X-FRAME-OPTIONS"] = "ALLOWALL"
    render :layout => false
  end
  
  def book
    cross_origin
    id = params['id']
    # slug = AccessibleBooks.tarheel_id(id)
    
    # id = slug if slug
    # url = "https://tarheelreader.org/book-as-json/?slug=#{CGI.escape(id)}"
    if !id.match(/^http/)
      id = "https://tarheelreader.org/1234/11/12/#{id}/0"
    end
    results = AccessibleBooks.find_json(id)
    if params['user_state_code'] && results
      state = UserState.find_by(:user_code => params['user_state_code'])
      results['user_state'] = JSON.parse(state.state) rescue nil
    end
    if results['image_url'] && results['image_url'].match(/tarheelreader/)
      results['pages'][0]['image_url'] = results['image_url']
    end
    render json: results.to_json
  end 
end
