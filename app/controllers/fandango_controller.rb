require 'typhoeus'

class FandangoController < ApplicationController
  def launch
    response.headers["X-FRAME-OPTIONS"] = "ALLOWALL"
    render :layout => false
  end
  
  def movies
    url = "http://api.fandango.com/v1/"
    opts = {
      'op' => 'moviesbycitystatesearch',
      'city' => 'Salt Lake City',
      'state' => 'Utah'
    }
    if params['zip']
      opts = {
        'op' => 'moviesbypostalcodesearch',
        'postalcode' => params['zip']
      }
    elsif params['lat'] && params['lng']
      opts = {
        'op' => 'moviesbylatlonsearch',
        'lat' => params['lat'],
        'lon' => params['lng'],
        'radius' => '20'
      }
    end
    url += query_string(opts.merge(signature))
    req = Typhoeus.get(url)
    render json: [].to_json
  end
  
  def theaters
    url = "http://api.fandango.com/v1/"
    opts = {
      'op' => 'theatersbycitystatesearch',
      'city' => 'Salt Lake City',
      'state' => 'Utah'
    }
    if params['zip']
      opts = {
        'op' => 'theatersbypostalcodesearch',
        'postalcode' => params['zip']
      }
    elsif params['lat'] && params['lng']
      opts = {
        'op' => 'theatersbylatlonsearch',
        'lat' => params['lat'],
        'lon' => params['lng'],
        'radius' => '20'
      }
    end
    url += query_string(opts.merge(signature))
    req = Typhoeus.get(url)
    render json: [].to_json
  end
  
  def showtimes
    url = "http://api.fandango.com/v1/"
    opts = {
      'op' => 'performancesbytheatersearch',
      'theaterid' => params['theater_id']
    }
    url += query_string(opts.merge(signature))
    req = Typhoeus.get(url)
    render json: [].to_json
  end
  
  protected
  def query_string(params)
    "?" + params.to_a.map{|k, v| "#{k}=#{CGI.escape(v.to_s)}" }.join('&')
  end
  
  def sha256(str)
    sha256 = OpenSSL::Digest::SHA256.new
    result = sha256.hexdigest(str)
  end
  
  def signature
    res = {}
    key = ENV['FANDANGO_KEY']
    secret = ENV['FANDANGO_SECRET']
    res['apikey'] = key
    paramsToEncode = "%s%s%s" % [key, escret, Time.now.to_i]
    encodedParams = sha256(paramsToEncode)
    res['sig'] = encodedParams
    
    return res
  end
end
