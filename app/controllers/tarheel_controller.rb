require 'typhoeus'
require 'json'

class TarheelController < ApplicationController
  def launch
    response.headers["X-FRAME-OPTIONS"] = "ALLOWALL"
    render :layout => false
  end
  
  def book
    url = "https://tarheelreader.org/book-as-json/?slug=#{CGI.escape(params['id'])}"
    tarheel_prefix = "https://d1afj2lqudmea0.cloudfront.net"
    if params['id'].match(/^http/)
      url = params['id']
    end
    res = Typhoeus.get(url)
    if res.headers['Location']
      res = Typhoeus.get(res.headers['Location'])
    end
    results = JSON.parse(res.body)
    render json: results.to_json
  end
end
