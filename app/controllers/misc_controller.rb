class MiscController < ApplicationController
  def calc
  end

  def shim
    redirect_to ActionController::Base.helpers.asset_path("aac_shim.js")
  end
end
