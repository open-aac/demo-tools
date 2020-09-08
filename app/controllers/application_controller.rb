class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  def cross_origin
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Request-Method'] = 'GET OPTIONS'
    response.headers.except! 'X-Frame-Options'
  end

end
