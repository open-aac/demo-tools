require 'typhoeus'

class FandangoController < ApplicationController
  def launch
    response.headers["X-FRAME-OPTIONS"] = "ALLOWALL"
    render :layout => false
  end
  
  # http://data.tmsapi.com/v1.1/movies/9128357/showings?startDate=2012-12-08&api_key=1234567890
  def movies
#     url = "http://api.fandango.com/v1/"
    url = "http://data.tmsapi.com/v1.1/movies/showings"
#     opts = {
#       'op' => 'moviesbycitystatesearch',
#       'city' => 'Salt Lake City',
#       'state' => 'Utah'
#     }
    opts = {
      'startDate' => Date.today.to_s,
      'imageText' => true,
      'numDays' => 7
    }
    key = nil
    if params['zip']
      opts['zip'] = params['zip']
      key = "movies_#{opts['startDate']}_#{params['zip'].to_s}"
#       opts = {
#         'op' => 'moviesbypostalcodesearch',
#         'postalcode' => params['zip']
#       }
    elsif params['lat'] && params['lng']
      key = "movies_#{opts['startDate']}_#{params['lat'].to_s}_#{params['lng'].to_s}"
      opts = {
#         'op' => 'moviesbylatlonsearch',
        'lat' => params['lat'],
        'lon' => params['lng'],
        'radius' => '20'
      }
    else
      key = "movies_#{opts['startDate']}_84119"
      opts['zip'] = '84119'
    end
    cr = CachedRequest.find_or_create_by(:query_key => key)
    body = cr && cr.response_text
    json = nil
    if body
      json = JSON.parse(body) rescue nil
    else
      url += query_string(opts.merge(signature))
      req = Typhoeus.get(url)
      json = JSON.parse(req.body) rescue nil
      if json
        cr.response_text = req.body
        cr.save
      end
    end
    res = {
      'movies' => [],
      'theaters' => [],
      'showtimes' => {}
    }
    theaters = {}
    if json
      json.each do |movie|
        res['movies'] << {
          'title' => movie['title'],
          'image' => "https://ondemo.tmsimg.com/#{movie["preferredImage"]["uri"]}",
          'id' => movie["tmsId"],
          'cast' => movie['topCast'],
          'description' => movie["shortDescription"],
          'theater_ids' => movie['showtimes'].map{|s| s['theatre']['id'] }.uniq,
          'rating' => ((movie['ratings'] || []).detect{|r| r['body'] == "Motion Picture Association of America"} || {})['code'] || 'unknown'
        }
        movie['showtimes'].each do |showtime|
          theaters[showtime['theatre']['id']] ||= showtime['theatre']
          res['showtimes'][showtime['theatre']['id']] ||= {}
          res['showtimes'][showtime['theatre']['id']][movie['tmsId']] ||= []
          res['showtimes'][showtime['theatre']['id']][movie['tmsId']] << {
            'showtime' => showtime['dateTime']
          }
        end
      end
    end
    theaters.each do |id, theater|
      res['theaters'] << theater
    end
    
    render json: res
  end
  
#   def theaters
# #     url = "http://api.fandango.com/v1/"
#     url = "http://data.tmsapi.com/v1.1/theaters"
#     opts = {}
# #     opts = {
# #       'op' => 'theatersbycitystatesearch',
# #       'city' => 'Salt Lake City',
# #       'state' => 'Utah'
# #     }
#     if params['zip']
#       opts = {
#         'zip' => params['zip']
#       }
#     elsif params['lat'] && params['lng']
#       opts = {
#         'lat' => params['lat'],
#         'lon' => params['lng'],
#         'radius' => '20'
#       }
#     else
#       opts = {
#         'zip' => '84119'
#       }
#     end
#     url += query_string(opts.merge(signature))
#     req = Typhoeus.get(url)
#     json = JSON.parse(req.body) rescue nil
#     res = []
#     if json
#       json.each do |theater|
#         res << {
#           'name' => theater['name'],
#           'id' => theater['theatreId']
#         }
#       end
#     end
#     render json: res
#   end
  
#   def showtimes
#     url = "http://api.fandango.com/v1/"
#     opts = {
#       'op' => 'performancesbytheatersearch',
#       'theaterid' => params['theater_id']
#     }
#     url += query_string(opts.merge(signature))
#     req = Typhoeus.get(url)
#     render json: [].to_json
#   end
  
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
    res['api_key'] = ENV['GRACENOTE_KEY']
    return res
#     key = ENV['FANDANGO_KEY']
#     secret = ENV['FANDANGO_SECRET']
#     res['apikey'] = key
#     paramsToEncode = "%s%s%s" % [key, secret, Time.now.to_i]
#     encodedParams = sha256(paramsToEncode)
#     res['sig'] = encodedParams
#     
#     return res
  end
end
